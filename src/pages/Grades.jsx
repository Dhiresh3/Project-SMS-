import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { getStudents, getCourses, getGrades, saveGrade, deleteGrade } from '../api/api';
import './Page.css';

const gradeColor = (g) => {
  if (!g) return 'badge-gray';
  if (g.startsWith('A')) return 'badge-green';
  if (g.startsWith('B')) return 'badge-blue';
  if (g.startsWith('C')) return 'badge-yellow';
  return 'badge-red';
};

export default function Grades() {
  const [grades, setGrades]     = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [filter, setFilter]     = useState({ student_id: '', course_id: '' });
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ student_id: '', course_id: '', marks: '', grade: '', remarks: '' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [g, s, c] = await Promise.all([
        getGrades(filter.student_id || filter.course_id ? filter : {}),
        getStudents(), getCourses()
      ]);
      setGrades(g.data); setStudents(s.data); setCourses(c.data);
    } catch { setMsg('❌ Failed to load grades'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  // Auto-calculate grade from marks
  const calcGrade = (marks) => {
    const m = parseFloat(marks);
    if (isNaN(m)) return '';
    if (m >= 90) return 'A+';
    if (m >= 80) return 'A';
    if (m >= 70) return 'B+';
    if (m >= 60) return 'B';
    if (m >= 50) return 'C';
    if (m >= 40) return 'D';
    return 'F';
  };

  const handleMarksChange = (val) => {
    setForm(f => ({ ...f, marks: val, grade: calcGrade(val) }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await saveGrade(form);
      setMsg('✅ Grade saved!');
      setModal(false); load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error saving grade'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade record?')) return;
    try { await deleteGrade(id); setMsg('✅ Grade deleted'); load(); }
    catch { setMsg('❌ Delete failed'); }
  };

  const displayed = grades.filter(g =>
    (!filter.student_id || String(g.student_id) === filter.student_id) &&
    (!filter.course_id  || String(g.course_id)  === filter.course_id)
  );
  const avgMarks = displayed.length
    ? (displayed.reduce((s, g) => s + (g.marks || 0), 0) / displayed.length).toFixed(1)
    : '—';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Grades</h1>
          <p>{displayed.length} record{displayed.length !== 1 ? 's' : ''} · Avg: <strong>{avgMarks}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setForm({ student_id: '', course_id: '', marks: '', grade: '', remarks: '' });
          setModal(true);
        }}>+ Assign Grade</button>
      </div>

      {msg && <div className={`toast ${msg.startsWith('✅') ? 'toast-ok' : 'toast-err'}`} onClick={() => setMsg('')}>{msg}</div>}

      <div className="toolbar">
        <select className="filter-select" value={filter.student_id}
          onChange={e => setFilter({ ...filter, student_id: e.target.value })}>
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="filter-select" value={filter.course_id}
          onChange={e => setFilter({ ...filter, course_id: e.target.value })}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
        </select>
        {(filter.student_id || filter.course_id) &&
          <button className="btn btn-outline btn-sm" onClick={() => setFilter({ student_id: '', course_id: '' })}>Clear</button>}
      </div>

      {loading ? <div className="page-loading">Loading…</div> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Student</th><th>Course</th><th>Marks</th><th>Grade</th><th>Remarks</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No grade records found</td></tr>
              ) : displayed.map(g => (
                <tr key={g.id}>
                  <td><strong>{g.student_name}</strong></td>
                  <td><span className="badge badge-blue">{g.code}</span> {g.course_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', width: 80, height: 8 }}>
                        <div style={{ background: '#3b82f6', width: `${g.marks || 0}%`, height: '100%' }}></div>
                      </div>
                      <span style={{ fontWeight: 600 }}>{g.marks ?? '—'}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${gradeColor(g.grade)}`}>{g.grade || '—'}</span></td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{g.remarks || '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => {
                      setForm({
                        student_id: g.student_id, course_id: g.course_id,
                        marks: g.marks || '', grade: g.grade || '', remarks: g.remarks || ''
                      });
                      setModal(true);
                    }}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g.id)}>🗑️ Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Assign / Update Grade" onClose={() => setModal(false)}>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Student *</label>
              <select required value={form.student_id}
                onChange={e => setForm({ ...form, student_id: e.target.value })}>
                <option value="">— Select student —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Course *</label>
              <select required value={form.course_id}
                onChange={e => setForm({ ...form, course_id: e.target.value })}>
                <option value="">— Select course —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
              </select>
            </div>
            <div className="form-2col">
              <div className="form-row">
                <label>Marks (0–100)</label>
                <input type="number" min="0" max="100" step="0.01"
                  placeholder="e.g. 85" value={form.marks}
                  onChange={e => handleMarksChange(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Grade (auto-filled)</label>
                <input placeholder="A+/A/B+…" value={form.grade}
                  onChange={e => setForm({ ...form, grade: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <label>Remarks</label>
              <textarea rows={2} placeholder="Optional remarks" value={form.remarks}
                onChange={e => setForm({ ...form, remarks: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Grade'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

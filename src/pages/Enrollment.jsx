import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { getStudents, getCourses, getEnrollments, enrollStudent, unenrollStudent } from '../api/api';
import './Page.css';

export default function Enrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents]       = useState([]);
  const [courses, setCourses]         = useState([]);
  const [filter, setFilter]           = useState({ student: '', course: '' });
  const [modal, setModal]             = useState(false);
  const [form, setForm]               = useState({ student_id: '', course_id: '' });
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [e, s, c] = await Promise.all([getEnrollments(), getStudents(), getCourses()]);
      setEnrollments(e.data); setStudents(s.data); setCourses(c.data);
    } catch { setMsg('❌ Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = enrollments.filter(e =>
    (!filter.student || String(e.student_id) === filter.student) &&
    (!filter.course  || String(e.course_id)  === filter.course)
  );

  const handleEnroll = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await enrollStudent(form);
      setMsg('✅ Student enrolled!');
      setModal(false); setForm({ student_id: '', course_id: '' }); load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Enroll failed'));
    } finally { setSaving(false); }
  };

  const handleUnenroll = async (id, name, course) => {
    if (!window.confirm(`Unenroll ${name} from ${course}?`)) return;
    try { await unenrollStudent(id); setMsg('✅ Unenrolled'); load(); }
    catch { setMsg('❌ Unenroll failed'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Enrollment</h1>
          <p>{filtered.length} enrollment{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Enroll Student</button>
      </div>

      {msg && <div className={`toast ${msg.startsWith('✅') ? 'toast-ok' : 'toast-err'}`} onClick={() => setMsg('')}>{msg}</div>}

      <div className="toolbar">
        <select className="filter-select" value={filter.student}
          onChange={e => setFilter({ ...filter, student: e.target.value })}>
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="filter-select" value={filter.course}
          onChange={e => setFilter({ ...filter, course: e.target.value })}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
        </select>
        {(filter.student || filter.course) &&
          <button className="btn btn-outline btn-sm" onClick={() => setFilter({ student: '', course: '' })}>Clear</button>}
      </div>

      {loading ? <div className="page-loading">Loading…</div> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Student</th><th>Course</th><th>Code</th><th>Enrolled On</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No enrollments found</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id}>
                  <td><span className="id-badge">#{e.id}</span></td>
                  <td><strong>{e.student_name}</strong></td>
                  <td>{e.course_name}</td>
                  <td><span className="badge badge-blue">{e.course_code}</span></td>
                  <td>{new Date(e.enrolled_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button className="btn btn-sm btn-danger"
                      onClick={() => handleUnenroll(e.id, e.student_name, e.course_name)}>
                      🗑️ Unenroll
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Enroll Student" onClose={() => setModal(false)}>
          <form className="form" onSubmit={handleEnroll}>
            <div className="form-row">
              <label>Student *</label>
              <select required value={form.student_id}
                onChange={e => setForm({ ...form, student_id: e.target.value })}>
                <option value="">— Select student —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>)}
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
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Enrolling…' : 'Enroll'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

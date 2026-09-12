import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { getStudents, getCourses, getAttendance, markAttendance, updateAttendance, deleteAttendance } from '../api/api';
import './Page.css';

const STATUS_BADGE = { Present: 'badge-green', Absent: 'badge-red', Late: 'badge-yellow' };

export default function Attendance() {
  const [records, setRecords]   = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [filter, setFilter]     = useState({ student_id: '', course_id: '' });
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ student_id: '', course_id: '', date: '', status: 'Present' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [a, s, c] = await Promise.all([
        getAttendance(filter.student_id || filter.course_id ? filter : {}),
        getStudents(), getCourses()
      ]);
      setRecords(a.data); setStudents(s.data); setCourses(c.data);
    } catch { setMsg('❌ Failed to load attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const applyFilter = () => load();

  const handleMark = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await markAttendance(form);
      setMsg('✅ Attendance marked!');
      setModal(false); setForm({ student_id: '', course_id: '', date: '', status: 'Present' }); load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error marking attendance'));
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAttendance(id, { status });
      setMsg('✅ Status updated');
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch { setMsg('❌ Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try { await deleteAttendance(id); setMsg('✅ Record deleted'); load(); }
    catch { setMsg('❌ Delete failed'); }
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount  = records.filter(r => r.status === 'Absent').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>
            <span className="badge badge-green" style={{ marginRight: 8 }}>{presentCount} Present</span>
            <span className="badge badge-red"   style={{ marginRight: 8 }}>{absentCount} Absent</span>
            <span className="badge badge-gray">{records.length} Total</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Mark Attendance</button>
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
        <button className="btn btn-primary btn-sm" onClick={applyFilter}>Apply</button>
        <button className="btn btn-outline btn-sm" onClick={() => { setFilter({ student_id: '', course_id: '' }); }}>Clear</button>
      </div>

      {loading ? <div className="page-loading">Loading…</div> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Student</th><th>Course</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">No attendance records found</td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString('en-IN')}</td>
                  <td><strong>{r.student_name}</strong></td>
                  <td><span className="badge badge-blue">{r.code}</span> {r.course_name}</td>
                  <td>
                    <select
                      className="status-select"
                      value={r.status}
                      onChange={e => handleStatusChange(r.id, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: 6,
                        border: '1px solid #e2e8f0', fontSize: 13,
                        background: r.status === 'Present' ? '#dcfce7' : r.status === 'Absent' ? '#fee2e2' : '#fef9c3',
                        color:      r.status === 'Present' ? '#15803d' : r.status === 'Absent' ? '#dc2626' : '#a16207',
                        fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <option>Present</option>
                      <option>Absent</option>
                      <option>Late</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>🗑️ Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Mark Attendance" onClose={() => setModal(false)}>
          <form className="form" onSubmit={handleMark}>
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
                <label>Date *</label>
                <input type="date" required value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Present</option><option>Absent</option><option>Late</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Mark Attendance'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api/api';
import './Page.css';

const EMPTY = { name: '', email: '', phone: '', dob: '', gender: '', address: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  const load = () => {
    setLoading(true);
    getStudents()
      .then(r => { setStudents(r.data); setFiltered(r.data); })
      .catch(() => setMsg('❌ Failed to load students'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      String(s.id).includes(q)
    ));
  }, [search, students]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s, dob: s.dob?.slice(0,10) || '' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateStudent(editing.id, form);
      else         await createStudent(form);
      setMsg(editing ? '✅ Student updated!' : '✅ Student added!');
      closeModal(); load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error saving student'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"? This also removes their enrollments, grades & attendance.`)) return;
    try {
      await deleteStudent(id);
      setMsg(' Student deleted');
      load();
    } catch { setMsg(' Delete failed'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>{filtered.length} student{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
      </div>

      {msg && <div className={`toast ${msg.startsWith('✅') ? 'toast-ok' : 'toast-err'}`} onClick={() => setMsg('')}>{msg}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="  Search by name, email or ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <div className="page-loading">Loading…</div> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th>
                <th>Phone</th><th>Gender</th><th>DOB</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-row">No students found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="id-badge">#{s.id}</span></td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.email}</td>
                  <td>{s.phone || '—'}</td>
                  <td>{s.gender ? <span className={`badge badge-${s.gender === 'Male' ? 'blue' : 'pink'}`}>{s.gender}</span> : '—'}</td>
                  <td>{s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger"  onClick={() => handleDelete(s.id, s.name)}>🗑️ Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Student' : 'Add Student'} onClose={closeModal}>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Full Name *</label>
              <input required placeholder="e.g. Aarav Sharma" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Email *</label>
              <input required type="email" placeholder="email@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-2col">
              <div className="form-row">
                <label>Phone</label>
                <input placeholder="9876543210" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Date of Birth</label>
                <input type="date" value={form.dob}
                  onChange={e => setForm({ ...form, dob: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <label>Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-row">
              <label>Address</label>
              <textarea rows={2} placeholder="City, State" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
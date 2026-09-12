import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api/api';
import './Page.css';

const EMPTY = { code: '', name: '', description: '', credits: 3, instructor: '' };

export default function Courses() {
  const [courses, setCourses]   = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  const load = () => {
    setLoading(true);
    getCourses()
      .then(r => setCourses(r.data))
      .catch(() => setMsg('❌ Failed to load courses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.instructor || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateCourse(editing.id, form);
      else         await createCourse(form);
      setMsg(editing ? '✅ Course updated!' : '✅ Course added!');
      closeModal(); load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error saving course'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete course "${name}"?`)) return;
    try { await deleteCourse(id); setMsg('✅ Course deleted'); load(); }
    catch { setMsg('❌ Delete failed'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>{filtered.length} course{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
      </div>

      {msg && <div className={`toast ${msg.startsWith('✅') ? 'toast-ok' : 'toast-err'}`} onClick={() => setMsg('')}>{msg}</div>}

      <div className="toolbar">
        <input className="search-input" placeholder="🔍  Search courses…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="page-loading">Loading…</div> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Code</th><th>Course Name</th><th>Description</th><th>Credits</th><th>Instructor</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No courses found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td><span className="badge badge-blue">{c.code}</span></td>
                  <td><strong>{c.name}</strong></td>
                  <td style={{ maxWidth: 200, color: '#64748b', fontSize: 13 }}>{c.description || '—'}</td>
                  <td><span className="badge badge-gray">{c.credits} cr</span></td>
                  <td>{c.instructor || '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger"  onClick={() => handleDelete(c.id, c.name)}>🗑️ Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Course' : 'Add Course'} onClose={closeModal}>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-2col">
              <div className="form-row">
                <label>Course Code *</label>
                <input required placeholder="e.g. CS101" value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="form-row">
                <label>Credits</label>
                <input type="number" min="1" max="10" value={form.credits}
                  onChange={e => setForm({ ...form, credits: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <label>Course Name *</label>
              <input required placeholder="e.g. Data Structures" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea rows={2} placeholder="Brief course description" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Instructor</label>
              <input placeholder="e.g. Dr. Verma" value={form.instructor}
                onChange={e => setForm({ ...form, instructor: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Course'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

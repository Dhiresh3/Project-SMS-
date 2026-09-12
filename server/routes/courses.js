const router = require('express').Router();
const db = require('../db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM courses ORDER BY code');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { code, name, description, credits, instructor } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Code and name are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO courses (code, name, description, credits, instructor) VALUES (?,?,?,?,?)',
      [code, name, description || null, credits || 3, instructor || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Course created' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Course code already exists' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  const { code, name, description, credits, instructor } = req.body;
  try {
    await db.query(
      'UPDATE courses SET code=?, name=?, description=?, credits=?, instructor=? WHERE id=?',
      [code, name, description || null, credits || 3, instructor || null, req.params.id]
    );
    res.json({ message: 'Course updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Course deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

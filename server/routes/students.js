const router = require('express').Router();
const db = require('../db');

// GET all students
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create student
router.post('/', async (req, res) => {
  const { name, email, phone, dob, gender, address } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO students (name, email, phone, dob, gender, address) VALUES (?,?,?,?,?,?)',
      [name, email, phone || null, dob || null, gender || null, address || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Student created' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: e.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  const { name, email, phone, dob, gender, address } = req.body;
  try {
    await db.query(
      'UPDATE students SET name=?, email=?, phone=?, dob=?, gender=?, address=? WHERE id=?',
      [name, email, phone || null, dob || null, gender || null, address || null, req.params.id]
    );
    res.json({ message: 'Student updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

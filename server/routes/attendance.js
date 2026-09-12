const router = require('express').Router();
const db = require('../db');

// GET attendance (optionally filter by student or course)
router.get('/', async (req, res) => {
  const { student_id, course_id } = req.query;
  try {
    let sql = `
      SELECT a.id, a.date, a.status,
             s.name AS student_name, s.id AS student_id,
             c.name AS course_name,  c.id AS course_id, c.code
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN courses  c ON a.course_id  = c.id
      WHERE 1=1
    `;
    const params = [];
    if (student_id) { sql += ' AND a.student_id = ?'; params.push(student_id); }
    if (course_id)  { sql += ' AND a.course_id = ?';  params.push(course_id); }
    sql += ' ORDER BY a.date DESC, s.name';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST mark attendance
router.post('/', async (req, res) => {
  const { student_id, course_id, date, status } = req.body;
  if (!student_id || !course_id || !date) return res.status(400).json({ error: 'student_id, course_id and date required' });
  try {
    const [result] = await db.query(
      'INSERT INTO attendance (student_id, course_id, date, status) VALUES (?,?,?,?)',
      [student_id, course_id, date, status || 'Present']
    );
    res.status(201).json({ id: result.insertId, message: 'Attendance marked' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update attendance
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE attendance SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ message: 'Attendance updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE attendance record
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ message: 'Attendance deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

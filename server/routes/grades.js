const router = require('express').Router();
const db = require('../db');

// GET all grades with names
router.get('/', async (req, res) => {
  const { student_id, course_id } = req.query;
  try {
    let sql = `
      SELECT g.id, g.marks, g.grade, g.remarks, g.updated_at,
             s.id AS student_id, s.name AS student_name,
             c.id AS course_id, c.name AS course_name, c.code
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN courses  c ON g.course_id  = c.id
      WHERE 1=1
    `;
    const params = [];
    if (student_id) { sql += ' AND g.student_id = ?'; params.push(student_id); }
    if (course_id)  { sql += ' AND g.course_id = ?';  params.push(course_id); }
    sql += ' ORDER BY s.name, c.code';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST assign/update grade (upsert)
router.post('/', async (req, res) => {
  const { student_id, course_id, marks, grade, remarks } = req.body;
  if (!student_id || !course_id) return res.status(400).json({ error: 'student_id and course_id required' });
  try {
    await db.query(`
      INSERT INTO grades (student_id, course_id, marks, grade, remarks)
      VALUES (?,?,?,?,?)
      ON DUPLICATE KEY UPDATE marks=VALUES(marks), grade=VALUES(grade), remarks=VALUES(remarks)
    `, [student_id, course_id, marks || null, grade || null, remarks || null]);
    res.status(201).json({ message: 'Grade saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE grade
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM grades WHERE id = ?', [req.params.id]);
    res.json({ message: 'Grade deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

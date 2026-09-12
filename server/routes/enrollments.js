const router = require('express').Router();
const db = require('../db');

// GET all enrollments with student + course names
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.student_id, e.course_id, e.enrolled_at,
             s.name AS student_name, c.name AS course_name, c.code AS course_code
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses  c ON e.course_id  = c.id
      ORDER BY e.enrolled_at DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET enrollments for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, c.id AS course_id, c.code, c.name, c.credits, c.instructor
      FROM enrollments e JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ?`, [req.params.studentId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST enroll student
router.post('/', async (req, res) => {
  const { student_id, course_id } = req.body;
  if (!student_id || !course_id) return res.status(400).json({ error: 'student_id and course_id are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES (?,?)',
      [student_id, course_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Enrolled successfully' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Already enrolled' });
    res.status(500).json({ error: e.message });
  }
});

// DELETE unenroll
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM enrollments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Unenrolled successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

5const router = require('express').Router();
const db = require('../db');

router.get('/stats', async (_req, res) => {
  try {
    const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) AS totalStudents FROM students');
    const [[{ totalCourses }]]  = await db.query('SELECT COUNT(*) AS totalCourses  FROM courses');
    const [[{ totalEnrollments }]] = await db.query('SELECT COUNT(*) AS totalEnrollments FROM enrollments');
    const [[{ avgMarks }]]      = await db.query('SELECT ROUND(AVG(marks),1) AS avgMarks FROM grades WHERE marks IS NOT NULL');

    // Attendance summary
    const [[{ presentCount }]] = await db.query(`SELECT COUNT(*) AS presentCount FROM attendance WHERE status='Present'`);
    const [[{ totalAttendance }]] = await db.query('SELECT COUNT(*) AS totalAttendance FROM attendance');
    const attendancePct = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Top 5 students by avg marks
    const [topStudents] = await db.query(`
      SELECT s.name, ROUND(AVG(g.marks),1) AS avg_marks
      FROM grades g JOIN students s ON g.student_id = s.id
      GROUP BY g.student_id, s.name
      ORDER BY avg_marks DESC LIMIT 5
    `);

    // Enrollment per course
    const [courseEnrollment] = await db.query(`
      SELECT c.name AS course, COUNT(e.id) AS count
      FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, c.name ORDER BY count DESC
    `);

    res.json({ totalStudents, totalCourses, totalEnrollments, avgMarks, attendancePct, topStudents, courseEnrollment });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/api';
import './Dashboard.css';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-icon" style={{ background: color + '20', color }}>{icon}</div>
    <div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => setError('Failed to load stats. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard…</div>;
  if (error)   return <div className="page-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to Student Management System</p>
      </div>

      <div className="stat-grid">
        <StatCard icon="🎓" label="Total Students"   value={stats.totalStudents}   color="#3b82f6" />
        <StatCard icon="📚" label="Total Courses"    value={stats.totalCourses}    color="#8b5cf6" />
        <StatCard icon="📋" label="Enrollments"      value={stats.totalEnrollments} color="#10b981" />
        <StatCard icon="⭐" label="Avg Marks"        value={stats.avgMarks}        color="#f59e0b" />
        <StatCard icon="✅" label="Attendance %"     value={`${stats.attendancePct}%`} color="#06b6d4" />
      </div>

      <div className="dash-tables">
        <div className="dash-card">
          <h3>🏆 Top Students by Marks</h3>
          <table className="table">
            <thead><tr><th>#</th><th>Student</th><th>Avg Marks</th></tr></thead>
            <tbody>
              {stats.topStudents.map((s, i) => (
                <tr key={i}>
                  <td><span className="rank">{i + 1}</span></td>
                  <td>{s.name}</td>
                  <td><span className="badge badge-blue">{s.avg_marks}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dash-card">
          <h3>📚 Enrollment per Course</h3>
          <table className="table">
            <thead><tr><th>Course</th><th>Students</th></tr></thead>
            <tbody>
              {stats.courseEnrollment.map((c, i) => (
                <tr key={i}>
                  <td>{c.course}</td>
                  <td>
                    <div className="bar-wrap">
                      <div className="bar" style={{ width: `${Math.min(c.count * 20, 100)}%` }}></div>
                      <span>{c.count}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

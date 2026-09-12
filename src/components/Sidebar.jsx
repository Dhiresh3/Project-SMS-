import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const links = [
  { to: '/',           label: '📊 Dashboard'  },
  { to: '/students',   label: '🎓 Students'   },
  { to: '/courses',    label: '📚 Courses'    },
  { to: '/enrollment', label: '📋 Enrollment' },
  { to: '/attendance', label: '✅ Attendance' },
  { to: '/grades',     label: '🏆 Grades'     },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🎓</span>
        <span className="brand-text">SMS</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">Student Management System</div>
    </aside>
  );
}

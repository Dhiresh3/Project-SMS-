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
      <div className="sidebar-footer">
        <button 
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          style={{
            background: 'none', border: 'none', color: '#ef4444', 
            cursor: 'pointer', width: '100%', padding: '10px', 
            fontWeight: 600, fontSize: '14px', marginTop: '10px',
            borderRadius: '8px', transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

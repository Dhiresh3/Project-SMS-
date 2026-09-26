import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar    from './components/Sidebar';
import Dashboard  from './pages/Dashboard';
import Students   from './pages/Students';
import Courses    from './pages/Courses';
import Enrollment from './pages/Enrollment';
import Attendance from './pages/Attendance';
import Grades     from './pages/Grades';
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // Simple auth state check based on localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user'));

  // Redirect to login if trying to access dashboard/pages without being logged in
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if trying to access login/signup while already logged in
  if (isAuthenticated && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={isAuthPage ? "auth-layout-wrapper" : "app-layout"}>
      {!isAuthPage && <Sidebar />}
      <main className={isAuthPage ? "auth-main" : "app-main"}>
        <Routes>
          <Route path="/login"      element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="/signup"     element={<Signup setAuth={setIsAuthenticated} />} />
          
          <Route path="/"           element={<Dashboard  />} />
          <Route path="/students"   element={<Students   />} />
          <Route path="/courses"    element={<Courses    />} />
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/grades"     element={<Grades     />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar    from './components/Sidebar';
import Dashboard  from './pages/Dashboard';
import Students   from './pages/Students';
import Courses    from './pages/Courses';
import Enrollment from './pages/Enrollment';
import Attendance from './pages/Attendance';
import Grades     from './pages/Grades';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/"           element={<Dashboard  />} />
            <Route path="/students"   element={<Students   />} />
            <Route path="/courses"    element={<Courses    />} />
            <Route path="/enrollment" element={<Enrollment />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/grades"     element={<Grades     />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
});

// Auth
export const signupUser = (data) => api.post('/auth/signup', data);
export const loginUser  = (data) => api.post('/auth/login', data);

// Students
export const getStudents = () => api.get('/students');
export const getStudent = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Courses
export const getCourses = () => api.get('/courses');
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Enrollments
export const getEnrollments = () => api.get('/enrollments');
export const getStudentEnrollments = (id) => api.get(`/enrollments/student/${id}`); // Double check backend route
export const enrollStudent = (data) => api.post('/enrollments', data);
export const unenrollStudent = (id) => api.delete(`/enrollments/${id}`);

// Attendance
export const getAttendance = (params = {}) => api.get('/attendance', { params });
export const markAttendance = (data) => api.post('/attendance', data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

// Grades
export const getGrades = (params = {}) => api.get('/grades', { params });
export const saveGrade = (data) => api.post('/grades', data);
export const deleteGrade = (id) => api.delete(`/grades/${id}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;

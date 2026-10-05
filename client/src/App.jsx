import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context';
import { StatusProvider } from './components/StatusProvider';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Lesson from './pages/Lesson';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Instructor from './pages/Instructor';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import Certificate from './pages/Certificate';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader"><span className="loader"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.activeRole !== role) return <Navigate to={user.activeRole === 'admin' ? '/admin' : user.activeRole === 'instructor' ? '/instructor' : '/dashboard'} replace />;
  return children;
}

function AppShell() {
  return <><Navbar/><main><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/courses" element={<Courses/>}/>
    <Route path="/courses/:id" element={<CourseDetail/>}/>
    <Route path="/courses/:id/lesson/:lessonId" element={<PrivateRoute role="student"><Lesson/></PrivateRoute>}/>
    <Route path="/login" element={<Auth mode="login"/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route path="/dashboard" element={<PrivateRoute role="student"><Dashboard/></PrivateRoute>}/>
    <Route path="/instructor" element={<PrivateRoute role="instructor"><Instructor/></PrivateRoute>}/>
    <Route path="/admin" element={<PrivateRoute role="admin"><Admin/></PrivateRoute>}/><Route path="/courses/:id/certificate" element={<PrivateRoute role="student"><Certificate/></PrivateRoute>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></main><footer><div className="container footer-inner"><div className="brand"><span className="brand-mark">L</span> Learny</div><span>Learn deliberately. Build relentlessly.</span><span>© {new Date().getFullYear()} Learny</span></div></footer></>;
}

export default function App() {
  return <AuthProvider><StatusProvider><AppShell/></StatusProvider></AuthProvider>;
}

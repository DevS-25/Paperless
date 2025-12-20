import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import MentorDashboard from './components/MentorDashboard';
import HodDashboard from './components/HodDashboard';
import FacultyManagement from './components/FacultyManagement';
import ProfileSetup from './components/ProfileSetup';
import AdminDashboard from './components/AdminDashboard';
import DeanDashboard from './components/DeanDashboard';
import IndustryRelationDashboard from './components/IndustryRelationDashboard';
import RnDDashboard from './components/RnDDashboard';
import DeanAcademicsDashboard from './components/DeanAcademicsDashboard';
import RegistrarDashboard from './components/RegistrarDashboard';
import CoEDashboard from './components/CoEDashboard';
import ExamCellDashboard from './components/ExamCellDashboard';
import { authAPI } from './api';
import AdminLogin from './components/AdminLogin';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user authentication
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getCurrentUser()
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken'); // Clear legacy token if exists
    setUser(null);
  };

  const handleRoleSwitch = (newRole) => {
    setUser({ ...user, role: newRole });
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/profile-setup"
            element={user ? <ProfileSetup user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                // Check if profile is complete
                ((user.role === 'STUDENT' && (!user.vtuNumber || !user.yearOfStudy || !user.contactNumber || !user.department)) ||
                 (user.role === 'FACULTY' && (!user.ttsId || !user.contactNumber || !user.department))) ? (
                  <Navigate to="/profile-setup" />
                ) : user.role === 'STUDENT' ? (
                  <StudentDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'FACULTY' ? (
                  <div className="dashboard">
                    <header className="dashboard-header">
                      <div className="header-content">
                        <h1>Faculty Dashboard</h1>
                        <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                      </div>
                    </header>
                    <div className="dashboard-container">
                      <div className="card">
                        <h2>Welcome, {user.name}</h2>
                        <p>Your faculty profile is complete.</p>
                      </div>
                    </div>
                  </div>
                ) : user.role === 'MENTOR' ? (
                  <MentorDashboard user={user} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />
                ) : user.role === 'HOD' ? (
                  <HodDashboard user={user} onLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />
                ) : user.role === 'ADMIN' ? (
                  <AdminDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'DEAN' ? (
                  <DeanDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'INDUSTRY_RELATIONS' ? (
                  <IndustryRelationDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'RND' ? (
                  <RnDDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'DEAN_ACADEMICS' ? (
                  <DeanAcademicsDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'REGISTRAR' ? (
                  <RegistrarDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'COE' ? (
                  <CoEDashboard user={user} onLogout={handleLogout} />
                ) : user.role === 'EXAM_CELL' ? (
                  <ExamCellDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <div className="dashboard-container" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Role not supported yet</h2>
                    <p>Your current role is: <strong>{user.role || 'None'}</strong></p>
                    <p>Please contact the administrator if you believe this is an error.</p>
                    <button onClick={handleLogout} className="btn btn-logout" style={{ marginTop: '1rem' }}>Logout</button>
                  </div>
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/faculty-management"
            element={
              user && (user.role === 'ADMIN' || user.role === 'HOD') ? (
                <FacultyManagement user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          {/* Admin Routes - Redirect to main dashboard if admin */}
          <Route
            path="/admin/dashboard"
            element={
              user && user.role === 'ADMIN' ? (
                <AdminDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/login"
            element={!user ? <AdminLogin setUser={setUser} /> : <Navigate to="/admin/dashboard" />}
          />
          {/* Catch all - redirect to login or dashboard */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

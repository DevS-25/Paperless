import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, adminAPI } from '../api';
import './AdminDashboard.css';

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [facultyForm, setFacultyForm] = useState({
    email: '',
    role: 'MENTOR'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Stats data
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    mentors: 0,
    hods: 0,
    totalDocuments: 0,
    pendingApprovals: 0
  });

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      console.log('Fetching admin statistics...');
      console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:8080/api');
      const response = await adminAPI.getStatistics();
      console.log('Statistics received:', response.data);
      console.log('Setting stats state with:', response.data);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      // Keep default values if fetch fails
    }
  };

  const testFetchStatistics = () => {
    console.log('Manual test fetch triggered');
    fetchStatistics();
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    setLoading(true);
    try {
      const response = await authAPI.setUserRole(facultyForm.email, facultyForm.role);
      setMessage(`✓ Successfully added role ${facultyForm.role} to ${facultyForm.email}`);
      setFacultyForm({ email: '', role: 'MENTOR' });
      setShowRoleModal(false);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Error setting role:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to set role. User must login at least once first.';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = () => {
    setShowRoleModal(true);
    setError('');
    setMessage('');
    setFacultyForm({ email: '', role: 'MENTOR' });
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setError('');
    setFacultyForm({ email: '', role: 'MENTOR' });
  };

  const handleAdminLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      navigate('/login');
    }
  };

  const handleViewDashboard = (role) => {
    // Show info about accessing that dashboard
    alert(`To access ${role} Dashboard:\n\n1. Login with a Google account\n2. Set that account's role to ${role}\n3. The user will see ${role} Dashboard on their next login`);
  };

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1>🔐 Admin Panel</h1>
            <span className="admin-badge">Paperless Management System</span>
          </div>
          <div className="admin-header-right">
            <div className="admin-info">
              <div className="admin-icon">👤</div>
              <div>
                <div className="admin-name">Administrator</div>
                <div className="admin-role">Full Access</div>
              </div>
            </div>
            <button onClick={handleAdminLogout} className="btn btn-logout">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              <span>Overview</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'add-roles' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-roles')}
            >
              <span className="nav-icon">🎭</span>
              <span>Assign Roles</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'dashboards' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboards')}
            >
              <span className="nav-icon">🖥️</span>
              <span>All Dashboards</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="admin-content">
              <h2>📊 System Overview</h2>


              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">🎓</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.students}</div>
                    <div className="stat-label">Students</div>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">👨‍🏫</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.mentors}</div>
                    <div className="stat-label">Mentors</div>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">👔</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.hods}</div>
                    <div className="stat-label">HODs</div>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">📄</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.totalDocuments}</div>
                    <div className="stat-label">Total Applications</div>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.pendingApprovals}</div>
                    <div className="stat-label">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Assign Roles Tab */}
          {activeTab === 'add-roles' && (
            <div className="admin-content">
              <h2>🎭 Assign Additional Roles</h2>

              {message && <div className="alert alert-success">{message}</div>}

              <div className="card">
                <h3>📋 Role Management</h3>
                <p>Click the button below to assign or update user roles in the system.</p>

                <button
                  className="btn btn-primary btn-large"
                  onClick={openRoleModal}
                  style={{ marginTop: '20px' }}
                >
                  🎭 Open Role Assignment
                </button>
              </div>

              <div className="card" style={{ marginTop: '20px' }}>
                <h3>📖 Available Roles</h3>
                <div className="roles-info-grid">
                  <div className="role-info-item">
                    <strong>Core Roles:</strong>
                    <ul>
                      <li>Mentor</li>
                      <li>HOD</li>
                      <li>Admin</li>
                    </ul>
                  </div>
                  <div className="role-info-item">
                    <strong>Leadership Roles:</strong>
                    <ul>
                      <li>Dean</li>
                      <li>Dean Academics</li>
                    </ul>
                  </div>
                  <div className="role-info-item">
                    <strong>Administrative Roles:</strong>
                    <ul>
                      <li>Registrar</li>
                      <li>Controller of Examinations</li>
                      <li>Exam Cell</li>
                    </ul>
                  </div>
                  <div className="role-info-item">
                    <strong>Other Roles:</strong>
                    <ul>
                      <li>Industry Relations</li>
                      <li>Research & Development</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Dashboards Tab */}
          {activeTab === 'dashboards' && (
            <div className="admin-content">
              <h2>🖥️ All Dashboards</h2>

              <div className="dashboards-grid">
                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">🎓</span>
                    <h3>Student Dashboard</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For students to upload and track documents</p>
                    <ul className="feature-list">
                      <li>Upload documents</li>
                      <li>Forward to mentors</li>
                      <li>Track status</li>
                      <li>View history</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('STUDENT')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">👨‍🏫</span>
                    <h3>Mentor Dashboard</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For faculty to review student documents</p>
                    <ul className="feature-list">
                      <li>Review submissions</li>
                      <li>Approve/Reject</li>
                      <li>Forward to HOD</li>
                      <li>View student details</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('MENTOR')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">👔</span>
                    <h3>HOD Dashboard</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For HODs with final approval authority</p>
                    <ul className="feature-list">
                      <li>Final approvals</li>
                      <li>Review forwarded docs</li>
                      <li>Department oversight</li>
                      <li>Complete visibility</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('HOD')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">🎓</span>
                    <h3>Dean Dashboard</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For Dean with executive oversight</p>
                    <ul className="feature-list">
                      <li>Document overview</li>
                      <li>Approval statistics</li>
                      <li>Department management</li>
                      <li>Executive decisions</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('DEAN')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">📖</span>
                    <h3>Dean Academics Dashboard</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For academic program management</p>
                    <ul className="feature-list">
                      <li>Course management</li>
                      <li>Faculty oversight</li>
                      <li>Student tracking</li>
                      <li>Department coordination</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('DEAN_ACADEMICS')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">📋</span>
                    <h3>Registrar Dashboard</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For student records management</p>
                    <ul className="feature-list">
                      <li>Student records</li>
                      <li>Certificate issuance</li>
                      <li>Transcript management</li>
                      <li>Verification requests</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('REGISTRAR')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">📝</span>
                    <h3>Controller of Examinations</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For examination management</p>
                    <ul className="feature-list">
                      <li>Exam scheduling</li>
                      <li>Results publishing</li>
                      <li>Evaluation tracking</li>
                      <li>Quality assurance</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('COE')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">📅</span>
                    <h3>Exam Cell Dashboard</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For exam operations management</p>
                    <ul className="feature-list">
                      <li>Hall ticket issuance</li>
                      <li>Answer sheet tracking</li>
                      <li>Revaluation requests</li>
                      <li>Exam logistics</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('EXAM_CELL')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">🤝</span>
                    <h3>Industry Relations</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For industry partnerships</p>
                    <ul className="feature-list">
                      <li>Industry partners</li>
                      <li>MOU management</li>
                      <li>Placement coordination</li>
                      <li>Corporate relations</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('INDUSTRY_RELATIONS')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <span className="dashboard-icon">🔬</span>
                    <h3>R&D Dashboard</h3>
                  </div>
                  <div className="dashboard-body">
                    <p>For research & development</p>
                    <ul className="feature-list">
                      <li>Research projects</li>
                      <li>Publication tracking</li>
                      <li>Patent management</li>
                      <li>Grant administration</li>
                    </ul>
                  </div>
                  <div className="dashboard-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleViewDashboard('RND')}
                    >
                      📖 View Info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="admin-content">
              <h2>⚙️ Settings</h2>

              <div className="card">
                <h3>🔑 Admin Credentials</h3>
                <div className="credential-box">
                  <p><strong>Username:</strong> admin@veltech.edu.in</p>
                  <p><strong>Password:</strong> Veltech@Admin2025</p>
                </div>
                <small className="text-muted">
                  ⚠️ To change credentials, update AdminLogin.js file
                </small>
              </div>

              <div className="card">
                <h3>🌐 System Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Backend URL:</span>
                    <span className="info-value">http://localhost:8080</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Frontend URL:</span>
                    <span className="info-value">http://localhost:3000</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Authentication:</span>
                    <span className="info-value">Google OAuth 2.0</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">System Status:</span>
                    <span className="badge badge-success">✓ Online</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={closeRoleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎭 Assign Role</h3>
              <button className="modal-close" onClick={closeRoleModal}>×</button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleAddFaculty}>
                <div className="form-group">
                  <label>Faculty Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                    autoFocus
                  />
                  <small className="form-text">Enter the user's email address</small>
                </div>

                <div className="form-group">
                  <label>Role to Add *</label>
                  <select
                    className="form-control"
                    value={facultyForm.role}
                    onChange={(e) => setFacultyForm({ ...facultyForm, role: e.target.value })}
                    required
                  >
                    <option value="MENTOR">Mentor</option>
                    <option value="HOD">HOD</option>
                    <option value="ADMIN">Admin</option>
                    <option value="DEAN">Dean</option>
                    <option value="DEAN_ACADEMICS">Dean Academics</option>
                    <option value="REGISTRAR">Registrar</option>
                    <option value="COE">Controller of Examinations</option>
                    <option value="EXAM_CELL">Exam Cell</option>
                    <option value="INDUSTRY_RELATIONS">Industry Relations</option>
                    <option value="RND">Research & Development</option>
                  </select>
                </div>


                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeRoleModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Adding Role...' : '🎭 Add Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;


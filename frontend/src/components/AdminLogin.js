import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import './AdminLogin.css';

function AdminLogin({ setUser }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.adminLogin(credentials);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login failed:', err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>🔐 Admin Panel</h1>
          <p>Secure Access</p>
        </div>

        <div className="admin-login-body">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter admin username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Authenticating...' : 'Login to Admin Panel'}
            </button>
          </form>
        </div>

        <div className="admin-login-footer">
          <button
            onClick={() => navigate('/login')}
            className="btn btn-link"
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
          >
            ← Back to Main Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

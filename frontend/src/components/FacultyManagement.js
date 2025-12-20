import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import './FacultyManagement.css';

function FacultyManagement({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) {
      alert('Please select a user and role');
      return;
    }

    setLoading(true);
    try {
      await adminAPI.setUserRole(selectedUser.id, newRole);
      alert('Role updated successfully!');
      loadUsers();
      setSelectedUser(null);
      setNewRole('');
    } catch (err) {
      alert('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📄 Paperless</h1>
            <span className="role-badge">Faculty Management</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img src={user.profilePicture} alt={user.name} className="user-avatar" />
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-details">Admin</div>
              </div>
            </div>
            <button onClick={onLogout} className="btn btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <section className="management-section">
          <h2>👥 Manage Faculty Roles</h2>

          <div className="users-table card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setSelectedUser(u)}
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <div className="role-update-modal">
              <div className="modal-content">
                <h3>Update Role for {selectedUser.name}</h3>
                <div className="form-group">
                  <label>Select New Role:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Select Role --</option>
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="HOD">HOD</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button
                    className="btn btn-success"
                    onClick={handleRoleUpdate}
                    disabled={loading}
                  >
                    Update Role
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedUser(null);
                      setNewRole('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FacultyManagement;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import './ProfileSetup.css';

function ProfileSetup({ user, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user.name || '',
    vtuNumber: user.vtuNumber || '',
    contactNumber: user.contactNumber || '',
    yearOfStudy: user.yearOfStudy || '1st Year',
    department: user.department || 'CSE',
    ttsId: user.ttsId || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      setUser(response.data);
      alert('Profile updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AERO'];

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-box">
        <h1>📝 Complete Your Profile</h1>
        <p className="subtitle">Please provide additional information</p>

        <form onSubmit={handleSubmit}>
          {user.role === 'STUDENT' && (
            <>
              <div className="form-group">
                <label>VTU Number</label>
                <input
                  type="text"
                  name="vtuNumber"
                  value={formData.vtuNumber}
                  onChange={handleChange}
                  placeholder="Enter your VTU number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Year of Study</label>
                <select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  required
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </>
          )}

          {user.role === 'FACULTY' && (
            <div className="form-group">
              <label>TTS ID</label>
              <input
                type="text"
                name="ttsId"
                value={formData.ttsId}
                onChange={handleChange}
                placeholder="Enter your TTS ID"
                required
                maxLength="4"
                pattern="\d{4}"
                title="TTS ID must be 4 digits"
              />
            </div>
          )}

          <div className="form-group">
            <label>Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter your contact number"
              required
              maxLength="10"
              pattern="\d{10}"
              title="Contact number must be 10 digits"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;

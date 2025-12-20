import React, { useState } from 'react';
import { authAPI } from '../api';
import './SignatureUpload.css';

function SignatureUpload({ onClose, onUploadSuccess, role }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState(role || 'DEFAULT');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File size must be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
        setError('Only JPG and PNG images are allowed');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (targetRole && targetRole !== 'DEFAULT') {
        formData.append('role', targetRole);
      }

      await authAPI.uploadSignature(formData);
      alert('Signature uploaded successfully!');
      if (onUploadSuccess) onUploadSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload signature. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signature-modal-overlay">
      <div className="signature-modal">
        <div className="signature-header">
          <h3>Upload Digital Signature/Stamp</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="signature-body">
          <p className="info-text">
            Upload an image of your signature or stamp. This will be automatically applied to documents you approve.
            <br/>
            <small>Supported formats: PNG, JPG (Max 2MB)</small>
          </p>

          <form onSubmit={handleSubmit}>
            {!role && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Signature Type:</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="DEFAULT">Default / Mentor Signature</option>
                  <option value="HOD">HOD Signature</option>
                </select>
              </div>
            )}

            <div className="file-input-container">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                id="signature-file"
              />
              <label htmlFor="signature-file" className="file-label">
                {file ? file.name : 'Choose Image...'}
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !file}>
                {loading ? 'Uploading...' : 'Upload Signature'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignatureUpload;

import React, { useState, useEffect } from 'react';
import { studentAPI } from '../api';
import './StudentDashboard.css';

function StudentDashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadMentors();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyDocuments();
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMentors = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMentors();
      setMentors(response.data);
    } catch (err) {
      console.error('Failed to load mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', '');

    try {
      await studentAPI.uploadDocument(formData);
      setUploadStatus('File uploaded successfully! ✓');
      setSelectedFile(null);
      document.getElementById('fileInput').value = '';
      loadDocuments();
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setUploadStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async (documentId, mentorId) => {
    if (!mentorId) {
      alert('Please select a mentor');
      return;
    }

    setLoading(true);
    try {
      await studentAPI.forwardToMentor(documentId, mentorId);
      loadDocuments();
      alert('Document forwarded to mentor successfully!');
    } catch (err) {
      alert('Failed to forward document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    console.log('Delete button clicked for document ID:', documentId);

    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      console.log('Delete cancelled by user');
      return;
    }

    setLoading(true);
    console.log('Attempting to delete document:', documentId);
    console.log('API endpoint will be: /student/document/' + documentId);

    try {
      await studentAPI.deleteDocument(documentId);
      setSuccessMessage('Document deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
      const message = error.response?.data?.error || error.message || 'Failed to delete document. Please try again.';
      setError(message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { class: 'badge-draft', text: 'Draft' },

      // Mentor
      FORWARDED_TO_MENTOR: { class: 'badge-pending', text: 'Pending with Mentor' },
      APPROVED_BY_MENTOR: { class: 'badge-approved', text: 'Approved by Mentor' },
      REJECTED_BY_MENTOR: { class: 'badge-rejected', text: 'Rejected by Mentor' },

      // HOD
      FORWARDED_TO_HOD: { class: 'badge-pending', text: 'Pending with HOD' },
      APPROVED_BY_HOD: { class: 'badge-approved', text: 'Approved by HOD' },
      REJECTED_BY_HOD: { class: 'badge-rejected', text: 'Rejected by HOD' },

      // Dean
      FORWARDED_TO_DEAN: { class: 'badge-pending', text: 'Pending with Dean' },
      APPROVED_BY_DEAN: { class: 'badge-approved', text: 'Approved by Dean' },
      REJECTED_BY_DEAN: { class: 'badge-rejected', text: 'Rejected by Dean' },

      // Dean Academics
      FORWARDED_TO_DEAN_ACADEMICS: { class: 'badge-pending', text: 'Pending with Dean Academics' },
      APPROVED_BY_DEAN_ACADEMICS: { class: 'badge-approved', text: 'Approved by Dean Academics' },
      REJECTED_BY_DEAN_ACADEMICS: { class: 'badge-rejected', text: 'Rejected by Dean Academics' },

      // Registrar
      FORWARDED_TO_REGISTRAR: { class: 'badge-pending', text: 'Pending with Registrar' },
      APPROVED_BY_REGISTRAR: { class: 'badge-approved', text: 'Approved by Registrar' },
      REJECTED_BY_REGISTRAR: { class: 'badge-rejected', text: 'Rejected by Registrar' },

      // CoE
      FORWARDED_TO_COE: { class: 'badge-pending', text: 'Pending with CoE' },
      APPROVED_BY_COE: { class: 'badge-approved', text: 'Approved by CoE' },
      REJECTED_BY_COE: { class: 'badge-rejected', text: 'Rejected by CoE' },

      // R&D
      FORWARDED_TO_RND: { class: 'badge-pending', text: 'Pending with R&D' },
      APPROVED_BY_RND: { class: 'badge-approved', text: 'Approved by R&D' },
      REJECTED_BY_RND: { class: 'badge-rejected', text: 'Rejected by R&D' },

      // Industry Relations
      FORWARDED_TO_INDUSTRY_RELATIONS: { class: 'badge-pending', text: 'Pending with Industry Relations' },
      APPROVED_BY_INDUSTRY_RELATIONS: { class: 'badge-approved', text: 'Approved by Industry Relations' },
      REJECTED_BY_INDUSTRY_RELATIONS: { class: 'badge-rejected', text: 'Rejected by Industry Relations' },

      // Exam Cell
      FORWARDED_TO_EXAM_CELL: { class: 'badge-pending', text: 'Pending with Exam Cell' },
      APPROVED_BY_EXAM_CELL: { class: 'badge-approved', text: 'Approved by Exam Cell' },
      REJECTED_BY_EXAM_CELL: { class: 'badge-rejected', text: 'Rejected by Exam Cell' },
    };

    const statusInfo = statusMap[status] || { class: 'badge-draft', text: status.replace(/_/g, ' ') };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePreviewDocument = async (documentId, fileName) => {
    try {
      console.log('Previewing document:', documentId, fileName);
      setPreviewError('');
      setPreviewLoading(true);
      setIsPreviewOpen(true); // Open modal immediately to show loading state

      const response = await studentAPI.downloadDocument(documentId);
      console.log('Document downloaded, content-type:', response.headers['content-type']);

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);

      setPreviewUrl(url);
      setPreviewType(response.headers['content-type'] || 'application/octet-stream');
      setPreviewName(fileName || 'document');
    } catch (err) {
      console.error('Failed to preview document:', err);
      setPreviewError('Unable to preview document. Please try again later.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setPreviewType('');
    setPreviewName('');
    setPreviewError('');
    setIsPreviewOpen(false);
  };

  const formatName = (name) => {
    if (!name) return '';
    // Split by comma to get just the name part if extra details exist
    const cleanName = name.split(',')[0].trim();
    return cleanName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📄 Paperless</h1>
            <span className="role-badge">Student Dashboard</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img src={user.profilePicture} alt={user.name} className="user-avatar" />
              <div>
                <div className="user-name">{formatName(user.name)}</div>
                <div className="user-details">{user.vtuNumber} • {user.yearOfStudy} • {user.department}</div>
              </div>
            </div>
            <button onClick={onLogout} className="btn btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Upload Section */}
        <section className="upload-section card">
          <h2>📤 Upload Document</h2>
          <form onSubmit={handleUpload}>
            {error && <div className="alert alert-error">{error}</div>}
            {uploadStatus && <div className="alert alert-success">{uploadStatus}</div>}

            <div className="form-group">
              <label htmlFor="fileInput">Select File *</label>
              <input
                id="fileInput"
                type="file"
                className="form-control"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
              />
              {selectedFile && (
                <div className="file-info">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>


            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : '📤 Upload Document'}
            </button>
          </form>
        </section>

        {/* Documents List */}
        <section className="documents-section">
          <h2>📋 My Documents ({documents.length})</h2>

          {documents.length === 0 ? (
            <div className="card empty-state">
              <p>No documents uploaded yet. Upload your first document above!</p>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc.id} className="document-card card">
                  <div className="document-header">
                    <h3>VT{doc.id}</h3>
                    {getStatusBadge(doc.status)}
                  </div>

                  <div className="document-info">
                    {doc.forwardedToMentorAt ? (
                      <p><strong>Requested on:</strong> {formatDate(doc.forwardedToMentorAt)}</p>
                    ) : (
                      <p><strong>Uploaded:</strong> {formatDate(doc.uploadedAt)}</p>
                    )}
                    {doc.mentorName && <p><strong>Mentor:</strong> {formatName(doc.mentorName)}</p>}
                    {doc.rejectionReason && (
                      <p className="rejection-reason">
                        <strong>Rejection Reason:</strong> {doc.rejectionReason}
                      </p>
                    )}
                  </div>

                  {doc.status === 'DRAFT' && (
                    <div className="document-actions">
                      <select
                        className="mentor-select"
                        id={`mentor-${doc.id}`}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Mentor</option>
                        {mentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {formatName(mentor.name)}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const mentorId = document.getElementById(`mentor-${doc.id}`).value;
                          handleForward(doc.id, mentorId);
                        }}
                      >
                        Forward to Mentor →
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(doc.id)}
                        title="Delete this document"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                  <div className="document-preview">
                    <button
                      className="btn btn-preview"
                      onClick={() => handlePreviewDocument(doc.id, doc.fileName)}
                      disabled={previewLoading}
                    >
                      🔍 Preview Document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
        </section>
      </div>

      {/* Global Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {isPreviewOpen && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <div className="preview-content">
              <div className="preview-header">
                <h3>{previewName}</h3>
                <button className="preview-close-btn" onClick={handleClosePreview}>×</button>
              </div>
              <div className="preview-body">
                {previewLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading document...</p>
                  </div>
                ) : previewError ? (
                  <div className="preview-error">{previewError}</div>
                ) : previewUrl ? (
                  previewType.startsWith('image/') ? (
                    <img src={previewUrl} alt={previewName} className="preview-image" />
                  ) : (
                    <iframe src={previewUrl} title="Document Preview" className="preview-iframe" />
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;


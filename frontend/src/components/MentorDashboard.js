import React, { useState, useEffect } from 'react';
import { mentorAPI, adminAPI } from '../api';
import SignatureUpload from './SignatureUpload';
import './MentorDashboard.css';

function MentorDashboard({ user, onLogout, onRoleSwitch }) {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState('pending'); // 'pending' or 'all'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [hods, setHods] = useState([]);
  const [selectedHodIds, setSelectedHodIds] = useState({});
  const [forwardDepartments, setForwardDepartments] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(user.department || 'CSE');
  const [mobileMenuOpen, setMobileMenuOpen] = useState({});
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0
  });

  useEffect(() => {
    loadDocuments();
    loadHods();
    loadStats();
  }, [filter, selectedDepartment]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const toggleMobileMenu = (docId) => {
    setMobileMenuOpen(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const loadHods = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      const hodUsers = response.data.filter(user => user.role === 'HOD');
      setHods(hodUsers);
    } catch (err) {
      console.error('Failed to load HODs:', err);
      setHods([]);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      console.log('Loading mentor documents for filter:', filter);
      const response = filter === 'pending'
        ? await mentorAPI.getPendingDocuments()
        : await mentorAPI.getAllDocuments();
      console.log('Mentor documents loaded:', response.data);
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await mentorAPI.getAllDocuments();
      const allDocs = response.data;
      const pending = allDocs.filter(d => d.status === 'FORWARDED_TO_MENTOR').length;
      const approved = allDocs.filter(d => d.status === 'APPROVED_BY_MENTOR' || d.status === 'FORWARDED_TO_HOD' || d.status === 'APPROVED_BY_HOD' || d.status === 'FORWARDED_TO_DEAN' || d.status === 'APPROVED_BY_DEAN' || d.status === 'FORWARDED_TO_DEAN_ACADEMICS' || d.status === 'APPROVED_BY_DEAN_ACADEMICS' || d.status === 'FORWARDED_TO_REGISTRAR' || d.status === 'APPROVED_BY_REGISTRAR').length;

      setStats({
        pending,
        approved,
        total: allDocs.length
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleApprove = async (documentId) => {
    if (!window.confirm('Are you sure you want to approve this document?')) return;

    setLoading(true);
    try {
      await mentorAPI.approveDocument(documentId);
      alert('Document approved successfully!');
      loadDocuments();
      setSelectedDoc(null);
    } catch (err) {
      alert('Failed to approve document');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (documentId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this document?')) return;

    setLoading(true);
    try {
      await mentorAPI.rejectDocument(documentId, rejectionReason);
      alert('Document rejected!');
      loadDocuments();
      setSelectedDoc(null);
      setRejectionReason('');
    } catch (err) {
      alert('Failed to reject document');
    } finally {
      setLoading(false);
    }
  };

  const handleForwardDepartmentChange = (documentId, department) => {
    setForwardDepartments(prev => ({
      ...prev,
      [documentId]: department
    }));
    // Reset selected HOD when department changes
    setSelectedHodIds(prev => {
      const updated = { ...prev };
      delete updated[documentId];
      return updated;
    });
  };

  const handleForwardToHod = async (documentId) => {
    const selectedHodId = selectedHodIds[documentId];

    if (!selectedHodId) {
      alert('Please select an HOD before forwarding');
      return;
    }

    if (!window.confirm('Are you sure you want to forward this document to the selected HOD?')) return;

    setLoading(true);
    try {
      await mentorAPI.forwardToHod(documentId, selectedHodId);
      alert('Document forwarded to HOD successfully!');
      loadDocuments();
      setSelectedDoc(null);
      // Clear the selected HOD for this document
      setSelectedHodIds(prev => {
        const updated = { ...prev };
        delete updated[documentId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to forward to HOD:', err);
      const errorMessage = err.response?.data?.message || 'Failed to forward to HOD. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleHodSelection = (documentId, hodId) => {
    setSelectedHodIds(prev => ({
      ...prev,
      [documentId]: hodId
    }));
  };

  const handlePreviewDocument = async (documentId, fileName) => {
    try {
      setPreviewError('');
      setPreviewLoading(true);
      const response = await mentorAPI.downloadDocument(documentId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);

      setPreviewUrl(url);
      setPreviewType(response.headers['content-type'] || 'application/octet-stream');
      setPreviewName(fileName || 'document');
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Failed to preview document:', err);
      setPreviewError('Unable to preview document. Please try again later.');
      setIsPreviewOpen(true);
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

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { class: 'badge-draft', text: 'Draft' },
      FORWARDED_TO_MENTOR: { class: 'badge-pending', text: 'Pending Review' },
      APPROVED_BY_MENTOR: { class: 'badge-approved', text: 'Approved' },
      REJECTED_BY_MENTOR: { class: 'badge-rejected', text: 'Rejected' },
      FORWARDED_TO_HOD: { class: 'badge-pending', text: 'Forwarded to HOD' },
      APPROVED_BY_HOD: { class: 'badge-approved', text: 'Approved by HOD' },
      REJECTED_BY_HOD: { class: 'badge-rejected', text: 'Rejected by HOD' },
    };
    const statusInfo = statusMap[status] || { class: 'badge-draft', text: status };
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

  const formatName = (name) => {
    if (!name) return '';
    const cleanName = name.split(',')[0].trim();
    return cleanName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AERO'];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📄 Paperless</h1>
            <span className="role-badge role-mentor">Mentor Dashboard</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img src={user.profilePicture} alt={user.name} className="user-avatar" />
              <div>
                <div className="user-name">{formatName(user.name)}</div>
                <div className="user-details">Mentor • {user.department}</div>
              </div>
            </div>
            {user.roles && user.roles.includes('HOD') && (
              <button
                onClick={() => onRoleSwitch('HOD')}
                className="btn btn-secondary btn-switch-role"
                style={{ marginRight: '10px' }}
              >
                Switch to HOD
              </button>
            )}
            <button
              onClick={() => setIsSignatureModalOpen(true)}
              className="btn btn-secondary btn-upload-sig"
              style={{ marginRight: '10px' }}
            >
              Upload Signature
            </button>
            <button onClick={onLogout} className="btn btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Applications</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.approved}</div>
              <div className="stat-label">Approved Applications</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Applications ({stats.total})
          </button>
        </div>

        {/* Documents List */}
        <section className="documents-section">
          {documents.length === 0 ? (
            <div className="card empty-state">
              <p>No applications to review.</p>
            </div>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-card card">
                  <div className="document-main">
                    <div className="document-header">
                      <h3>VT{doc.id}</h3>
                      {getStatusBadge(doc.status)}
                    </div>

                    {/* Student Information */}
                    <div className="student-info-box">
                      <h4>👤 Student Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Name:</span>
                          <span className="info-value">{formatName(doc.studentName)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">VTU Number:</span>
                          <span className="info-value">{doc.vtuNumber || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Contact:</span>
                          <span className="info-value">{doc.contactNumber || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Year:</span>
                          <span className="info-value">{doc.yearOfStudy || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Document Information */}
                    <div className="document-info">
                      {doc.forwardedToMentorAt ? (
                        <p><strong>Requested on:</strong> {formatDate(doc.forwardedToMentorAt)}</p>
                      ) : (
                        <p><strong>Uploaded:</strong> {formatDate(doc.uploadedAt)}</p>
                      )}
                      <div className="document-view-actions">
                        <button
                          className="btn btn-preview"
                          onClick={() => handlePreviewDocument(doc.id, doc.fileName)}
                          disabled={viewingDoc}
                        >
                          🔍 Preview Document
                        </button>
                      </div>
                    </div>

                    {/* Actions for Pending Documents */}
                    {doc.status === 'FORWARDED_TO_MENTOR' && (
                      <div className={`document-actions ${mobileMenuOpen[doc.id] ? 'mobile-open' : ''}`}>
                        <div className="hod-selection-group">
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <label htmlFor={`dept-select-${doc.id}`} style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Forward to Dept:</label>
                            <select
                              id={`dept-select-${doc.id}`}
                              className="form-control"
                              value={forwardDepartments[doc.id] || user.department || 'CSE'}
                              onChange={(e) => handleForwardDepartmentChange(doc.id, e.target.value)}
                              disabled={loading}
                              style={{ padding: '0.25rem', fontSize: '0.8rem', height: 'auto' }}
                            >
                              {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ flex: 2, minWidth: '150px' }}>
                            <label htmlFor={`hod-select-${doc.id}`} style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Select HOD:</label>
                            <select
                              id={`hod-select-${doc.id}`}
                              className="form-control hod-dropdown"
                              value={selectedHodIds[doc.id] || ''}
                              onChange={(e) => handleHodSelection(doc.id, e.target.value)}
                              disabled={loading || hods.length === 0}
                              style={{ padding: '0.25rem', fontSize: '0.8rem', height: 'auto' }}
                            >
                              <option value="">-- Select HOD --</option>
                              {hods
                                .filter(hod => (hod.department || 'CSE') === (forwardDepartments[doc.id] || user.department || 'CSE'))
                                .map((hod) => (
                                  <option key={hod.id} value={hod.id}>
                                    {formatName(hod.name)}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <div className="action-buttons-group">
                          <button
                            className="btn btn-success btn-nowrap"
                            onClick={() => handleApprove(doc.id)}
                            disabled={loading}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-warning btn-nowrap btn-forward"
                            onClick={() => handleForwardToHod(doc.id)}
                            disabled={loading || !selectedHodIds[doc.id]}
                          >
                            → Forward to HOD
                          </button>
                          <button
                            className="btn btn-danger btn-nowrap"
                            onClick={() => setSelectedDoc(doc.id)}
                            disabled={loading}
                          >
                            ✗ Reject
                          </button>
                          <button
                            className="btn btn-secondary btn-more-actions"
                            onClick={() => toggleMobileMenu(doc.id)}
                          >
                            {mobileMenuOpen[doc.id] ? '▲ Less Actions' : '▼ More Actions'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rejection Form */}
                    {selectedDoc === doc.id && (
                      <div className="rejection-form">
                        <textarea
                          className="form-control"
                          rows="3"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Reason for rejection..."
                        />
                        <div className="rejection-actions">
                          <button
                            className="btn btn-danger"
                            onClick={() => handleReject(doc.id)}
                            disabled={loading}
                          >
                            Confirm Rejection
                          </button>
                          <button
                            className="btn"
                            onClick={() => {
                              setSelectedDoc(null);
                              setRejectionReason('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show rejection reason if rejected */}
                    {doc.rejectionReason && (
                      <div className="rejection-reason">
                        <strong>Rejection Reason:</strong> {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Global Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
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
                  {previewLoading && <div className="preview-loading">Loading document…</div>}
                  {previewError && !previewLoading ? (
                    <div className="preview-error">{previewError}</div>
                  ) : !previewLoading && previewUrl ? (
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

        {isSignatureModalOpen && (
          <SignatureUpload onClose={() => setIsSignatureModalOpen(false)} />
        )}
      </div>
    </div>
  );
}

export default MentorDashboard;


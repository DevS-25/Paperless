import React, { useState, useEffect } from 'react';
import { hodAPI, adminAPI } from '../api';
import SignatureUpload from './SignatureUpload';
import './HodDashboard.css';

function HodDashboard({ user, onLogout, onRoleSwitch }) {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(user.department || 'CSE');
  const [deans, setDeans] = useState([]);
  const [selectedDeanIds, setSelectedDeanIds] = useState({});
  const [forwardDepartments, setForwardDepartments] = useState({});
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0
  });

  useEffect(() => {
    loadDocuments();
    loadDeans();
    loadStats();
  }, [filter, selectedDepartment]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  const loadDeans = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      const deanUsers = response.data.filter(user => user.role === 'DEAN');
      setDeans(deanUsers);
    } catch (err) {
      console.error('Failed to load Deans:', err);
      setDeans([]);
    }
  };

  const loadDocuments = async () => {
    try {
      console.log('Loading HOD documents for filter:', filter);
      const response = filter === 'pending'
        ? await hodAPI.getPendingDocuments()
        : await hodAPI.getAllDocuments();

      console.log('HOD documents loaded:', response.data);
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await hodAPI.getAllDocuments();
      const allDocs = response.data;
      const pending = allDocs.filter(d => d.status === 'FORWARDED_TO_HOD').length;
      const approved = allDocs.filter(d => d.status === 'APPROVED_BY_HOD' || d.status === 'FORWARDED_TO_DEAN' || d.status === 'APPROVED_BY_DEAN' || d.status === 'FORWARDED_TO_DEAN_ACADEMICS' || d.status === 'APPROVED_BY_DEAN_ACADEMICS' || d.status === 'FORWARDED_TO_REGISTRAR' || d.status === 'APPROVED_BY_REGISTRAR').length;

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
    if (!window.confirm('Are you sure you want to give final approval to this document?')) return;

    setLoading(true);
    try {
      await hodAPI.approveDocument(documentId);
      alert('Document approved by HOD successfully!');
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
      await hodAPI.rejectDocument(documentId, rejectionReason);
      alert('Document rejected by HOD!');
      loadDocuments();
      setSelectedDoc(null);
      setRejectionReason('');
    } catch (err) {
      alert('Failed to reject document');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = async (documentId, fileName) => {
    try {
      setPreviewError('');
      setPreviewLoading(true);
      const response = await hodAPI.downloadDocument(documentId);
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

  const handleForwardDepartmentChange = (documentId, department) => {
    setForwardDepartments(prev => ({
      ...prev,
      [documentId]: department
    }));
    // Reset selected Dean when department changes
    setSelectedDeanIds(prev => {
      const updated = { ...prev };
      delete updated[documentId];
      return updated;
    });
  };

  // Effect to auto-select Dean if only one is available for the department
  useEffect(() => {
    documents.forEach(doc => {
      if (doc.status === 'FORWARDED_TO_HOD' && !selectedDeanIds[doc.id]) {
        const targetDept = forwardDepartments[doc.id] || user.department || 'CSE';
        const availableDeans = deans.filter(dean => (dean.department || 'CSE') === targetDept);

        if (availableDeans.length === 1) {
          setSelectedDeanIds(prev => ({
            ...prev,
            [doc.id]: availableDeans[0].id
          }));
        }
      }
    });
  }, [documents, deans, forwardDepartments, user.department, selectedDeanIds]);

  const handleDeanSelection = (documentId, deanId) => {
    setSelectedDeanIds(prev => ({
      ...prev,
      [documentId]: deanId
    }));
  };

  const handleForwardToDean = async (documentId) => {
    const selectedDeanId = selectedDeanIds[documentId];

    if (!selectedDeanId) {
      alert('Please select a Dean before forwarding');
      return;
    }

    if (!window.confirm('Are you sure you want to forward this document to the selected Dean?')) return;

    setLoading(true);
    try {
      // We need to update the API call to pass the deanId.
      // Assuming hodAPI.forwardToDean can take a second argument or an object.
      // Since I updated the backend to accept targetUserId in DocumentActionRequest,
      // I should check how hodAPI.forwardToDean is implemented in api.js.
      // If it takes (documentId), I might need to update api.js or pass an object.
      // Let's assume I'll update api.js later or pass it as a second arg if supported.
      // Actually, I should check api.js first. But I can't right now.
      // I'll assume I need to pass { documentId, targetUserId: selectedDeanId }

      await hodAPI.forwardToDean(documentId, selectedDeanId);

      alert('Document forwarded to Dean successfully!');
      loadDocuments();
      setSelectedDoc(null);
      setSelectedDeanIds(prev => {
        const updated = { ...prev };
        delete updated[documentId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to forward to Dean:', err);
      const errorMessage = err.response?.data?.message || 'Failed to forward to Dean. Please ensure there is a Dean assigned in the system.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const getStatusBadge = (status) => {
    const statusMap = {
      FORWARDED_TO_HOD: { class: 'badge-pending', text: 'Pending HOD Review' },
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
            <span className="role-badge role-hod">HOD Dashboard</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img src={user.profilePicture} alt={user.name} className="user-avatar" />
              <div>
                <div className="user-name">{formatName(user.name)}</div>
                <div className="user-details">HOD • {user.department}</div>
              </div>
            </div>
            {user.roles && user.roles.includes('MENTOR') && (
              <button
                onClick={() => onRoleSwitch('MENTOR')}
                className="btn btn-secondary"
                style={{ marginRight: '10px' }}
              >
                Switch to Mentor
              </button>
            )}
            <button
              onClick={() => setIsSignatureModalOpen(true)}
              className="btn btn-secondary"
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
            Pending Approval ({stats.pending})
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
              <p>No applications for HOD review.</p>
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

                    {/* Mentor Information */}
                    {doc.mentorName && (
                      <div className="mentor-info-box">
                        <p style={{ margin: 0 }}>
                          <strong>👨‍🏫 Forwarded By Mentor</strong> | {formatName(doc.mentorName)}
                          {doc.forwardedToHodAt && (
                            <span className="text-light" style={{ marginLeft: '375px' }}>
                              <strong>Forwarded on:</strong> {formatDate(doc.forwardedToHodAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Document Information */}
                    <div className="document-info">
                      {doc.forwardedToHodAt ? (
                        <p><strong>Requested on:</strong> {formatDate(doc.forwardedToHodAt)}</p>
                      ) : (
                        <p><strong>Uploaded:</strong> {formatDate(doc.uploadedAt)}</p>
                      )}
                      {doc.mentorName && (
                        <p>
                          <strong>Mentor:</strong> {formatName(doc.mentorName)}
                          {doc.mentorContactNumber && (
                            <span style={{ display: 'block', marginTop: '2px' }}>
                              📞 {doc.mentorContactNumber}
                            </span>
                          )}
                        </p>
                      )}
                      <div className="document-view-actions">
                        <button
                          className="btn btn-preview"
                          onClick={() => handlePreviewDocument(doc.id, doc.fileName)}
                          disabled={previewLoading}
                        >
                          🔍 Preview Document
                        </button>
                      </div>
                    </div>

                    {/* Actions for Pending Documents */}
                    {doc.status === 'FORWARDED_TO_HOD' && (
                      <div className="document-actions" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                        <div className="dean-selection-group" style={{ display: 'flex', gap: '10px', flex: '1 1 auto' }}>
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <label htmlFor={`dept-select-${doc.id}`} style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Forward to Dept:</label>
                            <select
                              id={`dept-select-${doc.id}`}
                              className="form-control"
                              value={forwardDepartments[doc.id] || user.department || 'CSE'}
                              onChange={(e) => handleForwardDepartmentChange(doc.id, e.target.value)}
                              disabled={loading}
                              style={{ padding: '0.4rem' }}
                            >
                              {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ flex: 2, minWidth: '150px' }}>
                            <label htmlFor={`dean-select-${doc.id}`} style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem' }}>Select Dean:</label>
                            <select
                              id={`dean-select-${doc.id}`}
                              className="form-control dean-dropdown"
                              value={selectedDeanIds[doc.id] || ''}
                              onChange={(e) => handleDeanSelection(doc.id, e.target.value)}
                              disabled={loading || deans.length === 0}
                              style={{ padding: '0.4rem' }}
                            >
                              <option value="">-- Select Dean --</option>
                              {deans
                                .filter(dean => (dean.department || 'CSE') === (forwardDepartments[doc.id] || user.department || 'CSE'))
                                .map((dean) => (
                                  <option key={dean.id} value={dean.id}>
                                    {formatName(dean.name)}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-success"
                            onClick={() => handleApprove(doc.id)}
                            disabled={loading}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            ✓ Final Approval
                          </button>
                          <button
                            className="btn btn-warning"
                            onClick={() => handleForwardToDean(doc.id)}
                            disabled={loading || !selectedDeanIds[doc.id]}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            → Forward to Dean
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => setSelectedDoc(doc.id)}
                            disabled={loading}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            ✗ Reject
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
      </div>

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
        <SignatureUpload
          onClose={() => setIsSignatureModalOpen(false)}
          role="HOD"
        />
      )}
    </div>
  );
}

export default HodDashboard;


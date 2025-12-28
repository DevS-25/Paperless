import React, { useState, useEffect } from 'react';
import { deanAPI, adminAPI } from '../api';
import SignatureUpload from './SignatureUpload';
import './DeanDashboard.css';

function DeanDashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(user.department || 'CSE');
  const [forwardDepartments, setForwardDepartments] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState({});
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0
  });
  const [deans, setDeans] = useState([]);

  useEffect(() => {
    loadDocuments();
    loadStats();
    loadDeans();
  }, [filter]);

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

  const loadDocuments = async () => {
    try {
      setError('');
      setLoading(true);
      console.log('Loading dean documents, filter:', filter);
      const response = filter === 'pending'
        ? await deanAPI.getPendingDocuments()
        : await deanAPI.getAllDocuments();
      console.log('Dean documents loaded:', response.data);
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await deanAPI.getAllDocuments();
      const allDocs = response.data;
      const pending = allDocs.filter(d => d.status === 'FORWARDED_TO_DEAN').length;
      const approved = allDocs.filter(d => d.status === 'APPROVED_BY_DEAN' || d.status === 'FORWARDED_TO_DEAN_ACADEMICS' || d.status === 'APPROVED_BY_DEAN_ACADEMICS' || d.status === 'FORWARDED_TO_REGISTRAR' || d.status === 'APPROVED_BY_REGISTRAR').length;

      setStats({
        pending,
        approved,
        total: allDocs.length
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

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

  const handleApprove = async (documentId) => {
    if (!window.confirm('Are you sure you want to approve this document?')) return;

    setLoading(true);
    try {
      await deanAPI.approveDocument(documentId);
      alert('Document approved by Dean successfully!');
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
      await deanAPI.rejectDocument(documentId, rejectionReason);
      alert('Document rejected by Dean!');
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
  };

  const handleForwardToDeanAcademics = async (documentId) => {
    if (!window.confirm('Are you sure you want to forward this document to Dean Academics?')) return;

    setLoading(true);
    try {
      await deanAPI.forwardToDeanAcademics(documentId);
      alert('Document forwarded to Dean Academics successfully!');
      loadDocuments();
      setSelectedDoc(null);
    } catch (err) {
      console.error('Failed to forward to Dean Academics:', err);
      const errorMessage = err.response?.data?.message || 'Failed to forward to Dean Academics. Please ensure there is a Dean Academics assigned in the system.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToIndustryRelations = async (documentId) => {
    if (!window.confirm('Are you sure you want to forward this document to Industry Relations?')) return;

    setLoading(true);
    try {
      await deanAPI.forwardToIndustryRelations(documentId);
      alert('Document forwarded to Industry Relations successfully!');
      loadDocuments();
      setSelectedDoc(null);
    } catch (err) {
      console.error('Failed to forward to Industry Relations:', err);
      const errorMessage = err.response?.data?.message || 'Failed to forward to Industry Relations.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToRnd = async (documentId) => {
    if (!window.confirm('Are you sure you want to forward this document to R&D?')) return;

    setLoading(true);
    try {
      await deanAPI.forwardToRnd(documentId);
      alert('Document forwarded to R&D successfully!');
      loadDocuments();
      setSelectedDoc(null);
    } catch (err) {
      console.error('Failed to forward to R&D:', err);
      const errorMessage = err.response?.data?.message || 'Failed to forward to R&D.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToCoe = async (documentId) => {
    if (!window.confirm('Are you sure you want to forward this document to Controller of Examinations?')) return;

    setLoading(true);
    try {
      await deanAPI.forwardToCoe(documentId);
      alert('Document forwarded to CoE successfully!');
      loadDocuments();
      setSelectedDoc(null);
    } catch (err) {
      console.error('Failed to forward to CoE:', err);
      const errorMessage = err.response?.data?.message || 'Failed to forward to CoE.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToDean = async (documentId) => {
    const selectedDept = forwardDepartments[documentId];
    if (!selectedDept) {
      alert('Please select a department to forward to.');
      return;
    }

    const targetDean = deans.find(dean => dean.department === selectedDept);

    if (!targetDean) {
      alert(`No Dean found for department: ${selectedDept}`);
      return;
    }

    if (!window.confirm(`Are you sure you want to forward this document to Dean of ${selectedDept}?`)) return;

    setLoading(true);
    try {
      await deanAPI.forwardToDean(documentId, targetDean.id);
      alert(`Document forwarded to Dean of ${selectedDept} successfully!`);
      loadDocuments();
      setSelectedDoc(null);
    } catch (err) {
      console.error('Failed to forward to Dean:', err);
      const errorMessage = err.response?.data?.message || 'Failed to forward to Dean.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = async (documentId, fileName) => {
    try {
      setPreviewError('');
      setPreviewLoading(true);
      const response = await deanAPI.downloadDocument(documentId);
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
      FORWARDED_TO_MENTOR: { class: 'badge-pending', text: 'With Mentor' },
      APPROVED_BY_MENTOR: { class: 'badge-approved', text: 'Mentor Approved' },
      REJECTED_BY_MENTOR: { class: 'badge-rejected', text: 'Mentor Rejected' },
      FORWARDED_TO_HOD: { class: 'badge-pending', text: 'With HOD' },
      APPROVED_BY_HOD: { class: 'badge-approved', text: 'HOD Approved' },
      REJECTED_BY_HOD: { class: 'badge-rejected', text: 'HOD Rejected' },
      FORWARDED_TO_DEAN: { class: 'badge-pending', text: 'Pending Dean Review' },
      APPROVED_BY_DEAN: { class: 'badge-approved', text: 'Dean Approved' },
      REJECTED_BY_DEAN: { class: 'badge-rejected', text: 'Dean Rejected' },
    };
    const statusInfo = statusMap[status] || { class: 'badge-draft', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
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
            <span className="role-badge role-dean">Dean Dashboard</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img src={user.profilePicture} alt={user.name} className="user-avatar" />
              <div>
                <div className="user-name">{formatName(user.name)}</div>
                <div className="user-details">Dean • {user.department}</div>
              </div>
            </div>
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
        <div className="stats-section">
          <div className="stat-card card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">📊</div>
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

        {error && (
          <div className="card" style={{background: '#fee', color: '#c00', padding: '15px', marginBottom: '20px'}}>
            ❌ {error}
          </div>
        )}

        <section className="documents-section">
          <h2>📋 Applications</h2>
          {loading ? (
            <div className="card empty-state">
              <p>Loading...</p>
            </div>
          ) : documents.length === 0 ? (
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

                    {/* HOD Information */}
                    {doc.hodName && (
                      <div className="mentor-info-box">
                        <p style={{ margin: 0 }}>
                          <strong>👨‍🏫 Forwarded By HOD</strong> | {formatName(doc.hodName)}
                          {doc.forwardedToDeanAt && (
                            <span className="text-light forwarded-date">
                              <strong>Forwarded on:</strong> {formatDate(doc.forwardedToDeanAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Document Information */}
                    <div className="document-info">
                      {doc.forwardedToDeanAt ? (
                        <p><strong>Requested on:</strong> {formatDate(doc.forwardedToDeanAt)}</p>
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
                    {doc.status === 'FORWARDED_TO_DEAN' && (
                      <div className={`document-actions ${mobileMenuOpen[doc.id] ? 'mobile-open' : ''}`}>
                        <div className="primary-actions">
                          <button
                            className="btn btn-success btn-approve"
                            onClick={() => handleApprove(doc.id)}
                            disabled={loading}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-danger btn-reject"
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

                        <div className="secondary-actions-group">
                          <div className="dept-selection-group">
                            <select
                              id={`dept-select-${doc.id}`}
                              className="form-control"
                              value={forwardDepartments[doc.id] || ''}
                              onChange={(e) => handleForwardDepartmentChange(doc.id, e.target.value)}
                              disabled={loading}
                              style={{ padding: '0.25rem', fontSize: '0.8rem', height: 'auto' }}
                            >
                              <option value="">Select Dean</option>
                              {departments
                                .filter(dept => dept !== user.department)
                                .map(dept => (
                                  <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                          </div>
                          <button
                            className="btn btn-warning btn-forward"
                            onClick={() => handleForwardToDean(doc.id)}
                            disabled={loading || !forwardDepartments[doc.id]}
                          >
                            → Forward to Dean
                          </button>
                          <button
                            className="btn btn-warning btn-forward"
                            onClick={() => handleForwardToDeanAcademics(doc.id)}
                            disabled={loading}
                          >
                            → Forward to Dean Academics
                          </button>
                          <button
                            className="btn btn-warning btn-forward"
                            onClick={() => handleForwardToIndustryRelations(doc.id)}
                            disabled={loading}
                          >
                            → Forward to Industry Relations
                          </button>
                          <button
                            className="btn btn-warning btn-forward"
                            onClick={() => handleForwardToRnd(doc.id)}
                            disabled={loading}
                          >
                            → Forward to R&D
                          </button>
                          <button
                            className="btn btn-warning btn-forward"
                            onClick={() => handleForwardToCoe(doc.id)}
                            disabled={loading}
                          >
                            → Forward to CoE
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
                {previewError ? (
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

      {isSignatureModalOpen && (
        <SignatureUpload onClose={() => setIsSignatureModalOpen(false)} />
      )}
    </div>
  );
}

export default DeanDashboard;


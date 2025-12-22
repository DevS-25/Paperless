import React, { useState, useEffect } from 'react';
import { industryRelationsAPI } from '../api';
import SignatureUpload from './SignatureUpload';
import './IndustryRelationDashboard.css';

function IndustryRelationDashboard({ user, onLogout }) {
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
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0
  });

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, [filter]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const loadDocuments = async () => {
    try {
      setError('');
      setLoading(true);
      console.log('Loading Industry Relations documents, filter:', filter);
      const response = filter === 'pending'
        ? await industryRelationsAPI.getPendingDocuments()
        : await industryRelationsAPI.getAllDocuments();
      console.log('Industry Relations documents loaded:', response.data);
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load documents. Backend might be missing.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await industryRelationsAPI.getAllDocuments();
      const allDocs = response.data;
      const pending = allDocs.filter(d => d.status === 'FORWARDED_TO_INDUSTRY_RELATIONS').length;
      const approved = allDocs.filter(d => d.status === 'APPROVED_BY_INDUSTRY_RELATIONS').length;

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
      await industryRelationsAPI.approveDocument(documentId);
      alert('Document approved by Industry Relations successfully!');
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
      await industryRelationsAPI.rejectDocument(documentId, rejectionReason);
      alert('Document rejected by Industry Relations!');
      loadDocuments();
      setSelectedDoc(null);
      setRejectionReason('');
    } catch (err) {
      alert('Failed to reject document');
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToDean = async (documentId) => {
    if (!window.confirm('Are you sure you want to forward this document to Dean?')) return;

    setLoading(true);
    try {
      await industryRelationsAPI.forwardToDean(documentId);
      alert('Document forwarded to Dean successfully!');
      loadDocuments();
    } catch (err) {
      alert('Failed to forward document to Dean');
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToDeanAcademics = async (documentId) => {
    if (!window.confirm('Are you sure you want to forward this document to Dean Academics?')) return;

    setLoading(true);
    try {
      await industryRelationsAPI.forwardToDeanAcademics(documentId);
      alert('Document forwarded to Dean Academics successfully!');
      loadDocuments();
    } catch (err) {
      alert('Failed to forward document to Dean Academics');
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToRnd = async (documentId) => {
    if (!window.confirm('Are you sure you want to forward this document to R&D?')) return;

    setLoading(true);
    try {
      await industryRelationsAPI.forwardToRnd(documentId);
      alert('Document forwarded to R&D successfully!');
      loadDocuments();
    } catch (err) {
      alert('Failed to forward document to R&D');
    } finally {
      setLoading(false);
    }
  };

  const handleForwardToHod = async (documentId) => {
    if (!window.confirm('Are you sure you want to forward this document to HOD?')) return;

    setLoading(true);
    try {
      await industryRelationsAPI.forwardToHod(documentId);
      alert('Document forwarded to HOD successfully!');
      loadDocuments();
    } catch (err) {
      alert('Failed to forward document to HOD');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = async (documentId, fileName) => {
    try {
      setPreviewError('');
      setPreviewLoading(true);
      const response = await industryRelationsAPI.downloadDocument(documentId);
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
      FORWARDED_TO_INDUSTRY_RELATIONS: { class: 'badge-pending', text: 'Pending Review' },
      APPROVED_BY_INDUSTRY_RELATIONS: { class: 'badge-approved', text: 'Approved' },
      REJECTED_BY_INDUSTRY_RELATIONS: { class: 'badge-rejected', text: 'Rejected' },
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📄 Paperless</h1>
            <span className="role-badge role-industry-relations">Industry Relations Dashboard</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img src={user.profilePicture} alt={user.name} className="user-avatar" />
              <div>
                <div className="user-name">{formatName(user.name)}</div>
                <div className="user-details">Industry Relations</div>
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

                    {/* Dean Information */}
                    {doc.deanName && (
                      <div className="mentor-info-box">
                        <p style={{ margin: 0 }}>
                          <strong>👨‍🏫 Forwarded By Dean</strong> | {formatName(doc.deanName)}
                          {doc.forwardedToIndustryRelationsAt && (
                            <span className="text-light" style={{ marginLeft: '375px' }}>
                              <strong>Forwarded on:</strong> {formatDate(doc.forwardedToIndustryRelationsAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="document-info">
                      {doc.forwardedToIndustryRelationsAt ? (
                        <p><strong>Requested on:</strong> {formatDate(doc.forwardedToIndustryRelationsAt)}</p>
                      ) : (
                        <p><strong>Uploaded:</strong> {formatDate(doc.uploadedAt)}</p>
                      )}
                      {doc.mentorName && (
                        <p>
                          <strong>Mentor:</strong> {formatName(doc.mentorName)}
                          {doc.mentorContactNumber && (
                            <span style={{ display: 'block', marginTop: '2px' }}>
                              <strong>Mentor Contact No: </strong> {doc.mentorContactNumber}
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

                    {doc.status === 'FORWARDED_TO_INDUSTRY_RELATIONS' && (
                      <div className="document-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(doc.id)}
                          disabled={loading}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn btn-info"
                          onClick={() => handleForwardToDean(doc.id)}
                          disabled={loading}
                        >
                          → Forward to Dean
                        </button>
                        <button
                          className="btn btn-info"
                          onClick={() => handleForwardToDeanAcademics(doc.id)}
                          disabled={loading}
                        >
                          → Forward to Dean Academics
                        </button>
                        <button
                          className="btn btn-info"
                          onClick={() => handleForwardToRnd(doc.id)}
                          disabled={loading}
                        >
                          → Forward to R&D
                        </button>
                        <button
                          className="btn btn-info"
                          onClick={() => handleForwardToHod(doc.id)}
                          disabled={loading}
                        >
                          → Forward to HOD
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => setSelectedDoc(doc.id)}
                          disabled={loading}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}

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
                {previewError && !previewLoading ? (
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

export default IndustryRelationDashboard;


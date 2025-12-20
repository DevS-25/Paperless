import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  googleLogin: (userData) => api.post('/auth/google-login', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  setUserRole: (email, role) => api.post('/auth/set-role', { email, role }),
  adminLogin: (credentials) => api.post('/auth/admin-login', credentials),
  uploadSignature: (formData) => api.post('/user/signature', formData, {
    headers: {
      'Content-Type': undefined,
    },
  }),
};

// Student APIs
export const studentAPI = {
  uploadDocument: (formData) => {
    return api.post('/student/upload', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
  },
  getMyDocuments: () => api.get('/student/documents'),
  forwardToMentor: (documentId, mentorId) =>
    api.post(`/student/forward/${documentId}?mentorId=${mentorId}`),
  getMentors: () => api.get('/student/mentors'),
  downloadDocument: (documentId) =>
    api.get(`/student/document/${documentId}/download`, { responseType: 'blob' }),
  deleteDocument: (documentId) => api.delete(`/student/document/${documentId}`),
};

// Mentor APIs
export const mentorAPI = {
  getPendingDocuments: () => api.get('/mentor/pending-documents'),
  getAllDocuments: () => api.get('/mentor/all-documents'),
  approveDocument: (documentId) => api.post('/mentor/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/mentor/reject', { documentId, rejectionReason }),
  forwardToHod: (documentId, hodId) =>
    api.post('/mentor/forward-to-hod', { documentId, mentorId: hodId }),
  downloadDocument: (documentId) =>
    api.get(`/mentor/document/${documentId}/download`, { responseType: 'blob' }),
};

// HOD APIs
export const hodAPI = {
  getPendingDocuments: () => api.get('/hod/pending-documents'),
  getAllDocuments: () => api.get('/hod/all-documents'),
  approveDocument: (documentId) => api.post('/hod/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/hod/reject', { documentId, rejectionReason }),
  forwardToDean: (documentId) =>
    api.post('/hod/forward-to-dean', { documentId }),
  downloadDocument: (documentId) =>
    api.get(`/hod/document/${documentId}/download`, { responseType: 'blob' }),
};

// Dean APIs
export const deanAPI = {
  getPendingDocuments: () => api.get('/dean/pending-documents'),
  getAllDocuments: () => api.get('/dean/all-documents'),
  approveDocument: (documentId) => api.post('/dean/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/dean/reject', { documentId, rejectionReason }),
  forwardToDeanAcademics: (documentId) =>
    api.post('/dean/forward-to-dean-academics', { documentId }),
  forwardToIndustryRelations: (documentId) =>
    api.post('/dean/forward-to-industry-relations', { documentId }),
  forwardToRnd: (documentId) =>
    api.post('/dean/forward-to-rnd', { documentId }),
  forwardToCoe: (documentId) =>
    api.post('/dean/forward-to-coe', { documentId }),
  forwardToDean: (documentId, targetUserId) =>
    api.post('/dean/forward-to-dean', { documentId, targetUserId }),
  downloadDocument: (documentId) =>
    api.get(`/dean/document/${documentId}/download`, { responseType: 'blob' }),
};

// Dean Academics APIs
export const deanAcademicsAPI = {
  getPendingDocuments: () => api.get('/dean-academics/pending-documents'),
  getAllDocuments: () => api.get('/dean-academics/all-documents'),
  approveDocument: (documentId) => api.post('/dean-academics/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/dean-academics/reject', { documentId, rejectionReason }),
  forwardToRegistrar: (documentId) =>
    api.post('/dean-academics/forward-to-registrar', { documentId }),
  downloadDocument: (documentId) =>
    api.get(`/dean-academics/document/${documentId}/download`, { responseType: 'blob' }),
};

// Registrar APIs
export const registrarAPI = {
  getPendingDocuments: () => api.get('/registrar/pending-documents'),
  getAllDocuments: () => api.get('/registrar/all-documents'),
  approveDocument: (documentId) => api.post('/registrar/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/registrar/reject', { documentId, rejectionReason }),
  downloadDocument: (documentId) =>
    api.get(`/registrar/document/${documentId}/download`, { responseType: 'blob' }),
};

// CoE APIs
export const coeAPI = {
  getPendingDocuments: () => api.get('/coe/pending-documents'),
  getAllDocuments: () => api.get('/coe/all-documents'),
  approveDocument: (documentId) => api.post('/coe/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/coe/reject', { documentId, rejectionReason }),
  downloadDocument: (documentId) =>
    api.get(`/coe/document/${documentId}/download`, { responseType: 'blob' }),
};

// R&D APIs
export const rndAPI = {
  getPendingDocuments: () => api.get('/rnd/pending-documents'),
  getAllDocuments: () => api.get('/rnd/all-documents'),
  approveDocument: (documentId) => api.post('/rnd/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/rnd/reject', { documentId, rejectionReason }),
  downloadDocument: (documentId) =>
    api.get(`/rnd/document/${documentId}/download`, { responseType: 'blob' }),
};

// Industry Relations APIs
export const industryRelationsAPI = {
  getPendingDocuments: () => api.get('/industry-relations/pending-documents'),
  getAllDocuments: () => api.get('/industry-relations/all-documents'),
  approveDocument: (documentId) => api.post('/industry-relations/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/industry-relations/reject', { documentId, rejectionReason }),
  forwardToDean: (documentId) =>
    api.post('/industry-relations/forward-to-dean', { documentId }),
  forwardToDeanAcademics: (documentId) =>
    api.post('/industry-relations/forward-to-dean-academics', { documentId }),
  forwardToRnd: (documentId) =>
    api.post('/industry-relations/forward-to-rnd', { documentId }),
  forwardToHod: (documentId) =>
    api.post('/industry-relations/forward-to-hod', { documentId }),
  downloadDocument: (documentId) =>
    api.get(`/industry-relations/document/${documentId}/download`, { responseType: 'blob' }),
};

// Exam Cell APIs
export const examCellAPI = {
  getPendingDocuments: () => api.get('/exam-cell/pending-documents'),
  getAllDocuments: () => api.get('/exam-cell/all-documents'),
  approveDocument: (documentId) => api.post('/exam-cell/approve', { documentId }),
  rejectDocument: (documentId, rejectionReason) =>
    api.post('/exam-cell/reject', { documentId, rejectionReason }),
  downloadDocument: (documentId) =>
    api.get(`/exam-cell/document/${documentId}/download`, { responseType: 'blob' }),
};

// Admin APIs
export const adminAPI = {
  getStatistics: () => api.get('/admin/statistics'),
  getAllUsers: () => api.get('/admin/users'),
};

export default api;

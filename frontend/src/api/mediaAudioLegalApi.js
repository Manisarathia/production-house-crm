// Task 5 API Service for Media, Audio & Legal Management
// Interfaces with Spring Boot REST Controllers via Axios

import axiosClient from './axiosClient.js';

// Helper to extract items from either a direct array or Spring Data Page ({ content: [...] })
export const extractPageItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (response && typeof response === 'object') {
    const found = Object.values(response).find(Array.isArray);
    if (found) return found;
  }
  return [];
};

// ============================================================================
// 1. POST-PRODUCTION TASKS API (/api/mediahouse/postproduction)
// ============================================================================

export const normalizePostProductionStatusToBackend = (status) => {
  const map = {
    'in progress': 'IN_PROGRESS',
    'pending review': 'IN_REVIEW',
    'completed': 'COMPLETED',
    'on hold': 'ON_HOLD',
    'not started': 'NOT_STARTED',
  };
  return map[(status || '').trim().toLowerCase()] || 'IN_PROGRESS';
};

export const normalizePostProductionStatusToFrontend = (status) => {
  const map = {
    'IN_PROGRESS': 'In Progress',
    'IN_REVIEW': 'Pending Review',
    'COMPLETED': 'Completed',
    'ON_HOLD': 'On Hold',
    'NOT_STARTED': 'Not Started',
  };
  return map[status] || status || 'In Progress';
};

export const postProductionApi = {
  list: (params = {}) => axiosClient.get('/mediahouse/postproduction', { params }),
  get: (id) => axiosClient.get(`/mediahouse/postproduction/${id}`),
  create: (payload) => axiosClient.post('/mediahouse/postproduction', payload),
  update: (id, payload) => axiosClient.put(`/mediahouse/postproduction/${id}`, payload),
  delete: (id) => axiosClient.delete(`/mediahouse/postproduction/${id}`),
};

// ============================================================================
// 2. MEDIA ASSETS API (/api/mediahouse/media)
// ============================================================================

export const normalizeMediaStatusToBackend = (status) => {
  const map = {
    'ready': 'READY',
    'in transcode': 'IN_TRANSCODE',
    'archived': 'ARCHIVED',
    'quarantined': 'QUARANTINED',
    'uploaded': 'UPLOADED',
  };
  return map[(status || '').trim().toLowerCase()] || 'READY';
};

export const normalizeMediaStatusToFrontend = (status) => {
  const map = {
    'READY': 'Ready',
    'IN_TRANSCODE': 'In Transcode',
    'ARCHIVED': 'Archived',
    'QUARANTINED': 'Quarantined',
    'UPLOADED': 'Uploaded',
  };
  return map[status] || status || 'Ready';
};

export const mediaAssetApi = {
  list: (params = {}) => axiosClient.get('/mediahouse/media', { params }),
  get: (id) => axiosClient.get(`/mediahouse/media/${id}`),
  create: (payload) => axiosClient.post('/mediahouse/media', payload),
  update: (id, payload) => axiosClient.put(`/mediahouse/media/${id}`, payload),
  delete: (id) => axiosClient.delete(`/mediahouse/media/${id}`),
};

// ============================================================================
// 3. SINGER PROFILES API (/api/audio/singers)
// ============================================================================

export const normalizeSingerStatusToBackend = (status) => {
  return (status || '').toLowerCase() === 'inactive' ? 'INACTIVE' : 'ACTIVE';
};

export const normalizeSingerStatusToFrontend = (status) => {
  return (status || '').toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active';
};

export const singerApi = {
  list: (params = {}) => axiosClient.get('/audio/singers', { params }),
  get: (id) => axiosClient.get(`/audio/singers/${id}`),
  create: (payload) => axiosClient.post('/audio/singers', payload),
  update: (id, payload) => axiosClient.put(`/audio/singers/${id}`, payload),
  delete: (id) => axiosClient.delete(`/audio/singers/${id}`),
};

// ============================================================================
// 4. DUBBING SESSIONS API (/api/audio/dubbing)
// ============================================================================

export const normalizeDubbingStatusToBackend = (status) => {
  const map = {
    'scheduled': 'SCHEDULED',
    'in progress': 'IN_PROGRESS',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
    'on hold': 'ON_HOLD',
  };
  return map[(status || '').trim().toLowerCase()] || 'SCHEDULED';
};

export const normalizeDubbingStatusToFrontend = (status) => {
  const map = {
    'SCHEDULED': 'Scheduled',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
    'ON_HOLD': 'On Hold',
  };
  return map[status] || status || 'Scheduled';
};

export const dubbingApi = {
  list: (params = {}) => axiosClient.get('/audio/dubbing', { params }),
  get: (id) => axiosClient.get(`/audio/dubbing/${id}`),
  create: (payload) => axiosClient.post('/audio/dubbing', payload),
  update: (id, payload) => axiosClient.put(`/audio/dubbing/${id}`, payload),
  delete: (id) => axiosClient.delete(`/audio/dubbing/${id}`),
};

// ============================================================================
// 5. CONTRACTS API (/api/legal/contracts)
// ============================================================================

export const normalizeContractStatusToBackend = (status) => {
  const map = {
    'active': 'ACTIVE',
    'pending': 'PENDING',
    'draft': 'DRAFT',
    'expired': 'EXPIRED',
    'terminated': 'TERMINATED',
  };
  return map[(status || '').trim().toLowerCase()] || 'ACTIVE';
};

export const normalizeContractStatusToFrontend = (status) => {
  const map = {
    'ACTIVE': 'Active',
    'PENDING': 'Pending Review',
    'DRAFT': 'Draft',
    'EXPIRED': 'Expired',
    'TERMINATED': 'Terminated',
  };
  return map[status] || status || 'Active';
};

export const contractApi = {
  list: (params = {}) => axiosClient.get('/legal/contracts', { params }),
  get: (id) => axiosClient.get(`/legal/contracts/${id}`),
  create: (payload) => axiosClient.post('/legal/contracts', payload),
  update: (id, payload) => axiosClient.put(`/legal/contracts/${id}`, payload),
  delete: (id) => axiosClient.delete(`/legal/contracts/${id}`),
};

// ============================================================================
// 6. CONTENT RIGHTS API (/api/legal/rights)
// ============================================================================

export const normalizeRightsStatusToBackend = (status) => {
  const map = {
    'active': 'ACTIVE',
    'draft': 'DRAFT',
    'expired': 'EXPIRED',
    'terminated': 'TERMINATED',
  };
  return map[(status || '').trim().toLowerCase()] || 'ACTIVE';
};

export const normalizeRightsStatusToFrontend = (status) => {
  const map = {
    'ACTIVE': 'Active',
    'DRAFT': 'Draft',
    'EXPIRED': 'Expired',
    'TERMINATED': 'Terminated',
  };
  return map[status] || status || 'Active';
};

export const contentRightApi = {
  list: (params = {}) => axiosClient.get('/legal/rights', { params }),
  get: (id) => axiosClient.get(`/legal/rights/${id}`),
  create: (payload) => axiosClient.post('/legal/rights', payload),
  update: (id, payload) => axiosClient.put(`/legal/rights/${id}`, payload),
  delete: (id) => axiosClient.delete(`/legal/rights/${id}`),
};


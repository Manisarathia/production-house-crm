import axiosClient from './axiosClient.js';

export const dashboardApi = {
  get: () => axiosClient.get('/dashboard'),
  trends: () => axiosClient.get('/dashboard/trends'),
  projects: () => axiosClient.get('/production/projects'),
};

export const departmentsApi = {
  list: (params = {}) => axiosClient.get('/departments', { params }),
  create: (payload) => axiosClient.post('/departments', payload),
  update: (id, payload) => axiosClient.put(`/departments/${id}`, payload),
  delete: (id) => axiosClient.delete(`/departments/${id}`),
};

export const teamMembersApi = {
  list: (params = {}) => axiosClient.get('/users', { params }),
  create: (payload) => axiosClient.post('/users', payload),
  updateStatus: (id, status) => axiosClient.patch(`/users/${id}/status`, { status }),
  replaceRoles: (id, roles) => axiosClient.put(`/users/${id}/roles`, { roles }),
};

export const rolesApi = {
  list: () => axiosClient.get('/roles'),
  create: (payload) => axiosClient.post('/roles', payload),
  update: (id, payload) => axiosClient.put(`/roles/${id}`, payload),
};

export const settingsApi = {
  list: () => axiosClient.get('/settings'),
  create: (payload) => axiosClient.post('/settings', payload),
  update: (key, value) => axiosClient.put(`/settings/${encodeURIComponent(key)}`, { value }),
};

export const authApi = {
  login: (payload) => axiosClient.post('/auth/login', payload),
  register: (payload) => axiosClient.post('/auth/register', payload),
  logout: () => axiosClient.post('/auth/logout'),
};

import api from './api';

export const jobsService = {
  getAll: (params) => api.get('/jobs', { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  getFeatured: () => api.get('/jobs/featured'),
  getSaved: () => api.get('/jobs/saved'),
  getMyJobs: (params) => api.get('/jobs/employer/my-jobs', { params }),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  save: (id) => api.post(`/jobs/${id}/save`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
};

export const applicationsService = {
  getMine: (params) => api.get('/applications', { params }),
  getJobApplicants: (jobId, params) => api.get(`/applications/employer/jobs/${jobId}/applicants`, { params }),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  withdraw: (id, data) => api.patch(`/applications/${id}/withdraw`, data),
};

export const profileService = {
  get: () => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
  getPublic: (userId) => api.get(`/profile/${userId}/public`),
  uploadAvatar: (formData) => api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCV: (formData) => api.post('/profile/cv', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addSkill: (data) => api.post('/profile/skills', data),
  updateSkill: (id, data) => api.patch(`/profile/skills/${id}`, data),
  removeSkill: (id) => api.delete(`/profile/skills/${id}`),
  addEducation: (data) => api.post('/profile/education', data),
  updateEducation: (id, data) => api.patch(`/profile/education/${id}`, data),
  removeEducation: (id) => api.delete(`/profile/education/${id}`),
  addExperience: (data) => api.post('/profile/experience', data),
  updateExperience: (id, data) => api.patch(`/profile/experience/${id}`, data),
  removeExperience: (id) => api.delete(`/profile/experience/${id}`),
  addCertification: (data) => api.post('/profile/certifications', data),
  removeCertification: (id) => api.delete(`/profile/certifications/${id}`),
  addProject: (data) => api.post('/profile/projects', data),
  removeProject: (id) => api.delete(`/profile/projects/${id}`),
};

export const companyService = {
  getAll: (params) => api.get('/companies', { params }),
  getOne: (id) => api.get(`/companies/${id}`),
  getMine: () => api.get('/companies/my-company'),
  update: (id, data) => api.patch(`/companies/${id}`, data),
  uploadLogo: (formData) => api.post('/companies/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const messagesService = {
  getConversations: () => api.get('/messages'),
  getOrCreate: (data) => api.post('/messages/conversations', data),
  getMessages: (id, params) => api.get(`/messages/${id}/messages`, { params }),
  send: (id, data) => api.post(`/messages/${id}/messages`, data),
};

export const notificationsService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  updateJob: (id, data) => api.patch(`/admin/jobs/${id}`, data),
  getApplications: (params) => api.get('/admin/applications', { params }),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

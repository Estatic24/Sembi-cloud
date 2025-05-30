import api from './api';

export const AdminService = {
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  changeUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  toggleUserStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, { isActive }),

  getTracks: (params = {}) => api.get('/admin/tracks', { params }),
  approveTrack: (trackId) => api.put(`/admin/tracks/${trackId}/approve`),
  deleteTrack: (trackId) => api.delete(`/admin/tracks/${trackId}`),

  getPlaylists: (params = {}) => api.get('/admin/playlists', { params }),
  deletePlaylist: (playlistId) => api.delete(`/admin/playlists/${playlistId}`),

  getStats: () => api.get('/admin/stats'),

  getPendingContent: () => api.get('/admin/moderation/pending'),
  approveContent: (contentId, contentType) => api.put(`/admin/moderation/approve`, { contentId, contentType }),
  rejectContent: (contentId, contentType, reason) => api.put(`/admin/moderation/reject`, { contentId, contentType, reason }),
};
import api from './api'

export const PlaylistService = {
  create: (data) => api.post('/playlists', data),
  getById: (id) => api.get(`/playlists/${id}`),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  toggleLike: (id) => api.post(`/playlists/${id}/like`),
  toggleFavorite: (id) => api.post(`/playlists/${id}/favorite`),
  search: (query) => api.get('/playlists/search', { 
    params: { query },
    validateStatus: (status) => status < 500
  }),
  getRandom: (limit = 5) => api.get(`/playlists/random?limit=${limit}`),
  getAllPlaylists: () => api.get('/playlists'),
}

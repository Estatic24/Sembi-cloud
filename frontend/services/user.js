import api from './api'

export const UserService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getMyPlaylists: () => api.get('/users/playlists'),
  getFavorites: () => api.get('/users/favorites').then(res => res.data.data),
  toggleFavorite: (playlistId) => api.post(`/users/favorites/${playlistId}`),
}
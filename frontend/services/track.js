// services/track.js
import api from './api'

export const TrackService = {
  suggestTrack: (data) => api.post('/tracks/suggest', data),
  addTrack: (data) => api.post('/tracks', data),
  approveTrack: (id) => api.put(`/tracks/${id}/approve`),
  getApproved: () => api.get('/tracks'),
  getPending: () => api.get('/tracks/pending'),
  addToPlaylist: (playlistId, trackId) => api.post(`/tracks/${trackId}/playlists/${playlistId}`),
  removeFromPlaylist: (playlistId, trackId) => api.delete(`/tracks/${trackId}/playlists/${playlistId}`),
  getById: (id) => api.get(`/tracks/${id}`),
  getAllTracks: () => api.get('/tracks/all'),
  getApprovedTracks: (params) => api.get('/tracks', { params }),
  getRandom: (limit = 5) => api.get(`/tracks/random?limit=${limit}`),
}

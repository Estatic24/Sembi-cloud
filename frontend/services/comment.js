import api from './api'

export const CommentService = {
  create: (playlistId, text) => api.post(`/comments/${playlistId}`, { text }),
  getByPlaylistId: (playlistId) => api.get(`/comments/${playlistId}`),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
}


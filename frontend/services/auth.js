import api from './api'
import Cookies from 'js-cookie'

export const AuthService = {
  register: (data) => api.post('/auth/register', data),

  login: async (data) => {
    const res = await api.post('/auth/login', data)
    const { accessToken, refreshToken } = res.data
    Cookies.set('accessToken', accessToken)
    Cookies.set('refreshToken', refreshToken)
    return res
  },

  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  logout: () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
  },
}

import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.request.use(config => {
  const token = Cookies.get('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    if (error.response?.status !== 401 || originalRequest.url === '/auth/refresh') {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch(err => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken = Cookies.get('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const { data } = await api.post('/auth/refresh', { refreshToken })
      Cookies.set('accessToken', data.accessToken)
      Cookies.set('refreshToken', data.refreshToken)
      api.defaults.headers.Authorization = `Bearer ${data.accessToken}`
      processQueue(null, data.accessToken)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
import axios from 'axios'

// We store the token in memory (module-level variable)
// This survives component re-renders but NOT page refresh
// Page refresh → new accessToken fetched using refreshToken cookie
let accessToken = null

// These functions let other files get/set the token
export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => {
  return accessToken
}

export const clearAccessToken = () => {
  accessToken = null
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  // CRITICAL — sends httpOnly refreshToken cookie automatically
  // with every request to the backend
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── REQUEST INTERCEPTOR ───────────────────────────────
// Runs before every request — adds token to header
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── RESPONSE INTERCEPTOR ─────────────────────────────
// Runs after every response — handles expired token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshTokenRequest
    ) {
      originalRequest._retry = true
       const isRefreshRequest = originalRequest.url?.includes(
      '/auth/refresh-token'
    )
     if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true

      try {
        // refreshToken cookie sent automatically (withCredentials)
        // Server reads cookie → returns new accessToken
        const response = await api.post('/api/auth/refresh-token')
        const newToken = response.data.accessToken

        // Store in memory — NOT localStorage
        setAccessToken(newToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh token expired → force logout
        clearAccessToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    }

    return Promise.reject(error)
  }
)

export default api
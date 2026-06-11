import api from './axiosInstance'

// ─────────────────────────────────────────────────────
// AUTH API FUNCTIONS
// Each function = one API call to backend
// Components never call axios directly
// They always call these functions
// ─────────────────────────────────────────────────────

// Register new user
export const registerUser = (userData) => {
  return api.post('/api/auth/register', userData)
  // userData = { name, email, password, confirmPassword }
}

// Login user
export const loginUser = (credentials) => {
  return api.post('/api/auth/login', credentials)
  // credentials = { email, password }
}

// Logout user
export const logoutUser = () => {
  return api.post('/api/auth/logout')
}

// Get current logged in user
export const getMe = () => {
  return api.get('/api/auth/me')
}

// Refresh access token
export const refreshAccessToken = () => {
  return api.post('/api/auth/refresh-token')
}
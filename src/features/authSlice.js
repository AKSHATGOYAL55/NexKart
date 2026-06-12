import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  loginUser,
  registerUser,
  logoutUser,
  getMe
} from '../api/auth.api'
import {
  setAccessToken,
  clearAccessToken
} from '../api/axiosInstance'

// ── Async Thunks ─────────────────────────────────────

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials)
      const { accessToken, user } = response.data

      // Store token in memory via axiosInstance
      // NOT in localStorage
      setAccessToken(accessToken)

      return { accessToken, user }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      )
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUser(userData)
      const { accessToken, user } = response.data

      setAccessToken(accessToken)

      return { accessToken, user }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    } finally {
      // Always clear token — even if API call fails
      clearAccessToken()
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // This uses refreshToken cookie to get a new accessToken
      // Then fetches current user
      const tokenResponse = await import('../api/auth.api')
        .then(m => m.refreshAccessToken())

      const newToken = tokenResponse.data.accessToken
      setAccessToken(newToken)

      // Now fetch user with new token
      const userResponse = await getMe()
      return {
        user: userResponse.data.user,
        accessToken: newToken
      }
    } catch (error) {
      // No valid refresh token — user must login again
      clearAccessToken()
      return rejectWithValue('Session expired')
    }
  }
)

// ── Auth Slice ───────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    // NO localStorage here — purely in memory
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },

  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

    // ── Register ───────────────────────────────────────
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // ── Logout ─────────────────────────────────────────
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
      })

    // ── Fetch Current User (on page refresh) ──────────
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchCurrentUser } from './features/authSlice'
import { fetchCart } from './features/cartSlice'
import AppRoutes from './routes/AppRoutes'

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

const App = () => {
  const dispatch = useDispatch()
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Try to restore session using refresh token cookie
        // Works on both desktop and mobile if cookie exists
        const result = await dispatch(fetchCurrentUser()).unwrap()
        if (result) {
          // Session restored — fetch cart too
          dispatch(fetchCart())
        }
      } catch (error) {
        // No valid session — user needs to login
        // This is normal for first-time visitors
      } finally {
        // Always set restoring to false
        // So app renders even if not logged in
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, [dispatch])

  // Show loading screen while restoring session
  // Prevents flash of logged-out state on mobile refresh
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-3">
            Nex<span className="text-gray-900">Kart</span>
          </div>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  )
}

export default App
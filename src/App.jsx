import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchCurrentUser } from './features/authSlice'
import { fetchCart } from './features/cartSlice'
import AppRoutes from './routes/AppRoutes'

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
        const result = await dispatch(fetchCurrentUser()).unwrap()
        if (result?.user) {
          dispatch(fetchCart()).catch(() => {})
        }
      } catch {
        // Session expired or backend not running
        // Either way — just show the app as logged out
        // Don't crash or show error
      } finally {
        // Always stop loading — even if backend is down
        // Users can still see the UI
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, [dispatch])

  // Show loading splash for max 3 seconds
  // After that show app regardless of backend status
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsRestoring(false)
    }, 3000)
    return () => clearTimeout(timeout)
  }, [])

  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4">
            <span className="text-blue-600">Nex</span>
            <span className="text-gray-900">Kart</span>
          </div>
          <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
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
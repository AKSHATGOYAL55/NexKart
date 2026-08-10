import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchCurrentUser } from './features/authSlice'
import { fetchCart } from './features/cartSlice'
import { startKeepAlive } from './utils/keepAlive'
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
    // Start keep-alive ping immediately
    const stopKeepAlive = startKeepAlive()

    const restoreSession = async () => {
      try {
        const result = await dispatch(fetchCurrentUser()).unwrap()
        if (result?.user) {
          dispatch(fetchCart()).catch(() => {})
        }
      } catch {
        // No session — show public pages
      } finally {
        setIsRestoring(false)
      }
    }

    restoreSession()

    // Safety timeout — show app after 3 seconds max
    const timeout = setTimeout(() => {
      setIsRestoring(false)
    }, 3000)

    return () => {
      stopKeepAlive()
      clearTimeout(timeout)
    }
  }, [dispatch])

  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4">
            <span className="text-blue-600">Nex</span>
            <span className="text-gray-900">Kart</span>
          </div>
          <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-xs mt-3">
            Starting up...
          </p>
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
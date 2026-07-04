import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {useLocation} from 'react-router-dom'
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

  useEffect(() => {
    // On page refresh — try to restore session
    // using the httpOnly refreshToken cookie
    // If cookie exists and valid → user stays logged in
    // If cookie missing or expired → user must login
    dispatch(fetchCurrentUser())
      .unwrap()
      .then(() => {
        // User restored — fetch their cart too
        dispatch(fetchCart())
      })
      .catch(() => {
        // No valid session — that's okay
        // User will see public pages, login when needed
      })
  }, [dispatch])

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  )
}

export default App
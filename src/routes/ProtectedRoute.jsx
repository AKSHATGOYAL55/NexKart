import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

// ─────────────────────────────────────────────────────
// PROTECTED ROUTE
// Wraps pages that require login
// If not authenticated → redirect to /login
// Remembers where user was trying to go
// ─────────────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth)
  const location = useLocation()

  // While checking session (fetchCurrentUser on app load)
  // show nothing or a spinner — avoid flash of login page
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Save the page user was trying to visit
    // After login, we redirect them back here
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
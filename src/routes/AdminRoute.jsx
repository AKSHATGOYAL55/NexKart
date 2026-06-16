import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// ─────────────────────────────────────────────────────
// ADMIN ROUTE
// Wraps admin-only pages
// Checks both: logged in AND role === 'admin'
// ─────────────────────────────────────────────────────

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    // Logged in but not admin — redirect to home
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { logout } from '../../features/authSlice'
import useSearchQuery from '../../hooks/useSearchQuery'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const cartCount = items?.length || 0

  // ── Shared search hook ─────────────────────────────
  const {
    inputValue,
    handleChange,
    handleSubmit,
    handleClear,
  } = useSearchQuery(400)

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out successfully')
    setIsProfileOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">
              Nex<span className="text-gray-900">Kart</span>
            </span>
          </Link>

          {/* ── Search Bar — Desktop ──────────────── */}
          <form
            onSubmit={handleSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search products, brands and more..."
                className="w-full bg-gray-100 border border-transparent rounded-full px-4 py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />

              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={14} />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* ── Right Side Actions ────────────────── */}
          <div className="flex items-center gap-4">

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth Section — Desktop */}
            <div className="hidden md:block relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={16} /> My Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package size={16} /> My Orders
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard size={16} /> Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────── */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-100 rounded-full px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-2"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>

            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-2 py-2 mb-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm text-gray-700"
                >
                  <User size={16} /> My Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm text-gray-700"
                >
                  <Package size={16} /> My Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-2 py-2.5 text-sm text-gray-700"
                  >
                    <LayoutDashboard size={16} /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-2 py-2.5 text-sm text-red-600"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3 px-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import MainLayout from '../components/Layout/MainLayout'

// ─────────────────────────────────────────────────────
// LAZY LOADING
// Each page loads only when user navigates to it
// Reduces initial bundle size significantly
// ─────────────────────────────────────────────────────

const Home = lazy(() => import('../pages/Home'))
const Products = lazy(() => import('../pages/Products'))
const ProductDetail = lazy(() => import('../pages/ProductDetail'))
const Cart = lazy(() => import('../pages/Cart'))
const Checkout = lazy(() => import('../pages/Checkout'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Profile = lazy(() => import('../pages/Profile'))
const OrderHistory = lazy(() => import('../pages/OrderHistory'))
const OrderDetail = lazy(() => import('../pages/OrderDetail'))
const NotFound = lazy(() => import('../pages/NotFound'))

// // Admin pages

const Dashboard = lazy(()=> import('../pages/Admin/Dashboard'))
const ManageProducts = lazy(()=> import('../pages/Admin/ManageProducts'))
const ManageOrders = lazy(()=> import('../pages/Admin/ManageOrders'))

// ─────────────────────────────────────────────────────
// LOADING FALLBACK
// Shown while a lazy page is loading
// ─────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* All pages share Navbar + Footer via MainLayout */}
        <Route element={<MainLayout />}>

          {/* ── Public Routes ─────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Protected Routes ──────────────────── */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />

          {/* ── Admin Routes ──────────────────────── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <ManageProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <ManageOrders />
              </AdminRoute>
            }
          />

          {/* ── 404 ────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
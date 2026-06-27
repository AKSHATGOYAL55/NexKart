import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  ChevronRight,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { getMyOrders } from '../api/order.api'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import Spinner from '../components/common/Spinner'

// ─────────────────────────────────────────────────────
// ORDER STATUS CONFIG
// Centralized config for status colors and icons
// Change once here — updates everywhere
// ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-700',
    icon: RefreshCw,
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-700',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-700',
    icon: RefreshCw,
  },
}

// ─────────────────────────────────────────────────────
// STATUS BADGE — reusable
// ─────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = config.icon

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        text-xs font-medium ${config.color}
      `}
    >
      <Icon size={12} />
      {config.label}
    </span>
  )
}

const OrderHistory = () => {
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['myOrders', page],
    queryFn: () =>
      getMyOrders({ page, limit: 10 }).then((res) => res.data),
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  })

  const orders = data?.orders || []
  const totalPages = data?.pages || 1

  // ── Loading ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading orders..." />
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Failed to load orders</p>
      </div>
    )
  }

  // ── Empty ──────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          No orders yet
        </h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven't placed any orders yet.
        </p>
        <Link
          to="/products"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {data?.total} order{data?.total !== 1 ? 's' : ''} placed
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────
// ORDER CARD COMPONENT
// ─────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  // Show first 3 items, then "+X more"
  const previewItems = order.items.slice(0, 3)
  const remainingCount = order.items.length - previewItems.length

  return (
    <Link
      to={`/orders/${order._id}`}
      className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
    >
      {/* Order Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-mono">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>

      {/* Items Preview */}
      <div className="flex items-center gap-3 mb-4">
        {previewItems.map((item, idx) => (
          <div
            key={idx}
            className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100"
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={20} />
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-medium text-gray-500">
            +{remainingCount}
          </div>
        )}
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-base font-bold text-gray-900">
            {formatCurrency(order.totalPrice)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
        <span>
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </span>
        <span className="text-blue-600 font-medium">
          View Details →
        </span>
      </div>
    </Link>
  )
}

export default OrderHistory
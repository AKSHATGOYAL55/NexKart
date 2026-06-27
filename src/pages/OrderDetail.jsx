import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowLeft,
  XCircle,
  Phone,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getOrderById, cancelOrder } from '../api/order.api'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDateTime } from '../utils/formatDate'
import { StatusBadge } from './OrderHistory'
import Spinner from '../components/common/Spinner'
import Button from '../components/common/Button'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // ── Fetch Order ────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id).then((res) => res.data),
    staleTime: 1000 * 60,
  })

  const order = data?.order

  // ── Cancel Order ───────────────────────────────────
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }

    setIsCancelling(true)

    try {
      await cancelOrder(id, cancelReason)

      toast.success('Order cancelled successfully')
      setShowCancelModal(false)

      // Refetch order to show updated status
      queryClient.invalidateQueries(['order', id])
      queryClient.invalidateQueries(['myOrders'])

    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to cancel order'
      )
    } finally {
      setIsCancelling(false)
    }
  }

  // ── Loading ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading order details..." />
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <XCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Order not found
        </h2>
        <Button onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </div>
    )
  }

  // ── Can user cancel? ───────────────────────────────
  const canCancel = ['pending', 'processing'].includes(order.status)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back Button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back to Orders</span>
      </button>

      {/* ── Order Header ─────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={18} className="text-gray-400" />
              <h1 className="font-semibold text-gray-900">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Order Timeline */}
        <OrderTimeline order={order} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left Column ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Order Items */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">
                Delivery Address
              </h2>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} —{' '}
                {order.shippingAddress.pincode}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Phone size={13} className="text-gray-400" />
                <span>{order.shippingAddress.phone}</span>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">
                  Tracking
                </h2>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Carrier:</span>{' '}
                  {order.carrier}
                </p>
                <p>
                  <span className="font-medium">Tracking Number:</span>{' '}
                  <span className="font-mono text-blue-600">
                    {order.trackingNumber}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Cancel Order */}
          {canCancel && (
            <div className="bg-white border border-red-100 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-2">
                Cancel Order
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                You can cancel this order while it's pending or processing.
              </p>
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
              >
                <XCircle size={16} />
                Cancel This Order
              </Button>
            </div>
          )}

          {/* Cancellation Info */}
          {order.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={18} className="text-red-500" />
                <h2 className="font-semibold text-red-700">
                  Order Cancelled
                </h2>
              </div>
              <p className="text-sm text-red-600">
                Reason: {order.cancelReason}
              </p>
              {order.cancelledAt && (
                <p className="text-xs text-red-400 mt-1">
                  On {formatDateTime(order.cancelledAt)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right Column ─────────────────────────────── */}
        <div className="space-y-4">

          {/* Price Breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Price Breakdown
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items</span>
                <span>{formatCurrency(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(order.taxPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shippingPrice === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatCurrency(order.shippingPrice)
                  )}
                </span>
              </div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- {formatCurrency(order.discountPrice)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : order.paymentMethod.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${
                    order.isPaid ? 'text-green-600' : 'text-orange-500'
                  }`}
                >
                  {order.isPaid ? '✓ Paid' : 'Pending'}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid on</span>
                  <span className="text-gray-700 text-xs">
                    {formatDateTime(order.paidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delivered Badge */}
          {order.isDelivered && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
              <CheckCircle
                size={32}
                className="mx-auto text-green-500 mb-2"
              />
              <p className="font-semibold text-green-700 text-sm">
                Delivered Successfully
              </p>
              <p className="text-xs text-green-600 mt-1">
                {formatDateTime(order.deliveredAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Cancel Modal ──────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCancelModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cancel Order
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please tell us why you want to cancel this order.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind, Found better price elsewhere..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Keep Order
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelOrder}
                isLoading={isCancelling}
                className="flex-1"
              >
                Cancel Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────
// ORDER TIMELINE COMPONENT
// Shows visual progress of the order
// ─────────────────────────────────────────────────────
const OrderTimeline = ({ order }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: RefreshCw },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ]

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = statusOrder.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  // Import icons needed for timeline
  // const { RefreshCw } = require('lucide-react')

  return (
    <div className="mt-6 pt-6 border-t border-gray-50">
      {isCancelled ? (
        <div className="flex items-center gap-2 text-red-500">
          <XCircle size={18} />
          <span className="text-sm font-medium">
            This order was cancelled
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isCompleted = currentIndex >= idx
            const isCurrent = currentIndex === idx

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      transition-all
                      ${isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                      }
                      ${isCurrent ? 'ring-4 ring-green-100' : ''}
                    `}
                  >
                    <Icon size={15} />
                  </div>
                  <span
                    className={`
                      text-[10px] mt-1.5 font-medium text-center
                      ${isCompleted ? 'text-green-600' : 'text-gray-400'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mb-5 mx-1
                      ${currentIndex > idx ? 'bg-green-400' : 'bg-gray-100'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrderDetail
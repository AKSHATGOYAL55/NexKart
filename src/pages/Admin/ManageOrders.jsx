import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  ChevronRight,
  Package,
  Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllOrders, updateOrderStatus } from '../../api/order.api'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { StatusBadge } from '../OrderHistory'
import Spinner from '../../components/common/Spinner'

// ─────────────────────────────────────────────────────
// STATUS OPTIONS FOR DROPDOWN
// ─────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

const UPDATABLE_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

const ManageOrders = () => {
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [updatingOrder, setUpdatingOrder] = useState(null)

  // ── Fetch all orders ───────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', statusFilter, page],
    queryFn: () =>
      getAllOrders({
        status: statusFilter || undefined,
        page,
        limit: 15,
      }).then((res) => res.data),
    staleTime: 0,
  })

  const orders = data?.orders || []
  const totalPages = data?.pages || 1

  // ── Update order status ────────────────────────────
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId)
    try {
      await updateOrderStatus(orderId, { status: newStatus })
      toast.success(`Order status updated to ${newStatus}`)

      queryClient.invalidateQueries(['adminOrders'])
      queryClient.invalidateQueries(['order', orderId])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update status'
      )
    } finally {
      setUpdatingOrder(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Orders
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {data?.total || 0} total orders
        </p>
      </div>

      {/* ── Filters ───────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <Filter size={16} className="text-gray-400" />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setStatusFilter(option.value)
                setPage(1)
              }}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${statusFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders Table ──────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    'Order ID',
                    'Customer',
                    'Date',
                    'Items',
                    'Total',
                    'Status',
                    'Update Status',
                    '',
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.user?.email}
                        </p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4 text-gray-600">
                      {order.items.length} item
                      {order.items.length !== 1 ? 's' : ''}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {formatCurrency(order.totalPrice)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        disabled={
                          updatingOrder === order._id ||
                          ['delivered', 'cancelled', 'refunded'].includes(
                            order.status
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                      >
                        {UPDATABLE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* View link */}
                    <td className="px-6 py-4">
                      <Link
                        to={`/orders/${order._id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ManageOrders
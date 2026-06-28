import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Users,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react'
import { getOrderStats } from '../../api/order.api'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import Spinner from '../../components/common/Spinner'
import { StatusBadge } from '../OrderHistory'

// ─────────────────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => getOrderStats().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  })

  const stats = data?.stats

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Failed to load dashboard data</p>
      </div>
    )
  }

  // ── Get count by status ────────────────────────────
  const getStatusCount = (status) => {
    return (
      stats?.ordersByStatus?.find((s) => s._id === status)?.count || 0
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          NexKart overview and statistics
        </p>
      </div>

      {/* ── Stat Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle="Excluding cancelled orders"
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle="All time"
          icon={ShoppingBag}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(stats?.averageOrderValue || 0)}
          subtitle="Per order"
          icon={Package}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Orders"
          value={getStatusCount('pending')}
          subtitle="Needs attention"
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      {/* ── Orders by Status ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Orders by Status
          </h2>
          <div className="space-y-3">
            {[
              { status: 'pending', icon: Clock, color: 'text-yellow-500' },
              { status: 'processing', icon: Package, color: 'text-blue-500' },
              { status: 'shipped', icon: Truck, color: 'text-purple-500' },
              { status: 'delivered', icon: CheckCircle, color: 'text-green-500' },
              { status: 'cancelled', icon: XCircle, color: 'text-red-500' },
            ].map(({ status, icon: Icon, color }) => {
              const count = getStatusCount(status)
              const total = stats?.totalOrders || 1
              const percentage = Math.round((count / total) * 100)

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={color} />
                      <span className="text-sm text-gray-600 capitalize">
                        {status}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        status === 'pending' ? 'bg-yellow-400' :
                        status === 'processing' ? 'bg-blue-400' :
                        status === 'shipped' ? 'bg-purple-400' :
                        status === 'delivered' ? 'bg-green-400' :
                        'bg-red-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Monthly Revenue ──────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Monthly Revenue (Last 6 months)
          </h2>
          {stats?.monthlyRevenue?.length > 0 ? (
            <div className="space-y-3">
              {stats.monthlyRevenue.map((month) => {
                const maxRevenue = Math.max(
                  ...stats.monthlyRevenue.map((m) => m.revenue)
                )
                const percentage =
                  maxRevenue > 0
                    ? Math.round((month.revenue / maxRevenue) * 100)
                    : 0
                const monthName = new Date(
                  month._id.year,
                  month._id.month - 1
                ).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: '2-digit',
                })

                return (
                  <div key={`${month._id.year}-${month._id.month}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {monthName}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(month.revenue)}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          ({month.orders} orders)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              No revenue data yet
            </p>
          )}
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Manage Products',
            description: 'Add, edit or delete products',
            link: '/admin/products',
            color: 'bg-blue-50 hover:bg-blue-100',
            iconColor: 'text-blue-600',
            icon: Package,
          },
          {
            title: 'Manage Orders',
            description: 'View and update order status',
            link: '/admin/orders',
            color: 'bg-purple-50 hover:bg-purple-100',
            iconColor: 'text-purple-600',
            icon: ShoppingBag,
          },
          {
            title: 'View Store',
            description: 'See how your store looks',
            link: '/products',
            color: 'bg-green-50 hover:bg-green-100',
            iconColor: 'text-green-600',
            icon: TrendingUp,
          },
        ].map(({ title, description, link, color, iconColor, icon: Icon }) => (
          <Link
            key={link}
            to={link}
            className={`
              flex items-center justify-between p-5 rounded-2xl
              border border-transparent transition-colors ${color}
            `}
          >
            <div className="flex items-center gap-4">
              <Icon size={22} className={iconColor} />
              <div>
                <p className="font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {description}
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
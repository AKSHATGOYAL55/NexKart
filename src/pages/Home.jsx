import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  Star,
  Zap,
} from 'lucide-react'
import { getFeaturedProducts } from '../api/product.api'
import { formatCurrency } from '../utils/formatCurrency'
import ProductCard from '../components/product/ProductCard'
import Spinner from '../components/common/Spinner'

// ─────────────────────────────────────────────────────
// CATEGORIES DATA
// ─────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Electronics', emoji: '📱', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100' },
  { name: 'Clothing', emoji: '👕', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100' },
  { name: 'Books', emoji: '📚', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100' },
  { name: 'Home & Kitchen', emoji: '🏠', color: 'bg-green-50 hover:bg-green-100 border-green-100' },
  { name: 'Sports', emoji: '⚽', color: 'bg-orange-50 hover:bg-orange-100 border-orange-100' },
  { name: 'Beauty', emoji: '💄', color: 'bg-pink-50 hover:bg-pink-100 border-pink-100' },
  { name: 'Shoes', emoji: '👟', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100' },
  { name: 'Toys', emoji: '🧸', color: 'bg-red-50 hover:bg-red-100 border-red-100' },
]

// ─────────────────────────────────────────────────────
// TRUST BADGES DATA
// ─────────────────────────────────────────────────────
const TRUST_BADGES = [
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'On orders above ₹500',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    desc: '100% secure transactions',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    desc: '7-day hassle-free returns',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Star,
    title: 'Top Rated',
    desc: 'Trusted by 10,000+ customers',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
]

const Home = () => {
  const navigate = useNavigate()

  // ── Fetch featured products ────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => getFeaturedProducts().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  })

  const featuredProducts = data?.products || []

  return (
    <div className="min-h-screen">

      {/* ── HERO SECTION ─────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Zap size={14} className="text-yellow-300" />
              New arrivals every week
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Shop Smarter,
              <br />
              <span className="text-yellow-300">Live Better</span>
            </h1>

            <p className="text-blue-100 text-lg sm:text-xl mb-8 leading-relaxed max-w-lg">
              Discover thousands of products at unbeatable prices.
              From electronics to fashion — everything you need,
              delivered to your door.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                <ShoppingBag size={18} />
                Shop Now
              </button>
              <button
                onClick={() =>
                  navigate('/products?category=Electronics')
                }
                className="flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors"
              >
                Electronics
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
              {[
                { value: '10K+', label: 'Happy Customers' },
                { value: '500+', label: 'Products' },
                { value: '4.8★', label: 'Average Rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">
                    {value}
                  </p>
                  <p className="text-blue-200 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TRUST_BADGES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3"
            >
              <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Find exactly what you're looking for
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:underline text-sm font-medium"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(({ name, emoji, color }) => (
            <button
              key={name}
              onClick={() =>
                navigate(`/products?category=${encodeURIComponent(name)}`)
              }
              className={`
                flex flex-col items-center gap-2.5 p-4 rounded-2xl
                border transition-all duration-200 hover:scale-105
                hover:shadow-md ${color}
              `}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                {name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Handpicked deals just for you
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-blue-600 hover:underline text-sm font-medium"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" text="Loading products..." />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <ShoppingBag
              size={48}
              className="mx-auto text-gray-300 mb-4"
            />
            <p className="text-gray-500 mb-2">
              No featured products yet
            </p>
            <p className="text-gray-400 text-sm">
              Admin can mark products as featured from the dashboard
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} eager={index < 4} />
            ))}
          </div>
        )}
      </section>

      {/* ── PROMOTIONAL BANNER ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Banner 1 */}
          <div
            onClick={() =>
              navigate('/products?category=Electronics')
            }
            className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 cursor-pointer overflow-hidden group"
          >
            <div className="absolute -right-8 -bottom-8 text-[100px] opacity-20 group-hover:opacity-30 transition-opacity select-none">
              📱
            </div>
            <div className="relative z-10">
              <span className="text-blue-200 text-sm font-medium">
                Up to 10% off
              </span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                Latest Electronics
              </h3>
              <button className="flex items-center gap-2 bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                Shop Now
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Banner 2 */}
          <div
            onClick={() =>
              navigate('/products?category=Clothing')
            }
            className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 cursor-pointer overflow-hidden group"
          >
            <div className="absolute -right-8 -bottom-8 text-[100px] opacity-20 group-hover:opacity-30 transition-opacity select-none">
              👗
            </div>
            <div className="relative z-10">
              <span className="text-purple-200 text-sm font-medium">
                New Collection
              </span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                Trending Fashion
              </h3>
              <button className="flex items-center gap-2 bg-white text-purple-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                Explore
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY NEXKART ──────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Why NexKart?
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              We're committed to making your shopping experience the best
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                emoji: '🎯',
                title: 'Curated Selection',
                desc: 'Every product is handpicked for quality. We only list products that meet our strict quality standards.',
              },
              {
                emoji: '⚡',
                title: 'Fast Delivery',
                desc: 'Order before 2 PM and get same-day delivery in select cities. Free shipping on orders over ₹500.',
              },
              {
                emoji: '💬',
                title: '24/7 Support',
                desc: 'Our customer support team is available round the clock to help you with any questions or concerns.',
              },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 sm:p-14 text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Stay in the loop
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Subscribe to our newsletter and be the first to know about
            new arrivals, exclusive deals, and special offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() =>
                toast.success('Subscribed! 🎉 Check your inbox soon.')
              }
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-4">
            No spam ever. Unsubscribe anytime.
          </p>
        </div>
      </section>

    </div>
  )
}

export default Home
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Star, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { addItemToCart } from '../../features/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import Image from '../common/Image'

const ProductCard = ({ product, eager = false }) => {
  const dispatch = useDispatch()

  // ── Only check if THIS specific product is loading ──
  // NOT the global cart loading state
  const isThisProductLoading = useSelector((state) =>
    state.cart.loadingProductIds.includes(product._id)
  )

  const { isAuthenticated } = useSelector((state) => state.auth)

  // Local state for "Added!" feedback
  const [justAdded, setJustAdded] = useState(false)

  const hasDiscount = product.discountPrice > 0
  const displayPrice = hasDiscount ? product.discountPrice : product.price
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0
  const isOutOfStock = product.stock === 0
  const productImage = product.images?.[0]?.url

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }

    if (isOutOfStock) return

    const result = await dispatch(
      addItemToCart({ productId: product._id, quantity: 1 })
    )

    if (addItemToCart.fulfilled.match(result)) {
      // Show "Added!" feedback briefly
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1500)
      toast.success('Added to cart!')
    } else {
      toast.error(result.payload?.message || 'Failed to add to cart')
    }
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* ── Product Image ────────────────────────── */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={productImage}
          alt={product.name}
          wrapperClassName="w-full h-full"
          className="group-hover:scale-105 transition-transform duration-300"
          eager={eager}
        />

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            -{discountPercentage}%
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Product Info ─────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
          {product.brand}
        </p>

        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 flex-1">
          {product.name}
        </h3>

        {product.ratings?.count > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-700">
              {product.ratings.average.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({product.ratings.count})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* ── Add to Cart Button ─────────────────── */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isThisProductLoading}
          className={`
            w-full flex items-center justify-center gap-2
            text-sm font-medium py-2.5 rounded-lg
            transition-all duration-200
            ${isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : justAdded
              ? 'bg-green-500 text-white'
              : isThisProductLoading
              ? 'bg-blue-400 text-white cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {/* Show different states cleanly */}
          {isThisProductLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Adding...
            </>
          ) : justAdded ? (
            <>
              <Check size={15} />
              Added!
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart size={15} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
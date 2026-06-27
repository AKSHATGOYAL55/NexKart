import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchCart,
  updateItem,
  removeItem,
  applyCartCoupon,
  removeCartCoupon,
} from '../features/cartSlice'
import { formatCurrency } from '../utils/formatCurrency'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import { useState } from 'react'

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { items, itemsTotal, discount, total, coupon, isLoading } =
    useSelector((state) => state.cart)

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // ── Fetch cart on mount ────────────────────────────
  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  // ── Handlers ───────────────────────────────────────
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    const result = await dispatch(
      updateItem({ itemId, quantity: newQuantity })
    )

    if (!updateItem.fulfilled.match(result)) {
      toast.error(result.payload || 'Failed to update quantity')
    }
  }

  const handleRemoveItem = async (itemId, itemName) => {
    const result = await dispatch(removeItem(itemId))

    if (removeItem.fulfilled.match(result)) {
      toast.success(`${itemName} removed from cart`)
    } else {
      toast.error('Failed to remove item')
    }
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    setCouponLoading(true)
    const result = await dispatch(applyCartCoupon(couponCode.trim()))
    setCouponLoading(false)

    if (applyCartCoupon.fulfilled.match(result)) {
      toast.success('Coupon applied successfully!')
      setCouponCode('')
    } else {
      toast.error(result.payload || 'Invalid coupon code')
    }
  }

  const handleRemoveCoupon = async () => {
    const result = await dispatch(removeCartCoupon())
    if (removeCartCoupon.fulfilled.match(result)) {
      toast.success('Coupon removed')
    }
  }

  // ── Shipping calculation ───────────────────────────
  const shippingPrice = itemsTotal > 500 ? 0 : 50
  const taxPrice = Math.round(itemsTotal * 0.18)

  // ── Empty Cart ─────────────────────────────────────
  if (!isLoading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag
          size={80}
          className="mx-auto text-gray-200 mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Button onClick={() => navigate('/products')} className="mx-auto">
          Start Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Shopping Cart
        <span className="text-base font-normal text-gray-500 ml-3">
          ({items.length} {items.length === 1 ? 'item' : 'items'})
        </span>
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" text="Loading cart..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Items — Left Side ──────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                isLoading={isLoading}
              />
            ))}

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm mt-4"
            >
              <ShoppingCart size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* ── Order Summary — Right Side ──────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">

              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Items ({items.length})
                  </span>
                  <span>{formatCurrency(itemsTotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>{formatCurrency(taxPrice)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shippingPrice === 0 ? (
                      <span className="text-green-600 font-medium">
                        FREE
                      </span>
                    ) : (
                      formatCurrency(shippingPrice)
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>- {formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      itemsTotal + taxPrice + shippingPrice - discount
                    )}
                  </span>
                </div>
              </div>

              {/* Free shipping notice */}
              {itemsTotal < 500 && (
                <div className="bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-2.5 mb-5">
                  Add{' '}
                  <span className="font-semibold">
                    {formatCurrency(500 - itemsTotal)}
                  </span>{' '}
                  more for FREE shipping!
                </div>
              )}

              {/* Coupon Section */}
              {coupon?.code ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 mb-5">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {coupon.code}
                    </span>
                    <span className="text-xs text-green-600">
                      (
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discount}% off`
                        : `${formatCurrency(coupon.discount)} off`}
                      )
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mb-5">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Have a coupon?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter code"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Try: SAVE10, SAVE100, WELCOME20
                  </p>
                </form>
              )}

              {/* Checkout Button */}
              <Button
                onClick={() => navigate('/checkout')}
                className="w-full py-3 text-base"
                disabled={items.length === 0}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────
// CART ITEM COMPONENT
// Individual cart item with image, name, quantity, price
// ─────────────────────────────────────────────────────

const CartItem = ({ item, onQuantityChange, onRemove, isLoading }) => {
  const product = item.product
  const productImage = product?.images?.[0]?.url || ''
  const productName = item.name
  const productSlug = product?.slug || ''

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">

      {/* Product Image */}
      <Link
        to={`/products/${productSlug}`}
        className="flex-shrink-0"
      >
        <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingBag size={24} />
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/products/${productSlug}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {productName}
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">
              Unit Price: {formatCurrency(item.price)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item._id, productName)}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
          >
            <Trash2 size={17} />
          </button>
        </div>

        {/* Bottom row: quantity + subtotal */}
        <div className="flex items-center justify-between mt-3">

          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() =>
                onQuantityChange(item._id, item.quantity - 1)
              }
              disabled={item.quantity <= 1 || isLoading}
              className="p-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="px-4 py-2 text-sm font-medium border-x border-gray-200 min-w-[40px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                onQuantityChange(item._id, item.quantity + 1)
              }
              disabled={
                isLoading ||
                (product?.stock && item.quantity >= product.stock)
              }
              className="p-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Subtotal */}
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>

        {/* Low stock warning */}
        {product?.stock <= 5 && product?.stock > 0 && (
          <p className="text-orange-500 text-xs mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
      </div>
    </div>
  )
}

export default Cart
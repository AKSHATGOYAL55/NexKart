// import { Link } from 'react-router-dom'
// import { useDispatch, useSelector } from 'react-redux'
// import { ShoppingCart, Star } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { addItemToCart } from '../../features/cartSlice'
// import { formatCurrency } from '../../utils/formatCurrency'

// const ProductCard = ({ product }) => {
//   const dispatch = useDispatch()
//   const { isLoading } = useSelector((state) => state.cart)
//   const { isAuthenticated } = useSelector((state) => state.auth)

//   // ── Derived values ─────────────────────────────────
//   const hasDiscount = product.discountPrice > 0
//   const displayPrice = hasDiscount ? product.discountPrice : product.price
//   const discountPercentage = hasDiscount
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : 0
//   const isOutOfStock = product.stock === 0
//   const productImage = product.images?.[0]?.url

//   // ── Add to cart handler ────────────────────────────
//   const handleAddToCart = async (e) => {
//     // Prevent Link navigation when clicking the button
//     e.preventDefault()
//     e.stopPropagation()

//     if (!isAuthenticated) {
//       toast.error('Please login to add items to cart')
//       return
//     }

//     if (isOutOfStock) {
//       toast.error('This product is out of stock')
//       return
//     }

//     const result = await dispatch(
//       addItemToCart({ productId: product._id, quantity: 1 })
//     )

//     if (addItemToCart.fulfilled.match(result)) {
//       toast.success('Added to cart!')
//     } else {
//       toast.error(result.payload || 'Failed to add to cart')
//     }
//   }

//   return (
//     <Link
//       to={`/products/${product.slug}`}
//       className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
//     >
//       {/* ── Product Image ──────────────────────────── */}
//       <div className="relative overflow-hidden bg-gray-50 aspect-square">
//         {productImage ? (
//           <img
//             src={productImage}
//             alt={product.name}
//             loading="lazy"
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-gray-300">
//             <ShoppingCart size={40} />
//           </div>
//         )}

//         {/* Discount Badge */}
//         {hasDiscount && (
//           <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
//             -{discountPercentage}%
//           </span>
//         )}

//         {/* Out of stock overlay */}
//         {isOutOfStock && (
//           <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
//             <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-full">
//               Out of Stock
//             </span>
//           </div>
//         )}
//       </div>

//       {/* ── Product Info ───────────────────────────── */}
//       <div className="p-4 flex flex-col flex-1">
//         {/* Brand */}
//         <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
//           {product.brand}
//         </p>

//         {/* Name */}
//         <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 flex-1">
//           {product.name}
//         </h3>

//         {/* Rating */}
//         {product.ratings?.count > 0 && (
//           <div className="flex items-center gap-1.5 mb-2">
//             <div className="flex items-center gap-0.5">
//               <Star size={12} className="fill-yellow-400 text-yellow-400" />
//               <span className="text-xs font-medium text-gray-700">
//                 {product.ratings.average.toFixed(1)}
//               </span>
//             </div>
//             <span className="text-xs text-gray-400">
//               ({product.ratings.count})
//             </span>
//           </div>
//         )}

//         {/* Price */}
//         <div className="flex items-center gap-2 mb-3">
//           <span className="text-base font-bold text-gray-900">
//             {formatCurrency(displayPrice)}
//           </span>
//           {hasDiscount && (
//             <span className="text-sm text-gray-400 line-through">
//               {formatCurrency(product.price)}
//             </span>
//           )}
//         </div>

//         {/* Add to Cart Button */}
//         <button
//           onClick={handleAddToCart}
//           disabled={isOutOfStock || isLoading}
//           className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
//         >
//           <ShoppingCart size={15} />
//           {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
//         </button>
//       </div>
//     </Link>
//   )
// }

// export default ProductCard



import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { addItemToCart } from '../../features/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import Image from '../common/Image'

const ProductCard = ({ product, eager = false }) => {
  const dispatch = useDispatch()
  const { isLoading } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.auth)

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

    if (isOutOfStock) {
      toast.error('This product is out of stock')
      return
    }

    const result = await dispatch(
      addItemToCart({ productId: product._id, quantity: 1 })
    )

    if (addItemToCart.fulfilled.match(result)) {
      toast.success('Added to cart!')
    } else {
      toast.error(result.payload || 'Failed to add to cart')
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
          // eager=true for first 4 cards (above fold)
          // eager=false for rest (lazy load on scroll)
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            -{discountPercentage}%
          </span>
        )}

        {/* Out of stock overlay */}
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

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          <ShoppingCart size={15} />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
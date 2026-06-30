// import ProductCard from './ProductCard'
// import Spinner from '../common/Spinner'

// // ─────────────────────────────────────────────────────
// // PRODUCT GRID
// // Handles 3 states: loading, empty, filled
// // ─────────────────────────────────────────────────────

// const ProductGrid = ({ products, isLoading, error }) => {

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <Spinner size="lg" text="Loading products..." />
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="text-center">
//           <p className="text-gray-500 text-lg mb-2">Something went wrong</p>
//           <p className="text-gray-400 text-sm">{error}</p>
//         </div>
//       </div>
//     )
//   }

//   if (!products || products.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20">
//         <div className="text-6xl mb-4">🔍</div>
//         <p className="text-gray-700 text-lg font-medium mb-2">
//           No products found
//         </p>
//         <p className="text-gray-400 text-sm">
//           Try adjusting your filters or search term
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//       {products.map((product) => (
//         <ProductCard key={product._id} product={product} />
//       ))}
//     </div>
//   )
// }

// export default ProductGrid



import ProductCard from './ProductCard'
import Spinner from '../common/Spinner'

const ProductGrid = ({ products, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">
            Something went wrong
          </p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-700 text-lg font-medium mb-2">
          No products found
        </p>
        <p className="text-gray-400 text-sm">
          Try adjusting your filters or search term
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product._id}
          product={product}
          eager={index < 4}
          // First 4 products load immediately (above the fold)
          // Rest use IntersectionObserver (lazy load on scroll)
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────
// SKELETON CARD
// Shows while products are loading
// Same dimensions as real card — prevents layout shift
// ─────────────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    {/* Image skeleton */}
    <div className="aspect-square bg-gray-100 animate-pulse" />

    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
      <div className="space-y-1.5">
        <div className="h-3.5 bg-gray-100 rounded animate-pulse" />
        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
      </div>
      <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2" />
      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  </div>
)

export default ProductGrid
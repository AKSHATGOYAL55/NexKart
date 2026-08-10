import ProductCard from './ProductCard'

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="space-y-1.5">
        <div className="h-3.5 bg-gray-200 rounded" />
        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-1/2" />
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  </div>
)

const ProductGrid = ({
  products,
  isLoading,
  isFetching = false,
  error,
}) => {
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
    return null
    // Error UI is handled in Products.jsx with retry button
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
    <div>
      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-blue-600 mb-3 h-6">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span>Updating...</span>
        </div>
      )}
      <div
        className={`
          grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
          transition-opacity duration-200
          ${isFetching ? 'opacity-70' : 'opacity-100'}
        `}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            eager={index < 4}
          />
        ))}
      </div>
    </div>
  )
}

export default ProductGrid
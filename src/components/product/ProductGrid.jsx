import ProductCard from './ProductCard'
import Spinner from '../common/Spinner'

// ─────────────────────────────────────────────────────
// PRODUCT GRID
// Handles 3 states: loading, empty, filled
// ─────────────────────────────────────────────────────

const ProductGrid = ({ products, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" text="Loading products..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">Something went wrong</p>
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
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
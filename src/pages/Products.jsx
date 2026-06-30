import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { getProducts } from '../api/product.api'
import ProductGrid from '../components/product/ProductGrid'
import useSearchQuery from '../hooks/useSearchQuery'

const CATEGORIES = [
  'Electronics', 'Clothing', 'Shoes', 'Books',
  'Home & Kitchen', 'Sports', 'Beauty', 'Toys',
  'Grocery', 'Other',
]

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratings.average' },
]

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Read ALL filters from URL ──────────────────────
  // URL is the single source of truth
  // No separate useState for keyword — comes from URL only
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || '-createdAt'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const page = Number(searchParams.get('page') || 1)

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // ── Shared search hook ─────────────────────────────
  // inputValue = what shows in the search input (for typing)
  // urlKeyword = what's in URL (used for API call)
  // Both stay in sync through the hook
  const { inputValue, urlKeyword, handleChange, handleSubmit, handleClear } =
    useSearchQuery(400)

  // ── Update URL helper ──────────────────────────────
  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // reset to page 1 when filter changes
    setSearchParams(params)
  }

  // ── React Query — uses urlKeyword NOT inputValue ───
  // urlKeyword only updates after debounce fires
  // so API is NOT called on every keystroke
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'products',
      urlKeyword,   // ← from URL, not from input state
      category,
      sort,
      minPrice,
      maxPrice,
      page,
    ],
    queryFn: () =>
      getProducts({
        keyword: urlKeyword,
        category,
        sort,
        minPrice,
        maxPrice,
        page,
        limit: 12,
      }).then((res) => res.data),
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  })

  const products = data?.products || []
  const totalPages = data?.pages || 1
  const totalProducts = data?.total || 0

  // ── Clear all filters ──────────────────────────────
  const handleClearFilters = () => {
    handleClear() // clears search input + URL keyword
    setSearchParams({}) // clears all other params
  }

  const hasActiveFilters =
    urlKeyword || category || minPrice || maxPrice

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Page Header ────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {category ? category : 'All Products'}
        </h1>
        {totalProducts > 0 && (
          <p className="text-gray-500 text-sm mt-1">
            Showing {products.length} of {totalProducts} products
            {urlKeyword && (
              <span className="ml-1">
                for "<span className="font-medium">{urlKeyword}</span>"
              </span>
            )}
          </p>
        )}
      </div>

      {/* ── Top Bar: Search + Sort ──────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Search input — uses same hook as Navbar */}
        <form onSubmit={handleSubmit} className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Filter toggle — mobile */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white lg:hidden"
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">

        {/* ── Sidebar Filters ─────────────────────── */}
        <aside
          className={`
            ${isFilterOpen ? 'block' : 'hidden'}
            lg:block w-full lg:w-64 flex-shrink-0
          `}
        >
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Category
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={category === ''}
                    onChange={() => updateParam('category', '')}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-600">
                    All Categories
                  </span>
                </label>
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={category === cat}
                      onChange={() => updateParam('category', cat)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-600">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Price Range
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) =>
                    updateParam('minPrice', e.target.value)
                  }
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 self-center">—</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) =>
                    updateParam('maxPrice', e.target.value)
                  }
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Product Grid ─────────────────────────── */}
        <div className="flex-1">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            error={error?.message}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() =>
                  updateParam('page', Math.max(1, page - 1))
                }
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push('...')
                  }
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span
                      key={`dots-${idx}`}
                      className="px-2 text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => updateParam('page', p)}
                      className={`
                        w-10 h-10 rounded-lg text-sm font-medium transition-colors
                        ${page === p
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }
                      `}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() =>
                  updateParam('page', Math.min(totalPages, page + 1))
                }
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>

              {/* <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
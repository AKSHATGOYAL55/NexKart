import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { getProducts } from '../api/product.api'
import ProductGrid from '../components/product/ProductGrid'
import useDebounce from "../hooks/useDebounce"

// ─────────────────────────────────────────────────────
// CATEGORIES AND SORT OPTIONS
// ─────────────────────────────────────────────────────

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Shoes',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Grocery',
  'Other',
]

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratings.average' },
]

const Products = () => {
  // ── URL search params ──────────────────────────────
  // We store filters in the URL so users can share links
  // Example: /products?category=Electronics&keyword=phone
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Filter State ───────────────────────────────────
  const [keyword, setKeyword] = useState(
    searchParams.get('keyword') || ''
  )
  const [category, setCategory] = useState(
    searchParams.get('category') || ''
  )
  const [sort, setSort] = useState(
    searchParams.get('sort') || '-createdAt'
  )
  const [minPrice, setMinPrice] = useState(
    searchParams.get('minPrice') || ''
  )
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get('maxPrice') || ''
  )
  const [page, setPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // ── Debounce keyword ───────────────────────────────
  // Wait 500ms after user stops typing before calling API
  // Without this: API called on EVERY keystroke
  // With this: API called only when user pauses typing
  const debouncedKeyword = useDebounce(keyword, 500)

  // ── Sync URL with filters ──────────────────────────
  useEffect(() => {
    const params = {}
    if (debouncedKeyword) params.keyword = debouncedKeyword
    if (category) params.category = category
    if (sort !== '-createdAt') params.sort = sort
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    if (page > 1) params.page = page

    setSearchParams(params)
  }, [debouncedKeyword, category, sort, minPrice, maxPrice, page])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedKeyword, category, sort, minPrice, maxPrice])

  // ── Fetch Products with React Query ───────────────
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'products',
      debouncedKeyword,
      category,
      sort,
      minPrice,
      maxPrice,
      page,
    ],
    // queryKey array: React Query refetches automatically
    // whenever ANY value in this array changes
    // So changing category triggers a new API call automatically

    queryFn: () =>
      getProducts({
        keyword: debouncedKeyword,
        category,
        sort,
        minPrice,
        maxPrice,
        page,
        limit: 12,
      }).then((res) => res.data),

    staleTime: 1000 * 60 * 2, // 2 minutes cache for products list
    keepPreviousData: true,
    // keepPreviousData: while loading next page,
    // keep showing current page instead of blank screen
  })

  const products = data?.products || []
  const totalPages = data?.pages || 1
  const totalProducts = data?.total || 0

  // ── Handlers ──────────────────────────────────────
  const handleClearFilters = () => {
    setKeyword('')
    setCategory('')
    setSort('-createdAt')
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
    setSearchParams({})
  }

  const hasActiveFilters = keyword || category || minPrice || maxPrice

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Page Header ──────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {category ? category : 'All Products'}
        </h1>
        {totalProducts > 0 && (
          <p className="text-gray-500 text-sm mt-1">
            Showing {products.length} of {totalProducts} products
          </p>
        )}
      </div>

      {/* ── Top Bar: Search + Sort ────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
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

        {/* ── Sidebar Filters ───────────────────────── */}
        <aside
          className={`
            ${isFilterOpen ? 'block' : 'hidden'}
            lg:block w-full lg:w-64 flex-shrink-0
          `}
        >
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-24">

            {/* Filter Header */}
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

            {/* ── Category Filter ────────────────────── */}
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
                    onChange={() => setCategory('')}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-600">All Categories</span>
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
                      onChange={() => setCategory(cat)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-600">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Price Range Filter ─────────────────── */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Price Range
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 self-center">—</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
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

          {/* ── Pagination ─────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show: first, last, current, and 1 around current
                  return (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1
                  )
                })
                .reduce((acc, p, idx, arr) => {
                  // Add "..." between non-consecutive pages
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
                      onClick={() => setPage(p)}
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
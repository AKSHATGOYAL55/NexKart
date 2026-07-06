import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { getProducts } from '../api/product.api'
import ProductGrid from '../components/product/ProductGrid'
import useSearchQuery from '../hooks/useSearchQuery'

// ─────────────────────────────────────────────────────
// SORT OPTIONS
// ─────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratings.average' },
]

// ─────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────
const CATEGORIES = [
  'Electronics', 'Clothing', 'Shoes', 'Books',
  'Home & Kitchen', 'Sports', 'Beauty', 'Toys',
  'Grocery', 'Other',
]

// ─────────────────────────────────────────────────────
// FILTER CONTENT — shared between desktop + mobile
// ─────────────────────────────────────────────────────
const FilterContent = ({
  category,
  minPrice,
  maxPrice,
  hasActiveFilters,
  updateParam,
  handleClearFilters,
}) => (
  <>
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-semibold text-gray-900 hidden lg:block">
        Filters
      </h2>
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="text-xs text-blue-600 hover:underline ml-auto"
        >
          Clear all
        </button>
      )}
    </div>

    {/* Category */}
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
              onChange={() => updateParam('category', cat)}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-600">{cat}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Price Range */}
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Price Range (₹)
      </h3>
      <div className="flex gap-2">
        <input
          type="number"
          value={minPrice}
          onChange={(e) => updateParam('minPrice', e.target.value)}
          placeholder="Min"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-400 self-center flex-shrink-0">—</span>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => updateParam('maxPrice', e.target.value)}
          placeholder="Max"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </>
)

// ─────────────────────────────────────────────────────
// MAIN PRODUCTS PAGE
// ─────────────────────────────────────────────────────
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // ── Read ALL filters from URL ──────────────────────
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || '-createdAt'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const page = Number(searchParams.get('page') || 1)

  // ── Shared search hook ─────────────────────────────
  const {
    inputValue,
    urlKeyword,
    handleChange,
    handleSubmit,
    handleClear,
  } = useSearchQuery(400)

  // ── Update single URL param ────────────────────────
  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when any filter changes
    if (key !== 'page') {
      params.delete('page')
    }
    setSearchParams(params)
  }

  // ── Clear all filters ──────────────────────────────
  const handleClearFilters = () => {
    handleClear()
    setSearchParams({})
    setIsFilterOpen(false)
  }

  // ── Go to specific page ────────────────────────────
  const goToPage = (newPage) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage)
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // ── Active filters check ───────────────────────────
  const hasActiveFilters =
    urlKeyword || category || minPrice || maxPrice

  // ── Fetch products with React Query ───────────────
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: [
      'products',
      urlKeyword,
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
    // keepPreviousData: true,
     placeholderData: (prev) => prev,
  })

  const products = data?.products || []
  const totalPages = data?.pages || 1
  const totalProducts = data?.total || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* ── Page Header ──────────────────────────────── */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {category ? category : 'All Products'}
        </h1>
        {totalProducts > 0 && (
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            {totalProducts} products found
            {urlKeyword && (
              <span className="ml-1">
                for "
                <span className="font-medium text-gray-700">
                  {urlKeyword}
                </span>
                "
              </span>
            )}
          </p>
        )}
      </div>

      {/* ── Top Bar: Search + Sort + Filter toggle ────── */}
      <div className="flex gap-2 mb-5">

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="relative flex-1"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="appearance-none border border-gray-300 rounded-lg pl-3 pr-8 py-2.5 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Filter toggle — mobile and tablet only */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white lg:hidden flex-shrink-0"
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline text-sm">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* ── Content: Sidebar + Grid ───────────────────── */}
      <div className="flex gap-6">

        {/* ── Desktop Sidebar ───────────────────────── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-24">
            <FilterContent
              category={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              hasActiveFilters={hasActiveFilters}
              updateParam={updateParam}
              handleClearFilters={handleClearFilters}
            />
          </div>
        </aside>

        {/* ── Product Grid ──────────────────────────── */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            error={error?.message}
          />

          {/* ── Pagination ────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">

              {/* Previous */}
              <button
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>

              {/* Page numbers */}
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
                      className="px-2 text-gray-400 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`
                        w-10 h-10 rounded-lg text-sm font-medium
                        transition-colors
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

              {/* Next */}
              <button
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Bottom Sheet ────────────────── */}
      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Sheet slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">

            {/* Sheet header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 text-base">
                Filters
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sheet content — scrollable */}
            <div className="overflow-y-auto flex-1 p-5">
              <FilterContent
                category={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
                hasActiveFilters={hasActiveFilters}
                updateParam={updateParam}
                handleClearFilters={handleClearFilters}
              />
            </div>

            {/* Sheet footer — sticky */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0 pb-safe">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors"
              >
                Show {totalProducts} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  X,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/product.api'
import { formatCurrency } from '../../utils/formatCurrency'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'

// ─────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────
const CATEGORIES = [
  'Electronics', 'Clothing', 'Shoes', 'Books',
  'Home & Kitchen', 'Sports', 'Beauty', 'Toys',
  'Grocery', 'Other',
]

// ─────────────────────────────────────────────────────
// EMPTY FORM STATE
// ─────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  brand: '',
  stock: '',
  isFeatured: false,
  images: [{ url: '', publicId: 'temp' }],
}

const ManageProducts = () => {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // ── Fetch products ─────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', search, page],
    queryFn: () =>
      getProducts({ keyword: search, page, limit: 10 }).then(
        (res) => res.data
      ),
    staleTime: 0,
    // staleTime: 0 — always refetch for admin
    // Admin needs to see the latest data immediately
  })

  const products = data?.products || []
  const totalPages = data?.pages || 1

  // ── Open modal for create ──────────────────────────
  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  // ── Open modal for edit ────────────────────────────
  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      isFeatured: product.isFeatured || false,
      images: product.images?.length
        ? product.images
        : [{ url: '', publicId: 'temp' }],
    })
    setShowModal(true)
  }

  // ── Handle form input changes ──────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // ── Handle image URL change ────────────────────────
  const handleImageChange = (idx, value) => {
    setFormData((prev) => {
      const newImages = [...prev.images]
      newImages[idx] = { url: value, publicId: `temp-${idx}` }
      return { ...prev, images: newImages }
    })
  }

  // ── Submit form (create or update) ─────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.description ||
        !formData.price || !formData.category || !formData.brand) {
      toast.error('Please fill all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Filter out empty image URLs
      const cleanImages = formData.images.filter((img) => img.url.trim())

      const productData = {
        ...formData,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice) || 0,
        stock: Number(formData.stock) || 0,
        images: cleanImages,
      }

      if (editingProduct) {
        await updateProduct(editingProduct._id, productData)
        toast.success('Product updated successfully!')
      } else {
        await createProduct(productData)
        toast.success('Product created successfully!')
      }

      // Invalidate cache so list refreshes
      queryClient.invalidateQueries(['adminProducts'])
      queryClient.invalidateQueries(['products'])
      setShowModal(false)

    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete product ─────────────────────────────────
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId)
      toast.success('Product deleted successfully!')
      queryClient.invalidateQueries(['adminProducts'])
      queryClient.invalidateQueries(['products'])
      setDeleteConfirm(null)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete product'
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Products
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {data?.total || 0} products in store
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      {/* ── Search ────────────────────────────────────── */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ── Products Table ────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No products found</p>
          <Button onClick={handleOpenCreate} className="mt-4 mx-auto">
            Add First Product
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Stock
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Product info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {product.category}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(
                            product.discountPrice || product.price
                          )}
                        </p>
                        {product.discountPrice > 0 && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          product.stock === 0
                            ? 'text-red-500'
                            : product.stock <= 10
                            ? 'text-orange-500'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full w-fit font-medium ${
                            product.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {product.isFeatured && (
                          <span className="text-xs px-2 py-0.5 rounded-full w-fit font-medium bg-yellow-100 text-yellow-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl my-8 shadow-xl z-10">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <Input
                label="Product Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Apple iPhone 15 Pro"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Product description..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (₹) *"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="134900"
                />
                <Input
                  label="Discount Price (₹)"
                  name="discountPrice"
                  type="number"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="129900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Brand *"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Apple"
                />
              </div>

              <Input
                label="Stock Quantity *"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="50"
              />

              {/* Image URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Image URLs
                </label>
                {formData.images.map((image, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={image.url}
                      onChange={(e) =>
                        handleImageChange(idx, e.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {idx === formData.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            images: [
                              ...prev.images,
                              { url: '', publicId: 'temp' },
                            ],
                          }))
                        }
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Featured checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Feature this product on homepage
                </span>
              </label>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-900">
                Delete Product?
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              This product will be deactivated and hidden from
              the store. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageProducts
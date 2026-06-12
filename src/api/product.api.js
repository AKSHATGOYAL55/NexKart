import api from './axiosInstance'

// Get all products with filters
// params = { keyword, category, brand, minPrice, maxPrice, page, limit, sort }
export const getProducts = (params) => {
  return api.get('/api/products', { params })
  // axios converts params object to query string automatically
  // { category: 'Electronics', page: 2 } → ?category=Electronics&page=2
}

// Get single product by id or slug
export const getProduct = (idOrSlug) => {
  return api.get(`/api/products/${idOrSlug}`)
}

// Get featured products
export const getFeaturedProducts = () => {
  return api.get('/api/products/featured')
}

// Get products by category
export const getProductsByCategory = (category, params) => {
  return api.get(`/api/products/category/${category}`, { params })
}

// Create product (admin)
export const createProduct = (productData) => {
  return api.post('/api/products', productData)
}

// Update product (admin)
export const updateProduct = (id, productData) => {
  return api.put(`/api/products/${id}`, productData)
}

// Delete product (admin)
export const deleteProduct = (id) => {
  return api.delete(`/api/products/${id}`)
}
import api from './axiosInstance'

export const getProducts = (params) => {
  return api.get('/api/products', {
    params,
    timeout: 15000, // 15 second timeout
  })
}

export const getProduct = (idOrSlug) => {
  return api.get(`/api/products/${idOrSlug}`, {
    timeout: 15000,
  })
}

export const getFeaturedProducts = () => {
  return api.get('/api/products/featured', {
    timeout: 15000,
  })
}

export const getProductsByCategory = (category, params) => {
  return api.get(`/api/products/category/${category}`, {
    params,
    timeout: 15000,
  })
}

export const createProduct = (productData) => {
  return api.post('/api/products', productData)
}

export const updateProduct = (id, productData) => {
  return api.put(`/api/products/${id}`, productData)
}

export const deleteProduct = (id) => {
  return api.delete(`/api/products/${id}`)
}
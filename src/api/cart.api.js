import api from './axiosInstance'

// Get user's cart
export const getCart = () => {
  return api.get('/api/cart')
}

// Add product to cart
export const addToCart = (productId, quantity = 1) => {
  return api.post('/api/cart/add', { productId, quantity })
}

// Update cart item quantity
export const updateCartItem = (itemId, quantity) => {
  return api.put(`/api/cart/update/${itemId}`, { quantity })
}

// Remove item from cart
export const removeCartItem = (itemId) => {
  return api.delete(`/api/cart/remove/${itemId}`)
}

// Clear entire cart
export const clearCart = () => {
  return api.delete('/api/cart/clear')
}

// Apply coupon
export const applyCoupon = (code) => {
  return api.post('/api/cart/coupon', { code })
}

// Remove coupon
export const removeCoupon = () => {
  return api.delete('/api/cart/coupon')
}
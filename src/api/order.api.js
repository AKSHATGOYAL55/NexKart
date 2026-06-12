import api from './axiosInstance'

// Create order from cart
export const createOrder = (orderData) => {
  return api.post('/api/orders', orderData)
  // orderData = { shippingAddress, paymentMethod, orderNotes }
}

// Get my orders
export const getMyOrders = (params) => {
  return api.get('/api/orders/my-orders', { params })
}

// Get single order
export const getOrderById = (id) => {
  return api.get(`/api/orders/${id}`)
}

// Cancel order
export const cancelOrder = (id, cancelReason) => {
  return api.put(`/api/orders/${id}/cancel`, { cancelReason })
}

// Admin: get all orders
export const getAllOrders = (params) => {
  return api.get('/api/orders/admin/all', { params })
}

// Admin: update order status
export const updateOrderStatus = (id, data) => {
  return api.put(`/api/orders/${id}/status`, data)
}

// Admin: get stats
export const getOrderStats = () => {
  return api.get('/api/orders/admin/stats')
}
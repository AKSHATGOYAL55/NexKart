import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../api/cart.api'

// ── Async Thunks ─────────────────────────────────────

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCart()
      return response.data.cart
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await addToCart(productId, quantity)
      return response.data.cart
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const updateItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await updateCartItem(itemId, quantity)
      return response.data.cart
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await removeCartItem(itemId)
      return response.data.cart
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const clearAllItems = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clearCart()
      return response.data.cart
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const applyCartCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const response = await applyCoupon(code)
      return response.data.cart
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const removeCartCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await removeCoupon()
      return response.data.cart
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

// ── Cart Slice ───────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    itemsTotal: 0,
    discount: 0,
    total: 0,
    coupon: null,
    isLoading: false,
    error: null,
  },

  reducers: {
    clearCartError: (state) => {
      state.error = null
    },
    resetCart: (state) => {
      state.items = []
      state.itemsTotal = 0
      state.discount = 0
      state.total = 0
      state.coupon = null
    },
  },

  extraReducers: (builder) => {
    // Helper to update cart state — used for all cart operations
    const updateCartState = (state, action) => {
      const cart = action.payload
      state.items = cart.items || []
      state.itemsTotal = cart.itemsTotal || 0
      state.discount = cart.discount || 0
      state.total = cart.total || 0
      state.coupon = cart.coupon || null
      state.isLoading = false
      state.error = null
    }

    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true })
      .addCase(fetchCart.fulfilled, updateCartState)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Add Item
    builder
      .addCase(addItemToCart.pending, (state) => { state.isLoading = true })
      .addCase(addItemToCart.fulfilled, updateCartState)
      .addCase(addItemToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Update Item
    builder
      .addCase(updateItem.pending, (state) => { state.isLoading = true })
      .addCase(updateItem.fulfilled, updateCartState)
      .addCase(updateItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Remove Item
    builder
      .addCase(removeItem.pending, (state) => { state.isLoading = true })
      .addCase(removeItem.fulfilled, updateCartState)
      .addCase(removeItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Clear Cart
    builder
      .addCase(clearAllItems.fulfilled, updateCartState)

    // Apply Coupon
    builder
      .addCase(applyCartCoupon.pending, (state) => { state.isLoading = true })
      .addCase(applyCartCoupon.fulfilled, updateCartState)
      .addCase(applyCartCoupon.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Remove Coupon
    builder
      .addCase(removeCartCoupon.fulfilled, updateCartState)
  },
})

export const { clearCartError, resetCart } = cartSlice.actions
export default cartSlice.reducer
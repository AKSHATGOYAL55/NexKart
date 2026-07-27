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
      return { cart: response.data.cart, productId }
      // Return productId so we know which product finished loading
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message,
        productId,
      })
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
    isLoading: false,       // global loading (for cart page)
    loadingProductIds: [],  // ← NEW: tracks which products are loading
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
      state.loadingProductIds = []
    },
  },

  extraReducers: (builder) => {
    // Helper to update cart state
    const updateCartState = (state, action) => {
      const cart = action.payload?.cart || action.payload
      state.items = cart.items || []
      state.itemsTotal = cart.itemsTotal || 0
      state.discount = cart.discount || 0
      state.total = cart.total || 0
      state.coupon = cart.coupon || null
      state.isLoading = false
      state.error = null
    }

    // ── Fetch Cart ─────────────────────────────────────
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCart.fulfilled, updateCartState)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // ── Add Item ───────────────────────────────────────
    // KEY FIX: Track loading per product ID
    // NOT global isLoading
    builder
      .addCase(addItemToCart.pending, (state, action) => {
        const productId = action.meta.arg.productId
        // Add this product to loading list
        // Other products are NOT affected
        if (!state.loadingProductIds.includes(productId)) {
          state.loadingProductIds.push(productId)
        }
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        const { cart, productId } = action.payload
        // Remove this product from loading list
        state.loadingProductIds = state.loadingProductIds.filter(
          (id) => id !== productId
        )
        state.items = cart.items || []
        state.itemsTotal = cart.itemsTotal || 0
        state.discount = cart.discount || 0
        state.total = cart.total || 0
        state.coupon = cart.coupon || null
        state.error = null
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        const productId = action.payload?.productId
        // Remove from loading list even on error
        state.loadingProductIds = state.loadingProductIds.filter(
          (id) => id !== productId
        )
        state.error = action.payload?.message
      })

    // ── Update Item ────────────────────────────────────
    builder
      .addCase(updateItem.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateItem.fulfilled, updateCartState)
      .addCase(updateItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // ── Remove Item ────────────────────────────────────
    builder
      .addCase(removeItem.pending, (state) => {
        state.isLoading = true
      })
      .addCase(removeItem.fulfilled, updateCartState)
      .addCase(removeItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // ── Clear Cart ─────────────────────────────────────
    builder.addCase(clearAllItems.fulfilled, updateCartState)

    // ── Apply Coupon ───────────────────────────────────
    builder
      .addCase(applyCartCoupon.pending, (state) => {
        state.isLoading = true
      })
      .addCase(applyCartCoupon.fulfilled, updateCartState)
      .addCase(applyCartCoupon.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // ── Remove Coupon ──────────────────────────────────
    builder.addCase(removeCartCoupon.fulfilled, updateCartState)
  },
})

export const { clearCartError, resetCart } = cartSlice.actions
export default cartSlice.reducer
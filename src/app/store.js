import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authSlice'
import cartReducer from '../features/cartSlice'

// ─────────────────────────────────────────────────────
// WHAT IS THE REDUX STORE?
// ─────────────────────────────────────────────────────

// The store is like your app's brain — one central place
// that holds ALL global state

// Think of it like a big JavaScript object:
// {
//   auth: {
//     user: { name: "Akshat", email: "...", role: "user" },
//     accessToken: "eyJhbGci...",
//     isLoading: false,
//     error: null
//   },
//   cart: {
//     items: [...],
//     total: 25900,
//     itemsTotal: 25900,
//     isLoading: false
//   }
// }

// Any component can READ from this object using useSelector
// Any component can UPDATE this object using dispatch

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
})

export default store
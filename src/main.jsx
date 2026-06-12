import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import store from './app/store'
import App from './App.jsx'
import './index.css'

// ─────────────────────────────────────────────────────
// QUERY CLIENT CONFIGURATION
// ─────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      // staleTime = how long cached data is considered fresh
      // 5 minutes — don't refetch if data is less than 5 min old
      // So GET /api/products is cached for 5 minutes
      // User browses other pages and comes back — no API call!

      retry: 1,
      // If a query fails, retry once before showing error
      // Default is 3 — too many for our case

      refetchOnWindowFocus: false,
      // Don't refetch when user switches browser tabs
      // Default is true — annoying for e-commerce
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Redux Provider — makes store available to all components */}
    <Provider store={store}>

      {/* React Query Provider — makes queryClient available everywhere */}
      <QueryClientProvider client={queryClient}>

        {/* Your entire app */}
        <App />

        {/* Toast notifications — shows anywhere in the app */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#22c55e',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />

        {/* React Query DevTools — only shows in development */}
        <ReactQueryDevtools initialIsOpen={false} />

      </QueryClientProvider>
    </Provider>
  </StrictMode>
)
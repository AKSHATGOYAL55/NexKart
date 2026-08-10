const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Ping the backend health endpoint every 14 minutes
// Render free tier sleeps after 15 minutes of inactivity
// This keeps it awake so first-time users don't wait 30-50 seconds
export const startKeepAlive = () => {
  const ping = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/health`)
      console.log('Backend pinged ✓')
    } catch {
      // Silent fail — just a ping
    }
  }

  // Ping immediately on app load
  ping()

  // Then every 14 minutes
  const interval = setInterval(ping, 14 * 60 * 1000)

  // Return cleanup function
  return () => clearInterval(interval)
}
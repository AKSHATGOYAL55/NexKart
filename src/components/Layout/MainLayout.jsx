import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

// ─────────────────────────────────────────────────────
// MAIN LAYOUT
// Wraps every page with Navbar + Footer
// <Outlet /> is where the actual page content renders
// ─────────────────────────────────────────────────────

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* flex-1 makes main content fill remaining space
          pushes Footer to bottom even on short pages */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout
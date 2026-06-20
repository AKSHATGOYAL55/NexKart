// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom'
// import { Facebook, Twitter, Instagram, Mail } from 'lucide-react'


const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <span className="text-2xl font-bold text-white">
              Nex<span className="text-blue-400">Kart</span>
            </span>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Your one-stop destination for quality products at the best prices.
            </p>
            {/* <div className="flex gap-3 mt-4">
              <a href="#" className="hover:text-blue-400 transition-colors"><Facebook size={18} /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Twitter size={18} /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Instagram size={18} /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Mail size={18} /></a>
            </div> */}
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-medium mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Clothing" className="hover:text-white transition-colors">Clothing</Link></li>
              <li><Link to="/products?category=Books" className="hover:text-white transition-colors">Books</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-white font-medium mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-medium mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          © 2026 NexKart. Built for learning purposes.
        </div>
      </div>
    </footer>
  )
}

export default Footer
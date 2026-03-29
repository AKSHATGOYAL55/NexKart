import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">
          NexKart
        </h1>
        <p className="text-gray-500 text-lg">
          Your MERN e-commerce store is alive 🚀
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            React ✅
          </span>
          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            Vite ✅
          </span>
          <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            Tailwind ✅
          </span>
        </div>
      </div>
    </div>
  )
}

export default App


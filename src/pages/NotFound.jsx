import { useNavigate } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] sm:text-[160px] font-black text-gray-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-2">🔍</p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has
          been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home size={16} />
            Go Home
          </Button>
          <Button
            onClick={() => navigate('/products')}
            variant="secondary"
            className="gap-2"
          >
            <Search size={16} />
            Browse Products
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
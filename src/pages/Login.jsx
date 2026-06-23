import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'
import { login, clearError } from '../features/authSlice'
import { loginSchema } from '../utils/validationSchemas'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth)

  // ── React Hook Form setup ──────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    // zodResolver connects our Zod schema to React Hook Form
    // Every field is validated against loginSchema automatically
  })

  // ── Redirect if already logged in ──────────────────
  useEffect(() => {
    if (isAuthenticated) {
      // Go back to where user was trying to go before login
      // (saved by ProtectedRoute), or home page
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // ── Clear error when component unmounts ────────────
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // ── Form submit handler ────────────────────────────
  const onSubmit = async (data) => {
    const result = await dispatch(login(data))

    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!')
    } else {
      toast.error(result.payload || 'Login failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Login to continue shopping on NexKart
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)}>

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              // register() connects this input to React Hook Form
              // It returns { onChange, onBlur, name, ref }
              // spreading it auto-wires everything
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Backend error (wrong credentials etc) */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Login
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
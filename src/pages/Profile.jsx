import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Save,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getMe } from '../api/auth.api'
import api from '../api/axiosInstance'
import { fetchCurrentUser } from '../features/authSlice'
import { formatDate } from '../utils/formatDate'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'

// ─────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number')
    .or(z.literal('')),
})

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase and a number'
      ),
    confirmNewPassword: z
      .string()
      .min(1, 'Please confirm your new password'),
  })
  .refine(
    (data) => data.newPassword === data.confirmNewPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmNewPassword'],
    }
  )

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit number'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Enter valid 6-digit pincode'),
})

// ─────────────────────────────────────────────────────
// TABS CONFIG
// ─────────────────────────────────────────────────────
const TABS = [
  { id: 'profile', label: 'Profile Info', icon: User },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
]

const Profile = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('profile')

  // ── Fetch full user profile ────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getMe().then((res) => res.data),
    staleTime: 1000 * 60,
  })

  const profile = data?.user

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Profile Header ─────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {profile?.name}
            </h1>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  profile?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {profile?.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
              <span className="text-xs text-gray-400">
                Member since {formatDate(profile?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex items-center justify-center gap-2
              py-2.5 px-3 rounded-lg text-sm font-medium
              transition-all
              ${activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────── */}
      {activeTab === 'profile' && (
        <ProfileForm
          profile={profile}
          onSuccess={() => {
            dispatch(fetchCurrentUser())
            queryClient.invalidateQueries(['profile'])
          }}
        />
      )}

      {activeTab === 'password' && <PasswordForm />}

      {activeTab === 'addresses' && (
        <AddressManager
          addresses={profile?.addresses || []}
          onSuccess={() =>
            queryClient.invalidateQueries(['profile'])
          }
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────
// PROFILE FORM
// ─────────────────────────────────────────────────────
const ProfileForm = ({ profile, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
    },
  })

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        phone: profile.phone || '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await api.put('/api/users/profile', data)
      toast.success('Profile updated successfully!')
      onSuccess()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update profile'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <User size={18} className="text-blue-600" />
        <h2 className="font-semibold text-gray-900">
          Personal Information
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <Input
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50">
            <Mail size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {profile?.email}
            </span>
            <CheckCircle
              size={14}
              className="text-green-500 ml-auto"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Email cannot be changed
          </p>
        </div>

        <Input
          label="Phone Number"
          placeholder="9876543210"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-4"
        >
          <Save size={16} />
          Save Changes
        </Button>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// PASSWORD FORM
// ─────────────────────────────────────────────────────
const PasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await api.put('/api/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully!')
      reset()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to change password'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lock size={18} className="text-blue-600" />
        <h2 className="font-semibold text-gray-900">
          Change Password
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <Input
          label="Current Password"
          type="password"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword')}
        />

        <div className="bg-blue-50 rounded-lg p-3 mt-2">
          <p className="text-xs text-blue-700 font-medium mb-1">
            Password requirements:
          </p>
          <ul className="text-xs text-blue-600 space-y-0.5">
            <li>• At least 6 characters</li>
            <li>• One uppercase letter (A-Z)</li>
            <li>• One lowercase letter (a-z)</li>
            <li>• One number (0-9)</li>
          </ul>
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-4"
        >
          <Lock size={16} />
          Update Password
        </Button>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// ADDRESS MANAGER
// ─────────────────────────────────────────────────────
const AddressManager = ({ addresses, onSuccess }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingIdx, setEditingIdx] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(addressSchema),
  })

  const handleOpenAdd = () => {
    reset({
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
    })
    setEditingIdx(null)
    setShowForm(true)
  }

  const handleOpenEdit = (address, idx) => {
    reset(address)
    setEditingIdx(idx)
    setShowForm(true)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      if (editingIdx !== null) {
        await api.put(`/api/users/addresses/${editingIdx}`, data)
        toast.success('Address updated!')
      } else {
        await api.post('/api/users/addresses', data)
        toast.success('Address added!')
      }
      onSuccess()
      setShowForm(false)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save address'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (idx) => {
    try {
      await api.delete(`/api/users/addresses/${idx}`)
      toast.success('Address removed!')
      onSuccess()
    } catch (error) {
      toast.error('Failed to remove address')
    }
  }

  return (
    <div className="space-y-4">
      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
          <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">No saved addresses yet</p>
          <Button onClick={handleOpenAdd} className="mx-auto">
            <Plus size={16} />
            Add Address
          </Button>
        </div>
      ) : (
        <>
          {addresses.map((address, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg mt-0.5">
                    <MapPin size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {address.fullName}
                      </p>
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.street}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} —{' '}
                      {address.pincode}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📞 {address.phone}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(address, idx)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!showForm && (
            <Button onClick={handleOpenAdd} variant="secondary" className="w-full">
              <Plus size={16} />
              Add New Address
            </Button>
          )}
        </>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-5">
            {editingIdx !== null ? 'Edit Address' : 'Add New Address'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Input
                label="Full Name"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input
                label="Phone Number"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            <Input
              label="Street Address"
              error={errors.street?.message}
              {...register('street')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
              <Input
                label="City"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="State"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label="Pincode"
                error={errors.pincode?.message}
                {...register('pincode')}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                <Save size={16} />
                {editingIdx !== null ? 'Update' : 'Save Address'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Profile
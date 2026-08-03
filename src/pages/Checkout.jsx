import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Banknote,
  Smartphone,
  Building2,
  Wallet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createOrder } from '../api/order.api'
import { fetchCart, resetCart } from '../features/cartSlice'
import { formatCurrency } from '../utils/formatCurrency'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import useRazorpay from '../hooks/useRazorpay'

// ─────────────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────────────
const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit pincode'),
  orderNotes: z.string().optional(),
})

// ─────────────────────────────────────────────────────
// PAYMENT METHODS
// ─────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'razorpay',
    label: 'Pay Online',
    description: 'UPI • Cards • NetBanking • Wallets',
    icon: Smartphone,
    badge: 'Recommended',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'upi',
    label: 'UPI',
    description: 'GPay, PhonePe, Paytm, BHIM',
    icon: Smartphone,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    description: 'All major banks supported',
    icon: Building2,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when order arrives',
    icon: Banknote,
  },
]

// ─────────────────────────────────────────────────────
// STEPS
// ─────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Shipping' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Review' },
]

const Checkout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { initiatePayment, isProcessing } = useRazorpay()

  const { items, itemsTotal, discount } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)

  const [currentStep, setCurrentStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shippingData, setShippingData] = useState(null)

  const shippingPrice = itemsTotal > 500 ? 0 : 50
  const taxPrice = Math.round(itemsTotal * 0.18)
  const finalTotal = itemsTotal + taxPrice + shippingPrice - discount

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      navigate('/cart')
    }
  }, [items, navigate, isSubmitting])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
    },
  })

  // ── Step 1: Save shipping ───────────────────────────
  const handleShippingSubmit = (data) => {
    setShippingData(data)
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Step 3: Place order ─────────────────────────────
  // const handlePlaceOrder = async () => {
  //   setIsSubmitting(true)

  //   try {
  //     // Create order in MongoDB first
  //     const orderData = {
  //       shippingAddress: {
  //         fullName: shippingData.fullName,
  //         phone: shippingData.phone,
  //         street: shippingData.street,
  //         city: shippingData.city,
  //         state: shippingData.state,
  //         pincode: shippingData.pincode,
  //       },
  //       paymentMethod,
  //       orderNotes: shippingData.orderNotes || '',
  //     }

  //     const response = await createOrder(orderData)
  //     const order = response.data.order

  //     // Clear cart in Redux
  //     dispatch(resetCart())

  //     // ── COD — no payment needed ─────────────────────
  //     if (paymentMethod === 'cod') {
  //       toast.success('Order placed successfully!')
  //       navigate(`/orders/${order._id}`)
  //       return
  //     }

  //     // ── Online payment via Razorpay ─────────────────
  //     await initiatePayment({
  //       amount: finalTotal,
  //       orderId: order._id,
  //       orderDetails: {
  //         name: user?.name,
  //         email: user?.email,
  //         phone: shippingData.phone,
  //       },
  //       onSuccess: (paidOrder) => {
  //         navigate(`/orders/${paidOrder._id}`)
  //       },
  //       onFailure: (error) => {
  //         if (error !== 'cancelled') {
  //           // Still navigate to order — user can retry payment
  //           navigate(`/orders/${order._id}`)
  //         }
  //         setIsSubmitting(false)
  //       },
  //     })

  //   } catch (error) {
  //     toast.error(
  //       error.response?.data?.message || 'Failed to place order'
  //     )
  //     setIsSubmitting(false)
  //   }
  // }

 const handlePlaceOrder = async () => {
  setIsSubmitting(true)

  try {
    const orderData = {
      shippingAddress: {
        fullName: shippingData.fullName,
        phone: shippingData.phone,
        street: shippingData.street,
        city: shippingData.city,
        state: shippingData.state,
        pincode: shippingData.pincode,
      },
      paymentMethod,
      orderNotes: shippingData.orderNotes || '',
    }

    const response = await createOrder(orderData)
    const order = response.data.order

    // COD — clear cart and navigate immediately
    if (paymentMethod === 'cod') {
      dispatch(resetCart())
      toast.success('Order placed successfully!')
      navigate(`/orders/${order._id}`)
      return
    }

    // Online payment — DON'T clear cart yet
    // Clear cart only after payment is confirmed
    await initiatePayment({
      amount: finalTotal,
      orderId: order._id,
      orderDetails: {
        name: user?.name,
        email: user?.email,
        phone: shippingData.phone,
      },
      onSuccess: (paidOrder) => {
        dispatch(resetCart()) // ← clear cart AFTER payment success
        toast.success('Payment successful! 🎉')
        navigate(`/orders/${paidOrder._id}`)
      },
      onFailure: (error) => {
        // Don't clear cart on failure — let user retry
        if (error !== 'cancelled') {
          navigate(`/orders/${order._id}`)
        }
        setIsSubmitting(false)
      },
    })

  } catch (error) {
    console.error('Order error:', error.response?.data)
    toast.error(
      error.response?.data?.message || 'Failed to place order'
    )
    setIsSubmitting(false)
  }
}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

        {/* ── Left: Step Content ──────────────────────── */}
        <div className="lg:col-span-2">

          {/* ── STEP 1: Shipping ─────────────────────── */}
          {currentStep === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Shipping Address
                </h2>
              </div>

              <form onSubmit={handleSubmit(handleShippingSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <Input
                    label="Full Name"
                    placeholder="Your Name"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="9876543210"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
                <Input
                  label="Street Address"
                  placeholder="123, MG Road, Near City Mall"
                  error={errors.street?.message}
                  {...register('street')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                  <Input
                    label="City"
                    placeholder="Indore"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    label="State"
                    placeholder="Madhya Pradesh"
                    error={errors.state?.message}
                    {...register('state')}
                  />
                  <Input
                    label="Pincode"
                    placeholder="452001"
                    error={errors.pincode?.message}
                    {...register('pincode')}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Order Notes{' '}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    placeholder="Special delivery instructions..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    {...register('orderNotes')}
                  />
                </div>
                <Button type="submit" className="w-full py-3 text-base">
                  Continue to Payment
                  <ChevronRight size={18} />
                </Button>
              </form>
            </div>
          )}

          {/* ── STEP 2: Payment ──────────────────────── */}
          {currentStep === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3 mb-8">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  const isSelected = paymentMethod === method.id

                  return (
                    <label
                      key={method.id}
                      className={`
                        flex items-center gap-4 p-4 border-2 rounded-xl
                        cursor-pointer transition-all
                        ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => setPaymentMethod(method.id)}
                        className="accent-blue-600"
                      />
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          size={20}
                          className={
                            isSelected ? 'text-blue-600' : 'text-gray-500'
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {method.label}
                          </p>
                          {method.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${method.badgeColor}`}
                            >
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Razorpay security badge */}
              {paymentMethod !== 'cod' && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-6">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">Secured by Razorpay.</span>{' '}
                    Your payment information is encrypted and secure.
                    We never store your card details.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep(3)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex-1 py-3"
                >
                  Review Order
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ───────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-4">

              {/* Shipping summary */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Delivering To
                    </h3>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {shippingData && (
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p className="font-medium text-gray-900">
                      {shippingData.fullName}
                    </p>
                    <p>{shippingData.street}</p>
                    <p>
                      {shippingData.city}, {shippingData.state} —{' '}
                      {shippingData.pincode}
                    </p>
                    <p className="text-gray-500">📞 {shippingData.phone}</p>
                  </div>
                )}
              </div>

              {/* Payment summary */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Payment
                    </h3>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                </p>
              </div>

              {/* Items */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-4">
                  Order Items ({items.length})
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0]?.url && (
                          <img
                            src={item.product.images[0].url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Place Order */}
              <Button
                onClick={handlePlaceOrder}
                isLoading={isSubmitting || isProcessing}
                className="w-full py-4 text-base"
              >
                <CheckCircle size={20} />
                {paymentMethod === 'cod'
                  ? `Place Order — ${formatCurrency(finalTotal)}`
                  : `Pay ${formatCurrency(finalTotal)}`
                }
              </Button>

              {paymentMethod !== 'cod' && (
                <p className="text-center text-xs text-gray-400">
                  🔒 Secured by Razorpay — 256-bit SSL encryption
                </p>
              )}

              <p className="text-xs text-gray-400 text-center">
                By placing the order you agree to our Terms of Service
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Price Summary ─────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Price Details
            </h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Items ({items.length})</span>
                <span>{formatCurrency(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18% GST)</span>
                <span>{formatCurrency(taxPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shippingPrice === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    formatCurrency(shippingPrice)
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Razorpay badge */}
            <div className="border-t border-gray-100 pt-4 text-center">
              <p className="text-xs text-gray-400 mb-2">Secured by</p>
              <div className="flex items-center justify-center gap-1">
                <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Razorpay
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                UPI • Cards • NetBanking • Wallets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────
const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center">
    {steps.map((step, idx) => (
      <div key={step.id} className="flex items-center">
        <div className="flex flex-col items-center">
          <div
            className={`
              w-9 h-9 rounded-full flex items-center justify-center
              text-sm font-semibold transition-all
              ${currentStep > step.id
                ? 'bg-green-500 text-white'
                : currentStep === step.id
                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : 'bg-gray-100 text-gray-400'
              }
            `}
          >
            {currentStep > step.id ? (
              <CheckCircle size={18} />
            ) : (
              step.id
            )}
          </div>
          <span
            className={`text-xs mt-1.5 font-medium ${
              currentStep === step.id
                ? 'text-blue-600'
                : currentStep > step.id
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            {step.label}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div
            className={`h-0.5 w-20 sm:w-32 mx-2 mb-5 transition-all ${
              currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'
            }`}
          />
        )}
      </div>
    ))}
  </div>
)

export default Checkout
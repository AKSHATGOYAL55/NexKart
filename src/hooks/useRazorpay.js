import { useState } from 'react'
import toast from 'react-hot-toast'
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/order.api'


// Add this temporarily inside initiatePayment before the API call
import { getAccessToken } from '../api/axiosInstance'

// ─────────────────────────────────────────────────────
// CUSTOM HOOK — handles entire Razorpay payment flow
// Usage:
// const { initiatePayment, isProcessing } = useRazorpay()
// ─────────────────────────────────────────────────────

const useRazorpay = () => {
  const [isProcessing, setIsProcessing] = useState(false)



  const initiatePayment = async ({
    amount,        // in rupees
    orderId,       // your MongoDB order _id
    orderDetails,  // { name, email, phone } for prefill
    onSuccess,     // callback after successful payment
    onFailure,     // callback after failed payment
  }) => {
    setIsProcessing(true)

    const token = getAccessToken()
console.log('Token exists:', !!token)
console.log('Token preview:', token?.substring(0, 20))

    try {
      // Step 1: Create Razorpay order on backend
      const { data } = await createRazorpayOrder({ amount, orderId })

      // Step 2: Open Razorpay checkout popup
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'NexKart',
        description: 'Order Payment',
        image: '/favicon.svg',
        order_id: data.razorpayOrderId,

        // Step 3: Handle payment success
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            })

            toast.success('Payment successful! 🎉')
            onSuccess?.(verifyResponse.data.order)
          } catch (error) {
            toast.error('Payment verification failed')
            onFailure?.(error)
          }
        },

        // Prefill user details — auto-fills form in Razorpay popup
        prefill: {
          name: orderDetails?.name || '',
          email: orderDetails?.email || '',
          contact: orderDetails?.phone || '',
        },

        // UI customization
        theme: {
          color: '#4f46e5',
          backdrop_color: 'rgba(0,0,0,0.7)',
        },

        // Available payment methods
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay via UPI or NetBanking',
                instruments: [
                  { method: 'upi' },
                  { method: 'netbanking' },
                ],
              },
              cards: {
                name: 'Pay via Card',
                instruments: [{ method: 'card' }],
              },
              wallets: {
                name: 'Pay via Wallet',
                instruments: [{ method: 'wallet' }],
              },
            },
            sequence: ['block.banks', 'block.cards', 'block.wallets'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },

        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
            setIsProcessing(false)
            onFailure?.('cancelled')
          },
        },
      }

      // Open Razorpay popup
      const razorpay = new window.Razorpay(options)
      razorpay.open()

      // Handle payment failure inside popup
      razorpay.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`)
        setIsProcessing(false)
        onFailure?.(response.error)
      })

    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to initiate payment'
      )
      setIsProcessing(false)
    }
  }

  return { initiatePayment, isProcessing }
}

export default useRazorpay
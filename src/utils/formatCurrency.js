// Format number as Indian Rupees
// 134900 → ₹1,34,900
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format without symbol
// 134900 → 1,34,900
export const formatNumber = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount)
}
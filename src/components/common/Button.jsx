// ─────────────────────────────────────────────────────
// REUSABLE BUTTON
// One component for ALL buttons in the app
// Handles loading state, variants, disabled state
// ─────────────────────────────────────────────────────

const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  // Different visual styles based on variant prop
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'border border-gray-300 hover:border-blue-500 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'text-gray-700 hover:bg-gray-100',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        px-6 py-2.5 rounded-lg font-medium text-sm
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

export default Button
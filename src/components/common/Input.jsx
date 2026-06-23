import { forwardRef } from 'react'

// ─────────────────────────────────────────────────────
// REUSABLE INPUT
// forwardRef is REQUIRED for React Hook Form's register()
// to work — it needs direct access to the actual DOM input
// ─────────────────────────────────────────────────────

const Input = forwardRef(({ label, error, type = 'text', ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <input
        ref={ref}
        type={type}
        className={`
          w-full border rounded-lg px-4 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
        {...props}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1.5">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
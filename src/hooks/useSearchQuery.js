import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH FOR SEARCH
// Both Navbar and Products page use this hook
// URL = the only source of truth
// Local state = only for the input display (typing feel)
// ─────────────────────────────────────────────────────

const useSearchQuery = (debounceMs = 400) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // What's currently in the URL
  const urlKeyword = searchParams.get('keyword') || ''

  // Local state ONLY for input display
  // Initialized from URL so input shows correct value on load
  const [inputValue, setInputValue] = useState(urlKeyword)

  // Track if the change came from URL (external) or user typing
  const isExternalChange = useRef(false)
  const debounceTimer = useRef(null)

  // ── Sync input when URL changes externally ─────────
  // Example: user clicks a category link which clears keyword
  // OR user presses browser back button
  useEffect(() => {
    // Only sync if value actually differs
    // This prevents the race condition
    if (urlKeyword !== inputValue) {
      isExternalChange.current = true
      setInputValue(urlKeyword)
    }
  }, [urlKeyword])

  // ── Handle user typing ─────────────────────────────
  const handleChange = (value) => {
    // If this change came from external (URL sync), skip debounce
    if (isExternalChange.current) {
      isExternalChange.current = false
      return
    }

    setInputValue(value)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new debounce timer
    debounceTimer.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        navigate(
          `/products?keyword=${encodeURIComponent(value.trim())}`,
          { replace: true }
        )
      } else if (value.trim() === '') {
        navigate('/products', { replace: true })
      }
    }, debounceMs)
  }

  // ── Handle form submit (Enter / button click) ──────
  const handleSubmit = (e) => {
    e?.preventDefault()

    // Clear debounce timer — submit is immediate
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (inputValue.trim()) {
      navigate(
        `/products?keyword=${encodeURIComponent(inputValue.trim())}`
      )
    } else {
      navigate('/products')
    }
  }

  // ── Clear search ───────────────────────────────────
  const handleClear = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    setInputValue('')
    navigate('/products', { replace: true })
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return {
    inputValue,
    urlKeyword,
    handleChange,
    handleSubmit,
    handleClear,
  }
}

export default useSearchQuery
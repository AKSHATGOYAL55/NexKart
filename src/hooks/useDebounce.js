import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────
// WHAT IS DEBOUNCING?
// ─────────────────────────────────────────────────────

// User types "laptop" in search box — 6 keystrokes
// WITHOUT debounce: 6 API calls (l, la, lap, lapt, lapto, laptop)
// WITH debounce: 1 API call (after user stops typing for 500ms)

// HOW IT WORKS:
// Every time value changes, we set a 500ms timer
// If value changes AGAIN before timer fires, we reset the timer
// Timer only fires when user stops typing for 500ms
// Only THEN does the debounced value update → triggering the API call

const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: cancel timer if value changes before delay
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
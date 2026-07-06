import { useState, useRef, useEffect } from 'react'

const Image = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallback = null,
  eager = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(eager)
  const wrapperRef = useRef(null)

  // Reset state when src changes (page navigation)
  useEffect(() => {
    if (src) {
      setIsLoaded(false)
      setIsError(false)
      if (eager) {
        setIsInView(true)
      } else {
        setIsInView(false)
      }
    }
  }, [src, eager])

  useEffect(() => {
    if (eager || !src) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        // Start loading 400px before entering viewport
        // More buffer = images ready before user sees them
        rootMargin: '400px 0px',
        threshold: 0.01,
      }
    )

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current)
    }

    return () => observer.disconnect()
  }, [eager, src])

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-gray-100 ${wrapperClassName}`}
    >
      {/* Skeleton */}
      {!isLoaded && !isError && src && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]" />
      )}

      {/* Image */}
      {isInView && src && !isError && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          className={`
            w-full h-full object-cover
            transition-opacity duration-200
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
        />
      )}

      {/* Error fallback */}
      {(isError || !src) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
          {fallback || (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">No image</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Image
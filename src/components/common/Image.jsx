import { useState, useRef, useEffect } from 'react'

// ─────────────────────────────────────────────────────
// OPTIMIZED IMAGE COMPONENT
// Solves 3 problems:
// 1. Intersection Observer — only loads when visible in viewport
// 2. Blur placeholder — shows while loading, no layout shift
// 3. Error fallback — shows placeholder if image fails
// 4. Once loaded — stays in memory, never re-fetches on scroll
// ─────────────────────────────────────────────────────

const Image = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallback = null,
  eager = false, // true = load immediately (above fold images)
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(eager)
  // eager=true skips intersection observer
  // use for hero images and above-the-fold content

  const imgRef = useRef(null)
  const wrapperRef = useRef(null)

  // ── Intersection Observer ──────────────────────────
  // Only starts loading image when it enters the viewport
  // rootMargin: '200px' = start loading 200px BEFORE entering view
  // So by the time user sees it, image is already loaded
  useEffect(() => {
    if (eager) return // skip for eager images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect() // stop observing once triggered
          }
        })
      },
      {
        rootMargin: '200px 0px', // start loading 200px before visible
        threshold: 0.01,
      }
    )

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current)
    }

    return () => observer.disconnect()
  }, [eager])

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-gray-100 ${wrapperClassName}`}
    >
      {/* ── Skeleton Placeholder ─────────────────────
          Shows animated pulse while image loads
          Same dimensions as image — prevents layout shift */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* ── Actual Image ──────────────────────────────
          Only renders src when isInView = true
          This prevents browser from fetching it early */}
      {isInView && !isError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          className={`
            w-full h-full object-cover
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          // These attributes help browser optimize:
          decoding="async"     // don't block main thread while decoding
          fetchPriority={eager ? 'high' : 'low'}
        />
      )}

      {/* ── Error Fallback ────────────────────────────
          Shows when image URL is broken */}
      {isError && (
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
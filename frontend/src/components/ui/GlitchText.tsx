import { useEffect, useRef, useState } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
}

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    function scheduleGlitch() {
      const delay = Math.random() * 6000 + 2000 // 2–8 seconds
      timeoutRef.current = setTimeout(() => {
        setIsGlitching(true)
        setTimeout(() => {
          setIsGlitching(false)
          scheduleGlitch()
        }, 350)
      }, delay)
    }

    scheduleGlitch()
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ display: 'inline-block' }}
    >
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {text}
        {isGlitching && (
          <>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                color: '#00e5ff',
                clipPath: 'inset(30% 0 50% 0)',
                transform: 'translate(-3px, 2px)',
                opacity: 0.85,
              }}
            >
              {text}
            </span>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                color: '#ff00ff',
                clipPath: 'inset(60% 0 10% 0)',
                transform: 'translate(3px, -2px)',
                opacity: 0.85,
              }}
            >
              {text}
            </span>
          </>
        )}
      </span>
    </span>
  )
}

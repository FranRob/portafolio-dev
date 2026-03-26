import { useEffect, useRef } from 'react'
import { trackSection } from '../services/api'

export function useAnalytics(sectionName: string) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackedRef = useRef(false)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true
          trackSection(sectionName).catch(() => {
            // Silently fail — analytics should never break the UI
          })
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [sectionName])

  return sectionRef
}

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const TEXT_INPUT = 'input, textarea'
const INTERACTIVE = 'a, button, [role="button"], label, select, [class*="cursor-pointer"]'

export default function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const hovering = useRef(false)
  const onText = useRef(false)

  useEffect(() => {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;'
    document.body.appendChild(el)
    containerRef.current = el
    setReady(true)
    return () => { el.remove() }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    const caret = caretRef.current
    if (!dot || !ring || !caret) return

    function move(e: MouseEvent) {
      dot!.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      ring!.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`
      caret!.style.transform = `translate(${e.clientX - 1}px, ${e.clientY - 8}px)`
    }

    function onOver(e: MouseEvent) {
      const target = e.target as Element
      const isText = !!target.closest(TEXT_INPUT)
      const isInteractive = !!target.closest(INTERACTIVE)

      if (isText && !onText.current) {
        onText.current = true
        dot!.style.opacity = '0'
        ring!.style.opacity = '0'
        caret!.style.animation = 'cursor-blink 0.8s step-end infinite'
        caret!.style.opacity = '1'
        return
      }

      if (!isText && onText.current) {
        onText.current = false
        dot!.style.opacity = '1'
        caret!.style.animation = 'none'
        caret!.style.opacity = '0'
        hovering.current = false
        ring!.style.boxShadow = 'none'
        ring!.style.opacity = '0.5'
      }

      if (isText) return

      if (isInteractive && !hovering.current) {
        hovering.current = true
        ring!.style.boxShadow = '0 0 10px var(--social-cyan), 0 0 20px var(--social-cyan)'
        ring!.style.opacity = '0.9'
      } else if (!isInteractive && hovering.current) {
        hovering.current = false
        ring!.style.boxShadow = 'none'
        ring!.style.opacity = '0.5'
      }
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', onOver)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', onOver)
    }
  }, [ready])

  if (!ready || !containerRef.current) return null

  return createPortal(
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--social-cyan)',
          boxShadow: '0 0 8px var(--social-cyan)',
          pointerEvents: 'none',
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          transition: 'opacity 0.1s ease',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 24, height: 24,
          borderRadius: '50%',
          border: '1.5px solid var(--social-cyan)',
          opacity: 0.5,
          pointerEvents: 'none',
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          transition: 'box-shadow 0.15s ease, opacity 0.15s ease',
        }}
      />
      {/* Text caret — blinking vertical bar */}
      <div
        ref={caretRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 2, height: 16,
          background: 'var(--social-cyan)',
          boxShadow: '0 0 6px var(--social-cyan), 0 0 12px var(--social-cyan)',
          opacity: 0,
          pointerEvents: 'none',
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          animation: 'none',
          transition: 'opacity 0.1s ease',
        }}
      />
    </>,
    containerRef.current
  )
}

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// IntersectionObserver polyfill for framer-motion whileInView
class IntersectionObserverMock {
  readonly root: null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})

// Canvas 2D context mock for StarField (jsdom doesn't implement getContext)
class CanvasRenderingContext2DMock {
  fillStyle = ''
  globalAlpha = 1
  shadowBlur = 0
  shadowColor = ''
  save() {}
  restore() {}
  beginPath() {}
  arc() {}
  fill() {}
  clearRect() {}
  translate() {}
  scale() {}
  rotate() {}
  measureText() { return { width: 0 } }
}

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  configurable: true,
  value: () => new CanvasRenderingContext2DMock(),
})

// Global framer-motion mock — jsdom doesn't support WAAPI,
// so we replace motion.* with plain HTML element strings
vi.mock('motion/react', () => ({
  motion: {
    div: 'div',
    form: 'form',
    button: 'button',
    p: 'p',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    section: 'section',
    article: 'article',
    header: 'header',
    nav: 'nav',
    main: 'main',
    footer: 'footer',
    aside: 'aside',
    img: 'img',
    svg: 'svg',
    path: 'path',
    ul: 'ul',
    li: 'li',
    a: 'a',
  },
  AnimatePresence: ({ children }: any) => children,
}))

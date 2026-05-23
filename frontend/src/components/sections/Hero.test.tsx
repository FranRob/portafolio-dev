import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => ({ current: null })),
}))

import Hero from './Hero'
import { useAnalytics } from '../../hooks/useAnalytics'

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders CTA buttons with correct text', () => {
    render(<Hero />)

    expect(screen.getByRole('button', { name: /ver mi stack tecnológico/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /contactarme/i })).toBeInTheDocument()
  })

  it('displays the developer name via GlitchText', () => {
    render(<Hero />)

    expect(screen.getByText('divMalCentrado')).toBeInTheDocument()
  })

  it('displays the greeting text', () => {
    render(<Hero />)

    expect(screen.getByText('Hola, soy')).toBeInTheDocument()
  })

  it('calls useAnalytics with "hero"', () => {
    render(<Hero />)

    expect(vi.mocked(useAnalytics)).toHaveBeenCalledWith('hero')
  })
})

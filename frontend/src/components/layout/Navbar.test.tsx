import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => ({ current: null })),
}))

import Navbar from './Navbar'

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation links', () => {
    render(<Navbar />)

    expect(screen.getByRole('button', { name: /ir a inicio/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ir a stack/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ir a sobre m/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ir a proyectos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ir a contacto/i })).toBeInTheDocument()
  })

  it('renders the brand button to go home', () => {
    render(<Navbar />)

    const brand = screen.getByRole('button', { name: /ir al inicio/i })
    expect(brand).toBeInTheDocument()
    expect(brand).toHaveTextContent('divMalCentrado')
  })

  it('toggles mobile menu when hamburger button is clicked', () => {
    render(<Navbar />)

    const toggleButton = screen.getByRole('button', { name: /abrir menú/i })
    expect(toggleButton).toBeInTheDocument()

    // Mobile menu is hidden by default (desktop links still visible)
    expect(screen.getByRole('button', { name: /ir a stack/i })).toBeInTheDocument()

    // Click to open
    fireEvent.click(toggleButton)

    // Button should now say "Cerrar menú"
    expect(screen.getByRole('button', { name: /cerrar menú/i })).toBeInTheDocument()

    // Click to close
    fireEvent.click(screen.getByRole('button', { name: /cerrar menú/i }))

    // Button should say "Abrir menú" again
    expect(screen.getByRole('button', { name: /abrir menú/i })).toBeInTheDocument()
  })

  it('has proper aria-label on navigation', () => {
    render(<Navbar />)

    const nav = screen.getByRole('navigation', { name: /navegación principal/i })
    expect(nav).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Contact from './Contact'

// Mock useAnalytics hook
vi.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => ({ current: null })),
}))

// Mock API
vi.mock('../../services/api', () => ({
  submitContact: vi.fn(),
}))

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders social links with correct aria-labels', () => {
    render(<Contact />)

    expect(screen.getByRole('link', { name: /linkedin - franco robles/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /github - divmalcentrado/i })).toBeInTheDocument()
  })

  it('does not submit form with empty fields', async () => {
    const { submitContact } = await import('../../services/api')

    render(<Contact />)

    const submitButton = screen.getByRole('button', { name: /enviar mensaje/i })
    fireEvent.click(submitButton)

    // Form should not submit because fields are empty (HTML5 required validation)
    await waitFor(() => {
      expect(submitContact).not.toHaveBeenCalled()
    })
  })

  it('renders the contact form with all fields', () => {
    render(<Contact />)

    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Contame en qué puedo ayudarte...')).toBeInTheDocument()
  })

  it('shows success message after successful submission', async () => {
    const { submitContact } = await import('../../services/api')
    vi.mocked(submitContact).mockResolvedValue(undefined)

    render(<Contact />)

    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'test@email.com' } })
    fireEvent.change(screen.getByPlaceholderText('Contame en qué puedo ayudarte...'), { target: { value: 'Hello!' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }))

    await waitFor(() => {
      expect(screen.getByText(/mensaje enviado/i)).toBeInTheDocument()
    })
  })
})

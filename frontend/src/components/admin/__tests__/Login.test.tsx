import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../../services/api', () => ({ login: vi.fn() }))
vi.mock('react-router', () => ({ useNavigate: vi.fn() }))

import Login from '../Login'
import { login } from '../../../services/api'
import { useNavigate } from 'react-router'

function createAxiosError(status?: number, data?: Record<string, string>) {
  if (status) {
    return {
      isAxiosError: true,
      response: { status, data: data || { error: 'Error' } },
      message: `Request failed with status code ${status}`,
      name: 'AxiosError',
    }
  }
  return {
    isAxiosError: true,
    message: 'Network Error',
    response: undefined,
    name: 'AxiosError',
  }
}

const VALID_EMAIL = 'admin@test.com'
const VALID_PASSWORD = 'password123'
const LOGIN_RESPONSE = {
  user: { id: '1', email: 'admin@test.com', createdAt: '2024-01-01T00:00:00.000Z' },
}

describe('Login Component', () => {
  const user = userEvent.setup()
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(login).mockResolvedValue(LOGIN_RESPONSE)
  })

  it('renders login form with email, password, and submit button', () => {
    render(<Login />)

    expect(screen.getByPlaceholderText('admin@ejemplo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('displays "divMalCentrado" and "Panel de métricas"', () => {
    render(<Login />)

    expect(screen.getByText('divMalCentrado')).toBeInTheDocument()
    expect(screen.getByText('Panel de métricas')).toBeInTheDocument()
  })

  it('does not call API when form is submitted with empty fields', async () => {
    render(<Login />)

    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(login).not.toHaveBeenCalled()
  })

  it('calls login() with email and password on submit', async () => {
    render(<Login />)

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), VALID_EMAIL)
    await user.type(screen.getByPlaceholderText('••••••••'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: VALID_EMAIL, password: VALID_PASSWORD })
    })
  })

  it('shows loading state on submit with "Verificando..." and disabled button', async () => {
    // Make login return a promise that never resolves to keep loading state
    vi.mocked(login).mockReturnValue(new Promise(() => {}))

    render(<Login />)

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), VALID_EMAIL)
    await user.type(screen.getByPlaceholderText('••••••••'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Verificando...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /verificando/i })).toBeDisabled()
  })

  it('navigates to /admin/dashboard on successful login', async () => {
    render(<Login />)

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), VALID_EMAIL)
    await user.type(screen.getByPlaceholderText('••••••••'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true })
    })
  })

  it('shows "Email o contraseña incorrectos" on 401', async () => {
    vi.mocked(login).mockRejectedValue(createAxiosError(401))

    render(<Login />)

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), VALID_EMAIL)
    await user.type(screen.getByPlaceholderText('••••••••'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Email o contraseña incorrectos.')).toBeInTheDocument()
  })

  it('shows "Demasiados intentos" on 429', async () => {
    vi.mocked(login).mockRejectedValue(createAxiosError(429))

    render(<Login />)

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), VALID_EMAIL)
    await user.type(screen.getByPlaceholderText('••••••••'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Demasiados intentos. Esperá 15 minutos.')).toBeInTheDocument()
  })

  it('shows network error when no response from server', async () => {
    vi.mocked(login).mockRejectedValue(createAxiosError())

    render(<Login />)

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), VALID_EMAIL)
    await user.type(screen.getByPlaceholderText('••••••••'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    // Retries take ~3s (1s + 2s delays), so wait up to 10s
    expect(await screen.findByText(/No hay conexión con el servidor/, {}, { timeout: 10000 })).toBeInTheDocument()
  })

  it('shows generic error message for unknown Error instances', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Error personalizado'))

    render(<Login />)

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), VALID_EMAIL)
    await user.type(screen.getByPlaceholderText('••••••••'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    // Retries take ~3s, wait up to 10s
    expect(await screen.findByText('Error personalizado', {}, { timeout: 10000 })).toBeInTheDocument()
  })

  it('shows retry count during retry sequence on network error', async () => {
    vi.mocked(login)
      .mockRejectedValueOnce(createAxiosError())
      .mockResolvedValueOnce(LOGIN_RESPONSE)

    render(<Login />)

    await user.type(screen.getByPlaceholderText('admin@ejemplo.com'), VALID_EMAIL)
    await user.type(screen.getByPlaceholderText('••••••••'), VALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    // The retry text appears asynchronously after first rejection fires onRetry(1)
    expect(await screen.findByText(/Reintentando \(1\/3\)/, {}, { timeout: 5000 })).toBeInTheDocument()
  })

  it('navigates to / when "Volver al portfolio" is clicked', async () => {
    render(<Login />)

    await user.click(screen.getByText(/Volver al portfolio/))

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../../services/api', () => ({ getStats: vi.fn(), logout: vi.fn() }))
vi.mock('react-router', () => ({ useNavigate: vi.fn() }))
vi.mock('../AdminProjects', () => ({ default: () => 'AdminProjectsStub' }))
vi.mock('../AdminMessages', () => ({ AdminMessages: () => 'AdminMessagesStub' }))
vi.mock('../AdminSettings', () => ({ default: () => 'AdminSettingsStub' }))

import Dashboard from '../Dashboard'
import { getStats, logout } from '../../../services/api'
import { useNavigate } from 'react-router'
import type { AnalyticsStats } from '../../../services/api'

const MOCK_STATS: AnalyticsStats = {
  totalVisits: 1234,
  todayVisits: 56,
  mostViewedSection: 'hero',
  unreadMessages: 3,
  sectionViews: {
    hero: 500,
    stack: 300,
    about: 200,
    contact: 100,
  },
  dailyVisits: [
    { date: '2026-06-01', count: 100 },
    { date: '2026-06-02', count: 150 },
    { date: '2026-06-03', count: 120 },
    { date: '2026-06-04', count: 200 },
    { date: '2026-06-05', count: 180 },
    { date: '2026-06-06', count: 90 },
    { date: '2026-06-07', count: 210 },
  ],
}

const EMPTY_STATS: AnalyticsStats = {
  totalVisits: 0,
  todayVisits: 0,
  mostViewedSection: '',
  unreadMessages: 0,
  sectionViews: {},
  dailyVisits: [],
}

describe('Dashboard Component', () => {
  const user = userEvent.setup()
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(getStats).mockResolvedValue(MOCK_STATS)
    vi.mocked(logout).mockResolvedValue(undefined)
    sessionStorage.setItem('admin_token', 'test-token')
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('shows loading spinner initially', async () => {
    vi.mocked(getStats).mockReturnValue(new Promise(() => {}))

    render(<Dashboard />)

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
  })

  it('calls getStats on mount', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(getStats).toHaveBeenCalledOnce()
    })
  })

  it('renders stat cards with data after loading', async () => {
    render(<Dashboard />)

    expect(await screen.findByText('1234')).toBeInTheDocument()
    expect(await screen.findByText('56')).toBeInTheDocument()
    // "hero" appears in stat card AND chart label
    expect(screen.getAllByText('hero').length).toBeGreaterThanOrEqual(2)
    expect(await screen.findByText('3')).toBeInTheDocument()

    expect(screen.getByText('Total Visitas')).toBeInTheDocument()
    expect(screen.getByText('Visitas Hoy')).toBeInTheDocument()
    expect(screen.getByText('Sección + Vista')).toBeInTheDocument()
    expect(screen.getByText('Sin Leer')).toBeInTheDocument()
  })

  it('shows zero values when stats are empty', async () => {
    vi.mocked(getStats).mockResolvedValue(EMPTY_STATS)

    render(<Dashboard />)

    // Wait for stats to load, then stat cards render with 0 values
    await waitFor(() => {
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3)
    })
    // Most viewed section is empty string, so stat shows blank, not '—'
    expect(screen.getByText('Total Visitas')).toBeInTheDocument()
  })

  it('renders section views bar chart with labels', async () => {
    render(<Dashboard />)

    expect(await screen.findByText('Vistas por Sección')).toBeInTheDocument()
    // "hero" appears both in stat card (Sección + Vista) and chart label
    expect(screen.getAllByText('hero').length).toBeGreaterThanOrEqual(2)
    // Other sections only in chart labels
    expect(screen.getByText('stack')).toBeInTheDocument()
    expect(screen.getByText('about')).toBeInTheDocument()
    expect(screen.getByText('contact')).toBeInTheDocument()
  })

  it('shows "Sin datos aún" when sectionViews is empty', async () => {
    vi.mocked(getStats).mockResolvedValue(EMPTY_STATS)

    render(<Dashboard />)

    // "Sin datos aún" appears twice: empty sectionViews AND empty dailyVisits
    const emptyMessages = await screen.findAllByText('Sin datos aún')
    expect(emptyMessages.length).toBeGreaterThanOrEqual(2)
  })

  it('renders daily visits timeline', async () => {
    render(<Dashboard />)

    expect(await screen.findByText('Últimos 7 Días')).toBeInTheDocument()
    // "100" appears in both section views (contact=100) and daily visits
    expect(screen.getAllByText('100').length).toBeGreaterThanOrEqual(2)
    // "210" appears only in daily visits
    expect(screen.getByText('210')).toBeInTheDocument()
  })

  it('shows error message when getStats fails', async () => {
    vi.mocked(getStats).mockRejectedValue(new Error('API Error'))

    render(<Dashboard />)

    expect(await screen.findByText(/Error al cargar los datos/)).toBeInTheDocument()
  })

  it('switches to Mensajes tab on click', async () => {
    render(<Dashboard />)

    const messagesTab = await screen.findByRole('button', { name: /mensajes/i })
    await user.click(messagesTab)

    expect(await screen.findByText('AdminMessagesStub')).toBeInTheDocument()
  })

  it('switches to Proyectos tab on click', async () => {
    render(<Dashboard />)

    const projectsTab = await screen.findByRole('button', { name: /proyectos/i })
    await user.click(projectsTab)

    expect(await screen.findByText('AdminProjectsStub')).toBeInTheDocument()
  })

  it('switches to Ajustes tab on click', async () => {
    render(<Dashboard />)

    const settingsTab = await screen.findByRole('button', { name: /ajustes/i })
    await user.click(settingsTab)

    expect(await screen.findByText('AdminSettingsStub')).toBeInTheDocument()
  })

  it('has Métricas tab active by default', async () => {
    render(<Dashboard />)

    const metricsTab = await screen.findByRole('button', { name: /métricas/i })
    expect(metricsTab).toHaveClass('text-neon-purple')
  })

  it('calls logout and navigates to /admin/login on logout click', async () => {
    render(<Dashboard />)

    const logoutButton = await screen.findByRole('button', { name: /cerrar sesión/i })
    await user.click(logoutButton)

    await waitFor(() => {
      expect(logout).toHaveBeenCalledOnce()
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login', { replace: true })
    })
  })

  it('navigates to / when Portfolio button is clicked', async () => {
    render(<Dashboard />)

    const portfolioButton = await screen.findByTitle('Volver al portfolio')
    await user.click(portfolioButton)

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('restores admin_active_tab from sessionStorage', async () => {
    sessionStorage.setItem('admin_active_tab', 'messages')

    render(<Dashboard />)

    expect(await screen.findByText('AdminMessagesStub')).toBeInTheDocument()
  })
})

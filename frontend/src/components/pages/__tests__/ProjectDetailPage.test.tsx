import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

// --- Mock react-markdown and rehype-sanitize to avoid ESM issues in jsdom ---
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => children,
}))

vi.mock('rehype-sanitize', () => ({
  default: () => null,
}))

// --- Mock lucide-react icons ---
vi.mock('lucide-react', () => ({
  ExternalLink: () => 'ExternalLink',
  ArrowLeft: () => 'ArrowLeft',
}))

// --- Mock BrandIcons ---
vi.mock('../../ui/BrandIcons', () => ({
  GithubIcon: () => 'GithubIcon',
}))

// --- Mock api service (no JSX, plain objects only) ---
const { mockGetProjectBySlug } = vi.hoisted(() => ({
  mockGetProjectBySlug: vi.fn(),
}))

vi.mock('../../../services/api', () => ({
  getProjectBySlug: mockGetProjectBySlug,
}))

import ProjectDetailPage from '../ProjectDetailPage'

// Test data — plain objects, no JSX
const MOCK_PROJECT = {
  id: 'proj-1',
  title: 'My Test Project',
  description: 'A test project description',
  stack: ['React', 'TypeScript'],
  status: 'completed' as const,
  category: 'personal' as const,
  featured: false,
  order: 0,
  slug: 'my-test-project',
  repoUrl: 'https://github.com/test/repo',
  demoUrl: 'https://demo.example.com',
  imageUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  content: '# Project Content\n\nThis is markdown content.',
}

const MOCK_PROJECT_NO_CONTENT = {
  ...MOCK_PROJECT,
  id: 'proj-2',
  slug: 'no-content-project',
  content: null,
  repoUrl: null,
  demoUrl: null,
}

function renderWithRouter(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/proyectos/${slug}`]}>
      <Routes>
        <Route path="/proyectos/:slug" element={<ProjectDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders project title, status badge, and stack pills on successful fetch', async () => {
    mockGetProjectBySlug.mockResolvedValue(MOCK_PROJECT)

    renderWithRouter('my-test-project')

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Test Project')
    })

    // Status badge — "Live" for completed
    expect(screen.getByText('Live')).toBeInTheDocument()

    // Stack pills
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders markdown content when content is present', async () => {
    mockGetProjectBySlug.mockResolvedValue(MOCK_PROJECT)

    renderWithRouter('my-test-project')

    await waitFor(() => {
      // React-markdown is mocked to render children as plain text
      expect(screen.getByText(/Project Content/)).toBeInTheDocument()
    })
  })

  it('renders repo and demo links when URLs exist', async () => {
    mockGetProjectBySlug.mockResolvedValue(MOCK_PROJECT)

    renderWithRouter('my-test-project')

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /ver demo/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /ver código/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /ver demo/i })).toHaveAttribute(
      'href',
      'https://demo.example.com',
    )
    expect(screen.getByRole('link', { name: /ver código/i })).toHaveAttribute(
      'href',
      'https://github.com/test/repo',
    )
  })

  it('hides repo and demo links when URLs are null', async () => {
    mockGetProjectBySlug.mockResolvedValue(MOCK_PROJECT_NO_CONTENT)

    renderWithRouter('no-content-project')

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    expect(screen.queryByRole('link', { name: /ver demo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /ver código/i })).not.toBeInTheDocument()
  })

  it('renders "Proyecto no encontrado" on 404 response', async () => {
    const notFoundError = { response: { status: 404 }, message: 'Not Found' }
    mockGetProjectBySlug.mockRejectedValue(notFoundError)

    renderWithRouter('does-not-exist')

    await waitFor(() => {
      expect(screen.getByText('Proyecto no encontrado')).toBeInTheDocument()
    })

    // 404 state renders role=alert
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders description when project is loaded', async () => {
    mockGetProjectBySlug.mockResolvedValue(MOCK_PROJECT)

    renderWithRouter('my-test-project')

    await waitFor(() => {
      expect(screen.getByText('A test project description')).toBeInTheDocument()
    })
  })

  it('calls getProjectBySlug with the slug from URL params', async () => {
    mockGetProjectBySlug.mockResolvedValue(MOCK_PROJECT)

    renderWithRouter('my-test-project')

    await waitFor(() => {
      expect(mockGetProjectBySlug).toHaveBeenCalledWith('my-test-project')
    })
  })

  it('does not render markdown article when content is null', async () => {
    mockGetProjectBySlug.mockResolvedValue(MOCK_PROJECT_NO_CONTENT)

    renderWithRouter('no-content-project')

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    // The article with detailed description is not rendered
    expect(
      screen.queryByRole('article', { name: /descripción detallada/i }),
    ).not.toBeInTheDocument()
  })
})

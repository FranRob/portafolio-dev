import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Project } from '../../../services/api'

// --- Mock api module ---
const { mockGetProjects, mockCreateProject, mockUpdateProject, mockDeleteProject } = vi.hoisted(
  () => ({
    mockGetProjects: vi.fn(),
    mockCreateProject: vi.fn(),
    mockUpdateProject: vi.fn(),
    mockDeleteProject: vi.fn(),
  }),
)

vi.mock('../../../services/api', () => ({
  getProjects: mockGetProjects,
  createProject: mockCreateProject,
  updateProject: mockUpdateProject,
  deleteProject: mockDeleteProject,
}))

// --- Mock sub-components ---
vi.mock('../AdminSkeleton', () => ({
  ProjectsSkeleton: () => 'ProjectsSkeletonStub',
}))

vi.mock('../ConfirmModal', () => ({
  ConfirmModal: () => null,
}))

import AdminProjects from '../AdminProjects'

const MOCK_PROJECT: Project = {
  id: 'proj-admin-1',
  title: 'Admin Test Project',
  description: 'A project for admin testing',
  stack: ['TypeScript'],
  status: 'in_progress',
  category: 'personal',
  featured: false,
  order: 0,
  slug: 'admin-test-project',
  repoUrl: null,
  demoUrl: null,
  imageUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('AdminProjects', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProjects.mockResolvedValue([MOCK_PROJECT])
    mockCreateProject.mockResolvedValue({ ...MOCK_PROJECT, id: 'new-proj' })
    mockUpdateProject.mockResolvedValue(MOCK_PROJECT)
    mockDeleteProject.mockResolvedValue(undefined)
  })

  it('renders the projects list after loading', async () => {
    render(<AdminProjects />)

    await waitFor(() => {
      expect(screen.getByText('Admin Test Project')).toBeInTheDocument()
    })
  })

  it('opens the create form when "Nuevo Proyecto" is clicked', async () => {
    render(<AdminProjects />)

    await waitFor(() => {
      expect(screen.getByText('Admin Test Project')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /nuevo proyecto/i }))

    expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument()
  })

  it('renders file input with accept=".md" in the create form', async () => {
    render(<AdminProjects />)

    await waitFor(() => {
      expect(screen.getByText('Admin Test Project')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /nuevo proyecto/i }))

    const fileInput = screen.getByLabelText('Archivo Markdown para contenido del proyecto')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('type', 'file')
    expect(fileInput).toHaveAttribute('accept', '.md')
  })

  it('renders file input with accept=".md" in the edit form', async () => {
    render(<AdminProjects />)

    await waitFor(() => {
      expect(screen.getByText('Admin Test Project')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /editar proyecto admin test project/i }))

    const fileInput = screen.getByLabelText('Archivo Markdown para contenido del proyecto')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', '.md')
  })

  it('displays "Ningún archivo seleccionado" before file selection', async () => {
    render(<AdminProjects />)

    await waitFor(() => {
      expect(screen.getByText('Admin Test Project')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /nuevo proyecto/i }))

    expect(screen.getByText('Ningún archivo seleccionado')).toBeInTheDocument()
  })

  it('updates mdFileName state and displays filename after FileReader reads file', async () => {
    render(<AdminProjects />)

    await waitFor(() => {
      expect(screen.getByText('Admin Test Project')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /nuevo proyecto/i }))

    const fileInput = screen.getByLabelText('Archivo Markdown para contenido del proyecto')

    // Create a mock File and simulate FileReader
    const content = '# Hello World\n\nTest content'
    const file = new File([content], 'project.md', { type: 'text/markdown' })

    // Mock FileReader.readAsText to trigger onload synchronously
    const originalFileReader = globalThis.FileReader
    class MockFileReader {
      result: string | null = null
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null
      readAsText(f: Blob) {
        void f
        this.result = content
        if (this.onload) {
          this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
        }
      }
    }
    Object.defineProperty(globalThis, 'FileReader', {
      writable: true,
      configurable: true,
      value: MockFileReader,
    })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByText('Archivo cargado: project.md')).toBeInTheDocument()
    })

    // Restore
    Object.defineProperty(globalThis, 'FileReader', {
      writable: true,
      configurable: true,
      value: originalFileReader,
    })
  })

  it('renders slug input field in the create form', async () => {
    render(<AdminProjects />)

    await waitFor(() => {
      expect(screen.getByText('Admin Test Project')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /nuevo proyecto/i }))

    const slugInput = screen.getByPlaceholderText('mi-proyecto')
    expect(slugInput).toBeInTheDocument()
    expect(slugInput).toHaveAttribute('type', 'text')
  })
})

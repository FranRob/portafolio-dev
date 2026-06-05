import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ProjectCard from '../ProjectCard'
import type { Project } from '../../../services/api'

const MOCK_PROJECT: Project = {
  id: 'proj-card-1',
  title: 'Portfolio Project',
  description: 'A portfolio project for testing',
  stack: ['React', 'TypeScript', 'Node.js'],
  status: 'completed',
  category: 'personal',
  featured: true,
  order: 0,
  slug: 'portfolio-project',
  repoUrl: null,
  demoUrl: null,
  imageUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderCard(project: Project = MOCK_PROJECT, index = 0) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} index={index} />
    </MemoryRouter>,
  )
}

describe('ProjectCard', () => {
  it('renders a link with href /proyectos/:slug', () => {
    renderCard()

    const link = screen.getByRole('link', { name: /ver detalles de portfolio project/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/proyectos/portfolio-project')
  })

  it('renders the project title', () => {
    renderCard()

    expect(screen.getByText('Portfolio Project')).toBeInTheDocument()
  })

  it('renders stack pills for each technology', () => {
    renderCard()

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('renders status badge with correct label for completed project', () => {
    renderCard()

    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('renders status badge with "En desarrollo" for in_progress', () => {
    renderCard({ ...MOCK_PROJECT, status: 'in_progress' })

    expect(screen.getByText('En desarrollo')).toBeInTheDocument()
  })

  it('renders "Ver detalles" hint text', () => {
    renderCard()

    expect(screen.getByText(/Ver detalles/)).toBeInTheDocument()
  })

  it('does not render any demo or repo link buttons', () => {
    renderCard()

    // Card should not have these buttons — navigation goes to detail page
    expect(screen.queryByRole('link', { name: /demo/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/github/i)).not.toBeInTheDocument()
  })

  it('renders image placeholder with initials when imageUrl is null', () => {
    // Initials of "Portfolio Project" → "PP"
    renderCard()

    expect(screen.getByText('PP')).toBeInTheDocument()
  })

  it('renders img element when imageUrl is provided', () => {
    renderCard({ ...MOCK_PROJECT, imageUrl: 'https://example.com/img.png' })

    const img = screen.getByRole('img', { name: 'Portfolio Project' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/img.png')
  })

  it('uses different slug for different project', () => {
    renderCard({ ...MOCK_PROJECT, slug: 'another-project', title: 'Another Project' })

    const link = screen.getByRole('link', { name: /ver detalles de another project/i })
    expect(link).toHaveAttribute('href', '/proyectos/another-project')
  })
})

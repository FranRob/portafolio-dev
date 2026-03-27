import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getProjects, createProject, updateProject, deleteProject } from '../../services/api'
import type { Project, ProjectPayload } from '../../services/api'

type EditMode = null | 'new' | Project

interface FormState extends ProjectPayload {
  stackInput: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  stackInput: '',
  stack: [],
  status: 'in_progress',
  category: 'personal',
  featured: false,
  order: 0,
  repoUrl: null,
  demoUrl: null,
  imageUrl: null,
}

const statusLabels: Record<Project['status'], string> = {
  in_progress: 'En desarrollo',
  completed: 'Live',
  private: 'Próximamente',
}

const statusColors: Record<Project['status'], string> = {
  in_progress: '#b026ff',
  completed: '#00e5ff',
  private: '#4a4a5a',
}

const categoryLabels: Record<Project['category'], string> = {
  freelance: 'Freelance',
  personal: 'Personal',
  collaborative: 'Colaborativo',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  background: '#0d0d16',
  border: '1px solid #1e1e2e',
  borderRadius: '0.375rem',
  padding: '0.5rem 0.75rem',
  color: '#d1d5db',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: '0.25rem',
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState<EditMode>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProjects()
      setProjects(data)
    } catch {
      setError('Error al cargar los proyectos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  function openCreate() {
    setForm(emptyForm)
    setEditMode('new')
  }

  function openEdit(project: Project) {
    setForm({
      title: project.title,
      description: project.description,
      stackInput: project.stack.join(', '),
      stack: project.stack,
      status: project.status,
      category: project.category,
      featured: project.featured,
      order: project.order,
      repoUrl: project.repoUrl ?? '',
      demoUrl: project.demoUrl ?? '',
      imageUrl: project.imageUrl ?? '',
    })
    setEditMode(project)
  }

  function handleFieldChange(
    field: keyof FormState,
    value: string | boolean | number | string[] | null,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const stack = form.stackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload: ProjectPayload = {
      title: form.title,
      description: form.description,
      stack,
      status: form.status,
      category: form.category,
      featured: form.featured,
      order: form.order,
      repoUrl: form.repoUrl || null,
      demoUrl: form.demoUrl || null,
      imageUrl: form.imageUrl || null,
    }

    try {
      if (editMode === 'new') {
        await createProject(payload)
      } else if (editMode !== null) {
        await updateProject((editMode as Project).id, payload)
      }
      await fetchProjects()
      setEditMode(null)
    } catch {
      setError('Error al guardar el proyecto.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminás este proyecto?')) return
    setError('')
    try {
      await deleteProject(id)
      await fetchProjects()
    } catch {
      setError('Error al eliminar el proyecto.')
    }
  }

  async function handleReorder(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= projects.length) return

    const aOrder = projects[index].order
    const bOrder = projects[swapIndex].order

    try {
      await Promise.all([
        updateProject(projects[index].id, { order: bOrder }),
        updateProject(projects[swapIndex].id, { order: aOrder }),
      ])
      await fetchProjects()
    } catch {
      setError('Error al reordenar los proyectos.')
    }
  }

  // ---- Form view ----
  if (editMode !== null) {
    const isNew = editMode === 'new'
    const editTitle = isNew ? 'Nuevo Proyecto' : `Editar: ${(editMode as Project).title}`

    return (
      <div>
        {/* Form header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron font-bold text-sm text-white">{editTitle}</h2>
          <button
            onClick={() => setEditMode(null)}
            className="font-mono text-xs text-gray-400 hover:text-white transition-colors px-3 py-2 rounded"
            style={{ border: '1px solid #1e1e2e', background: '#12121a' }}
          >
            Cancelar
          </button>
        </div>

        {error && (
          <div
            className="rounded-lg px-4 py-3 font-mono text-sm mb-4"
            style={{
              background: 'rgba(255,85,85,0.1)',
              border: '1px solid rgba(255,85,85,0.3)',
              color: '#ff5555',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label style={labelStyle}>Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              required
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Stack */}
          <div>
            <label style={labelStyle}>Stack (separado por comas)</label>
            <input
              type="text"
              value={form.stackInput}
              onChange={(e) => handleFieldChange('stackInput', e.target.value)}
              placeholder="React, TypeScript, Node.js, PostgreSQL"
              style={inputStyle}
            />
          </div>

          {/* Status + Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Estado</label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleFieldChange('status', e.target.value as Project['status'])
                }
                style={inputStyle}
              >
                <option value="in_progress">En desarrollo</option>
                <option value="completed">Live</option>
                <option value="private">Próximamente</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select
                value={form.category}
                onChange={(e) =>
                  handleFieldChange('category', e.target.value as Project['category'])
                }
                style={inputStyle}
              >
                <option value="freelance">Freelance</option>
                <option value="personal">Personal</option>
                <option value="collaborative">Colaborativo</option>
              </select>
            </div>
          </div>

          {/* Featured + Order row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured ?? false}
                onChange={(e) => handleFieldChange('featured', e.target.checked)}
                style={{ accentColor: '#b026ff' }}
              />
              <label
                htmlFor="featured"
                style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}
              >
                Destacado
              </label>
            </div>
            <div>
              <label style={labelStyle}>Orden</label>
              <input
                type="number"
                min={0}
                value={form.order ?? 0}
                onChange={(e) => handleFieldChange('order', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>

          {/* URLs */}
          <div>
            <label style={labelStyle}>URL del repositorio (opcional)</label>
            <input
              type="text"
              value={form.repoUrl ?? ''}
              onChange={(e) => handleFieldChange('repoUrl', e.target.value)}
              placeholder="https://github.com/..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>URL del demo (opcional)</label>
            <input
              type="text"
              value={form.demoUrl ?? ''}
              onChange={(e) => handleFieldChange('demoUrl', e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>URL de imagen (opcional)</label>
            <input
              type="text"
              value={form.imageUrl ?? ''}
              onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="font-mono text-xs px-5 py-2 rounded transition-all"
              style={{
                background: saving ? 'rgba(176,38,255,0.1)' : 'rgba(176,38,255,0.15)',
                border: '1px solid rgba(176,38,255,0.4)',
                color: '#b026ff',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(null)}
              className="font-mono text-xs text-gray-400 hover:text-white transition-colors px-4 py-2 rounded"
              style={{ border: '1px solid #1e1e2e', background: '#12121a' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ---- List view ----
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron font-bold text-sm text-white">Proyectos</h2>
        <button
          onClick={openCreate}
          className="font-mono text-xs px-4 py-2 rounded transition-all"
          style={{
            border: '1px solid rgba(0,229,255,0.4)',
            color: '#00e5ff',
            background: 'rgba(0,229,255,0.05)',
          }}
        >
          + Nuevo Proyecto
        </button>
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 font-mono text-sm mb-4"
          style={{
            background: 'rgba(255,85,85,0.1)',
            border: '1px solid rgba(255,85,85,0.3)',
            color: '#ff5555',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            className="w-6 h-6 border-2 rounded-full"
            style={{ borderColor: '#b026ff', borderTopColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span className="font-mono text-sm text-gray-500 ml-3">Cargando...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <p className="font-mono text-xs text-gray-600 mb-4">
            Sin proyectos todavía. Creá el primero.
          </p>
          <button
            onClick={openCreate}
            className="font-mono text-xs px-4 py-2 rounded"
            style={{
              border: '1px solid rgba(0,229,255,0.4)',
              color: '#00e5ff',
              background: 'rgba(0,229,255,0.05)',
            }}
          >
            + Nuevo Proyecto
          </button>
        </div>
      )}

      {/* Project list */}
      {!loading && projects.length > 0 && (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid #1e1e2e', background: '#12121a' }}
        >
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3"
              style={{ borderBottom: index < projects.length - 1 ? '1px solid #1e1e2e' : 'none' }}
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                  className="font-mono text-xs px-1 transition-colors"
                  style={{ color: index === 0 ? '#2a2a3a' : '#666', cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                  title="Mover arriba"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === projects.length - 1}
                  className="font-mono text-xs px-1 transition-colors"
                  style={{
                    color: index === projects.length - 1 ? '#2a2a3a' : '#666',
                    cursor: index === projects.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                  title="Mover abajo"
                >
                  ▼
                </button>
              </div>

              {/* Title */}
              <span className="font-orbitron text-xs text-white flex-1 truncate">
                {project.title}
              </span>

              {/* Status badge */}
              <span
                className="font-mono text-xs px-2 py-0.5 rounded hidden sm:block"
                style={{
                  color: statusColors[project.status],
                  border: `1px solid ${statusColors[project.status]}`,
                  background: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {statusLabels[project.status]}
              </span>

              {/* Category badge */}
              <span
                className="font-mono text-xs px-2 py-0.5 rounded hidden md:block"
                style={{
                  color: '#888',
                  border: '1px solid #2a2a3a',
                  whiteSpace: 'nowrap',
                }}
              >
                {categoryLabels[project.category]}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(project)}
                  className="font-mono text-xs px-3 py-1 rounded transition-colors"
                  style={{
                    border: '1px solid rgba(176,38,255,0.3)',
                    color: '#b026ff',
                    background: 'transparent',
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="font-mono text-xs px-3 py-1 rounded transition-colors"
                  style={{
                    border: '1px solid rgba(255,85,85,0.3)',
                    color: '#ff5555',
                    background: 'transparent',
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { getProjects, createProject, updateProject, deleteProject } from '../../services/api'
import type { Project, ProjectPayload } from '../../services/api'
import { ProjectsSkeleton } from './AdminSkeleton'
import { ConfirmModal } from './ConfirmModal'

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
  in_progress: 'var(--status-in-progress)',
  completed: 'var(--status-completed)',
  private: 'var(--status-private)',
}

const categoryLabels: Record<Project['category'], string> = {
  freelance: 'Freelance',
  personal: 'Personal',
  collaborative: 'Colaborativo',
}

const inputClass = "w-full font-mono text-sm bg-dark-card border border-dark-border rounded-md px-3 py-2 text-gray-300 focus:border-neon-purple focus:shadow-[0_0_10px_var(--input-focus-shadow)] outline-none transition-[border-color,box-shadow]"
const labelClass = "font-mono text-xs text-gray-500 uppercase tracking-wider block mb-1"

function isValidUrl(str: string): boolean {
  if (!str || !str.trim()) return true // optional field
  try {
    const url = new URL(str.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState<EditMode>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
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

    // Validate stack before sending
    const stack = form.stackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (stack.length === 0) {
      setError('Agregá al menos una tecnología en el campo Stack.')
      setSaving(false)
      return
    }

    if (!isValidUrl(form.repoUrl ?? '')) {
      setError('La URL del repositorio no es válida.')
      setSaving(false)
      return
    }
    if (!isValidUrl(form.demoUrl ?? '')) {
      setError('La URL del demo no es válida.')
      setSaving(false)
      return
    }
    if (!isValidUrl(form.imageUrl ?? '')) {
      setError('La URL de la imagen no es válida.')
      setSaving(false)
      return
    }

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el proyecto.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
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
      // Sequential to avoid partial state corruption
      await updateProject(projects[index].id, { order: bOrder })
      await updateProject(projects[swapIndex].id, { order: aOrder })
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
            className="font-mono text-xs text-gray-400 hover:text-white transition-colors px-3 py-2 rounded min-h-[44px] bg-dark-card border border-dark-border"
          >
            Cancelar
          </button>
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 font-mono text-sm mb-4 bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Título <span className="text-neon-purple">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Descripción <span className="text-neon-purple">*</span></label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              required
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Stack */}
          <div>
            <label className={labelClass}>Stack (separado por comas) <span className="text-neon-purple">*</span></label>
            <input
              type="text"
              value={form.stackInput}
              onChange={(e) => handleFieldChange('stackInput', e.target.value)}
              placeholder="React, TypeScript, Node.js, PostgreSQL"
              className={inputClass}
            />
          </div>

          {/* Status + Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estado</label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleFieldChange('status', e.target.value as Project['status'])
                }
                className={inputClass}
              >
                <option value="in_progress">En desarrollo</option>
                <option value="completed">Live</option>
                <option value="private">Próximamente</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select
                value={form.category}
                onChange={(e) =>
                  handleFieldChange('category', e.target.value as Project['category'])
                }
                className={inputClass}
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
                className="accent-neon-purple"
              />
              <label
                htmlFor="featured"
                className={`${labelClass} mb-0 cursor-pointer`}
              >
                Destacado
              </label>
            </div>
            <div>
              <label className={labelClass}>Orden</label>
              <input
                type="number"
                min={0}
                value={form.order ?? 0}
                onChange={(e) => handleFieldChange('order', Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          {/* URLs */}
          <div>
            <label className={labelClass}>URL del repositorio (opcional)</label>
            <input
              type="text"
              value={form.repoUrl ?? ''}
              onChange={(e) => handleFieldChange('repoUrl', e.target.value)}
              placeholder="https://github.com/..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>URL del demo (opcional)</label>
            <input
              type="text"
              value={form.demoUrl ?? ''}
              onChange={(e) => handleFieldChange('demoUrl', e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>URL de imagen (opcional)</label>
            <input
              type="text"
              value={form.imageUrl ?? ''}
              onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="font-mono text-xs px-5 py-2 rounded transition-all min-h-[44px] border border-neon-purple/40 text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/20 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(null)}
              className="font-mono text-xs text-gray-400 hover:text-white transition-colors px-4 py-2 rounded min-h-[44px] bg-dark-card border border-dark-border"
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
          className="font-mono text-xs px-4 py-2 rounded transition-all min-h-[44px] border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/[0.05] hover:bg-neon-cyan/10"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 font-mono text-sm mb-4 bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && <ProjectsSkeleton />}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <p className="font-mono text-xs text-gray-600 mb-4">
            Sin proyectos todavía. Creá el primero.
          </p>
          <button
            onClick={openCreate}
            className="font-mono text-xs px-4 py-2 rounded min-h-[44px] border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/[0.05]"
          >
            + Nuevo Proyecto
          </button>
        </div>
      )}

      {/* Project list */}
      {!loading && projects.length > 0 && (
        <div className="rounded-lg overflow-hidden border border-dark-border bg-dark-card">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-3 sm:py-4 ${index < projects.length - 1 ? 'border-b border-dark-border' : ''}`}
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                   className={`flex items-center justify-center p-1 transition-colors min-h-[32px] min-w-[32px] ${index === 0 ? 'text-[var(--disabled-text)] cursor-not-allowed' : 'text-gray-500 hover:text-gray-300'}`}
                  aria-label={`Mover ${project.title} arriba`}
                  title="Mover arriba"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === projects.length - 1}
                   className={`flex items-center justify-center p-1 transition-colors min-h-[32px] min-w-[32px] ${index === projects.length - 1 ? 'text-[var(--disabled-text)] cursor-not-allowed' : 'text-gray-500 hover:text-gray-300'}`}
                  aria-label={`Mover ${project.title} abajo`}
                  title="Mover abajo"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Title */}
              <span className="font-orbitron text-xs text-white flex-1 truncate">
                {project.title}
              </span>

              {/* Status badge */}
              <span
                className="font-mono text-xs px-2 py-0.5 rounded hidden sm:block bg-transparent whitespace-nowrap"
                style={{
                  color: statusColors[project.status],
                  border: `1px solid ${statusColors[project.status]}`,
                }}
              >
                {statusLabels[project.status]}
              </span>

              {/* Category badge */}
              <span
                className="font-mono text-xs px-2 py-0.5 rounded hidden md:block whitespace-nowrap text-gray-500 border border-dark-border"
              >
                {categoryLabels[project.category]}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(project)}
                  className="font-mono text-xs px-3 py-2 rounded transition-colors min-h-[44px] border border-neon-purple/30 text-neon-purple bg-transparent hover:bg-neon-purple/10"
                  aria-label={`Editar proyecto ${project.title}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => setProjectToDelete(project)}
                  className="font-mono text-xs px-3 py-2 rounded transition-colors min-h-[44px] border border-red-500/30 text-red-400 bg-transparent hover:bg-red-500/10"
                  aria-label={`Eliminar proyecto ${project.title}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={projectToDelete !== null}
        title="Eliminar proyecto"
        message={`¿Estás seguro que querés eliminar "${projectToDelete?.title ?? ''}"? No se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (projectToDelete) handleDelete(projectToDelete.id)
          setProjectToDelete(null)
        }}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  )
}

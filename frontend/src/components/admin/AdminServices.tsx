import { useState, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { getServices, createService, updateService, deleteService } from '../../services/api'
import type { Service, ServicePayload } from '../../services/api'
import { ServicesSkeleton } from './AdminSkeleton'
import { ConfirmModal } from './ConfirmModal'

type EditMode = null | 'new' | Service

interface FormState extends ServicePayload {
  stackInput: string
  deliverablesInput: string
  mdFileName: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  tagline: null,
  iconName: null,
  imageUrl: null,
  stackInput: '',
  stack: [],
  deliverablesInput: '',
  deliverables: [],
  estimatedTimeline: null,
  priceRange: null,
  isActive: true,
  featured: false,
  order: 0,
  content: null,
  mdFileName: '',
}

const inputClass = "w-full font-mono text-sm bg-dark-card border border-dark-border rounded-md px-3 py-2 text-gray-300 focus:border-neon-purple focus:shadow-[0_0_10px_var(--input-focus-shadow)] outline-hidden transition-[border-color,box-shadow]"
const labelClass = "font-mono text-xs text-gray-500 uppercase tracking-wider block mb-1"

function isValidUrl(str: string): boolean {
  if (!str || !str.trim()) return true
  try {
    const url = new URL(str.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState<EditMode>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getServices()
      setServices(data)
    } catch {
      setError('Error al cargar los servicios.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  function openCreate() {
    setForm(emptyForm)
    setEditMode('new')
  }

  function openEdit(service: Service) {
    setForm({
      title: service.title,
      description: service.description,
      tagline: service.tagline ?? null,
      iconName: service.iconName ?? null,
      imageUrl: service.imageUrl ?? '',
      stackInput: service.stack.join(', '),
      stack: service.stack,
      deliverablesInput: service.deliverables.join(', '),
      deliverables: service.deliverables,
      estimatedTimeline: service.estimatedTimeline ?? null,
      priceRange: service.priceRange ?? null,
      isActive: service.isActive,
      featured: service.featured,
      order: service.order,
      content: null,
      mdFileName: '',
    })
    setEditMode(service)
  }

  function handleFieldChange(
    field: keyof FormState,
    value: string | boolean | number | string[] | null,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleMdFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setForm((prev) => ({ ...prev, content: text, mdFileName: file.name }))
    }
    reader.onerror = () => {
      setError('No se pudo leer el archivo. Intentá de nuevo.')
    }
    reader.readAsText(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const stack = form.stackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (stack.length === 0) {
      setError('Agregá al menos una tecnología en el campo Stack.')
      setSaving(false)
      return
    }

    if (!isValidUrl(form.imageUrl ?? '')) {
      setError('La URL de la imagen no es válida.')
      setSaving(false)
      return
    }

    const deliverables = form.deliverablesInput
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)

    const payload: ServicePayload = {
      title: form.title,
      description: form.description,
      tagline: form.tagline || null,
      iconName: form.iconName || null,
      imageUrl: form.imageUrl || null,
      stack,
      deliverables,
      estimatedTimeline: form.estimatedTimeline || null,
      priceRange: form.priceRange || null,
      isActive: form.isActive ?? true,
      featured: form.featured ?? false,
      order: form.order ?? 0,
      ...(form.content !== null ? { content: form.content } : {}),
    }

    try {
      if (editMode === 'new') {
        await createService(payload)
      } else if (editMode !== null) {
        await updateService((editMode as Service).id, payload)
      }
      await fetchServices()
      setEditMode(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el servicio.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError('')
    try {
      await deleteService(id)
      await fetchServices()
    } catch {
      setError('Error al eliminar el servicio.')
    }
  }

  async function handleReorder(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= services.length) return

    const aOrder = services[index].order
    const bOrder = services[swapIndex].order

    try {
      await updateService(services[index].id, { order: bOrder })
      await updateService(services[swapIndex].id, { order: aOrder })
      await fetchServices()
    } catch {
      setError('Error al reordenar los servicios.')
    }
  }

  // ---- Form view ----
  if (editMode !== null) {
    const isNew = editMode === 'new'
    const editTitle = isNew ? 'Nuevo Servicio' : `Editar: ${(editMode as Service).title}`

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron font-bold text-sm text-white">{editTitle}</h2>
          <button
            onClick={() => setEditMode(null)}
            className="cursor-pointer font-mono text-xs text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-sm min-h-[44px] bg-dark-card border border-dark-border"
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

          <div>
            <label className={labelClass}>Tagline (opcional)</label>
            <input
              type="text"
              value={form.tagline ?? ''}
              onChange={(e) => handleFieldChange('tagline', e.target.value)}
              placeholder="Frase corta que resume el servicio"
              className={inputClass}
            />
          </div>

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

          <div>
            <label className={labelClass}>Ícono (nombre Lucide, opcional)</label>
            <input
              type="text"
              value={form.iconName ?? ''}
              onChange={(e) => handleFieldChange('iconName', e.target.value)}
              placeholder="LayoutDashboard, Globe, Zap, Code2..."
              className={inputClass}
            />
            <p className="font-mono text-xs text-gray-600 mt-1">
              Opciones disponibles: LayoutDashboard, Globe, Zap, Code2, Smartphone, ShoppingCart, Database
            </p>
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

          <div>
            <label className={labelClass}>Stack (separado por comas) <span className="text-neon-purple">*</span></label>
            <input
              type="text"
              value={form.stackInput}
              onChange={(e) => handleFieldChange('stackInput', e.target.value)}
              placeholder="React, Node.js, PostgreSQL"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Entregables (separado por comas, opcional)</label>
            <input
              type="text"
              value={form.deliverablesInput}
              onChange={(e) => handleFieldChange('deliverablesInput', e.target.value)}
              placeholder="Diseño responsivo, Panel de admin, Deploy"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tiempo estimado (opcional)</label>
              <input
                type="text"
                value={form.estimatedTimeline ?? ''}
                onChange={(e) => handleFieldChange('estimatedTimeline', e.target.value)}
                placeholder="2-4 semanas"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Rango de precio (opcional)</label>
              <input
                type="text"
                value={form.priceRange ?? ''}
                onChange={(e) => handleFieldChange('priceRange', e.target.value)}
                placeholder="Desde USD 500"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="svc-isActive"
                checked={form.isActive ?? true}
                onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                className="accent-neon-cyan"
              />
              <label htmlFor="svc-isActive" className={`${labelClass} mb-0 cursor-pointer`}>
                Activo
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="svc-featured"
                checked={form.featured ?? false}
                onChange={(e) => handleFieldChange('featured', e.target.checked)}
                className="accent-neon-purple"
              />
              <label htmlFor="svc-featured" className={`${labelClass} mb-0 cursor-pointer`}>
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

          <div>
            <label className={labelClass}>Contenido detallado (.md)</label>
            <label
              className="cursor-pointer flex items-center gap-3 w-full font-mono text-sm bg-dark-card border border-dark-border rounded-md px-3 py-2 text-gray-400 hover:border-neon-purple/50 transition-colors min-h-[44px]"
              aria-label="Subir archivo Markdown con contenido detallado del servicio"
            >
              <span className="text-neon-cyan text-xs shrink-0">Elegir archivo</span>
              <span className="text-gray-500 text-xs truncate">
                {form.mdFileName || 'Ningún archivo seleccionado'}
              </span>
              <input
                type="file"
                accept=".md"
                onChange={handleMdFile}
                className="sr-only"
                aria-label="Archivo Markdown para contenido del servicio"
              />
            </label>
            {form.mdFileName && (
              <p className="font-mono text-xs text-neon-cyan mt-1">
                Archivo cargado: {form.mdFileName}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer font-mono text-xs px-5 py-2 rounded-sm transition-all min-h-[44px] border border-neon-purple/40 text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(null)}
              className="cursor-pointer font-mono text-xs text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-sm min-h-[44px] bg-dark-card border border-dark-border"
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron font-bold text-sm text-white">Servicios</h2>
        <button
          onClick={openCreate}
          className="cursor-pointer font-mono text-xs px-4 py-2 rounded-sm transition-all min-h-[44px] border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/5 hover:bg-neon-cyan/10"
        >
          + Nuevo Servicio
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 font-mono text-sm mb-4 bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {loading && <ServicesSkeleton />}

      {!loading && services.length === 0 && (
        <div className="text-center py-12">
          <p className="font-mono text-xs text-gray-600 mb-4">
            Sin servicios todavía. Creá el primero.
          </p>
          <button
            onClick={openCreate}
            className="cursor-pointer font-mono text-xs px-4 py-2 rounded-sm min-h-[44px] border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/5"
          >
            + Nuevo Servicio
          </button>
        </div>
      )}

      {!loading && services.length > 0 && (
        <div className="rounded-lg overflow-hidden border border-dark-border bg-dark-card">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-3 sm:py-4 ${index < services.length - 1 ? 'border-b border-dark-border' : ''}`}
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                  className={`flex items-center justify-center p-1 transition-colors min-h-[32px] min-w-[32px] ${index === 0 ? 'text-(--disabled-text) cursor-not-allowed' : 'cursor-pointer text-gray-500 hover:text-gray-300'}`}
                  aria-label={`Mover ${service.title} arriba`}
                  title="Mover arriba"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === services.length - 1}
                  className={`flex items-center justify-center p-1 transition-colors min-h-[32px] min-w-[32px] ${index === services.length - 1 ? 'text-(--disabled-text) cursor-not-allowed' : 'cursor-pointer text-gray-500 hover:text-gray-300'}`}
                  aria-label={`Mover ${service.title} abajo`}
                  title="Mover abajo"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <span className="font-orbitron text-xs text-white flex-1 truncate">
                {service.title}
              </span>

              <span
                className="font-mono text-xs px-2 py-0.5 rounded-sm hidden sm:block whitespace-nowrap"
                style={{
                  color: service.isActive ? 'var(--status-completed)' : 'var(--status-private)',
                  border: `1px solid ${service.isActive ? 'var(--status-completed)' : 'var(--status-private)'}`,
                }}
              >
                {service.isActive ? 'Activo' : 'Inactivo'}
              </span>

              {service.featured && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-sm hidden md:block whitespace-nowrap text-neon-purple border border-neon-purple/40">
                  Destacado
                </span>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(service)}
                  className="cursor-pointer font-mono text-xs px-3 py-2 rounded-sm transition-colors min-h-[44px] border border-neon-purple/30 text-neon-purple bg-transparent hover:bg-neon-purple/10"
                  aria-label={`Editar servicio ${service.title}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => setServiceToDelete(service)}
                  className="cursor-pointer font-mono text-xs px-3 py-2 rounded-sm transition-colors min-h-[44px] border border-red-500/30 text-red-400 bg-transparent hover:bg-red-500/10"
                  aria-label={`Eliminar servicio ${service.title}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={serviceToDelete !== null}
        title="Eliminar servicio"
        message={`¿Estás seguro que querés eliminar "${serviceToDelete?.title ?? ''}"? No se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (serviceToDelete) handleDelete(serviceToDelete.id)
          setServiceToDelete(null)
        }}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  )
}

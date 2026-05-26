import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Clock,
  ChevronRight,
  Trash2,
  Move,
  Plus,
  X,
  AlertCircle as AlertCircleIcon,
} from 'lucide-react'
import {
  getMessages,
  markMessageRead,
  markMessageUnread,
  moveMessage,
  deleteMessage,
} from '../../services/api'
import type { ContactMessage } from '../../services/api'
import { MessagesSkeleton } from './AdminSkeleton'
import { ConfirmModal } from './ConfirmModal'

type TabType = 'no-leido' | 'leido' | string

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('no-leido')
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Modal state: null | 'delete-message' | 'delete-category'
  const [modal, setModal] = useState<{ type: 'delete-message'; msg: ContactMessage } | { type: 'delete-category'; category: string } | null>(null)
  // Persist custom categories independent of messages array
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('admin_custom_categories')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000)
      return () => clearTimeout(t)
    }
  }, [error])
  
  const defaultTabs: TabType[] = ['no-leido', 'leido']

  // Merge persisted custom categories with those found in messages
  const messageCategories = Array.from(
    new Set(messages.map((m) => m.category || 'leido').filter(Boolean))
  ).filter(c => !defaultTabs.includes(c))

  const allCategoryTabs = Array.from(new Set([...customCategories, ...messageCategories]))

  useEffect(() => {
    setLoading(true)
    getMessages()
      .then(setMessages)
      .finally(() => setLoading(false))
  }, [])

  // Filter messages by active tab
  const filteredMessages = messages.filter((msg) => {
    if (activeTab === 'no-leido') return !msg.read || msg.category === 'no-leido'
    if (activeTab === 'leido') return msg.read && msg.category !== 'no-leido'
    return msg.category === activeTab
  })

  // Unread count
  const unreadCount = messages.filter((m) => !m.read).length

  async function handleMarkRead(msg: ContactMessage) {
    if (msg.read) return
    try {
      await markMessageRead(msg.id)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true, category: 'leido' } : m))
      )
    } catch (err) {
      console.error('Failed to mark read:', err)
      setError('Error al marcar como leído')
    }
  }

  async function handleMarkUnread(msg: ContactMessage) {
    try {
      await markMessageUnread(msg.id)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: false, category: 'no-leido' } : m))
      )
    } catch (err) {
      console.error('Failed to mark unread:', err)
      setError('Error al marcar como no leído')
    }
  }

  async function handleMove(msg: ContactMessage, category: string) {
    try {
      await moveMessage(msg.id, category)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, category } : m))
      )
      setShowMoveMenu(null)
    } catch (err) {
      console.error('Failed to move message:', err)
      setError('Error al mover el mensaje')
    }
  }

  async function handleDelete(msg: ContactMessage) {
    try {
      await deleteMessage(msg.id)
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(null)
      }
    } catch (err) {
      console.error('Failed to delete message:', err)
      setError('Error al eliminar el mensaje')
    }
  }

  async function handleCreateCategory() {
    const cat = newCategory.trim()
    if (!cat) return
    setNewCategory('') // <-- limpiar para la próxima
    setShowNewCategory(false)
    // Persist to state + sessionStorage so it survives tab switches
    setCustomCategories(prev => {
      if (prev.includes(cat)) return prev
      const updated = [...prev, cat]
      sessionStorage.setItem('admin_custom_categories', JSON.stringify(updated))
      return updated
    })
    setActiveTab(cat)
  }

  function handleDeleteCategory(cat: string) {
    setCustomCategories(prev => {
      const updated = prev.filter(c => c !== cat)
      sessionStorage.setItem('admin_custom_categories', JSON.stringify(updated))
      return updated
    })
    // Si estábamos viendo esa categoría, volver a no-leido
    if (activeTab === cat) {
      setActiveTab('no-leido')
    }
  }

  return (
    <div className="min-h-screen bg-dark-base text-gray-300">
      {/* Sub-tabs */}
      <div className="sticky top-16 z-30 flex border-b overflow-x-auto bg-dark-base/95 border-dark-border">
        {[...defaultTabs, ...allCategoryTabs].map((tab) => {
          const isCustom = !defaultTabs.includes(tab)
          return (
            <div key={tab} className="flex items-center shrink-0">
              <button
                onClick={() => setActiveTab(tab)}
                className={`font-mono text-xs px-4 py-3 whitespace-nowrap transition-colors min-h-[44px] ${
                  activeTab === tab ? 'text-neon-purple border-b-2 border-neon-purple' : 'text-gray-500'
                }`}
              >
                {tab === 'no-leido' ? `No leídos${unreadCount > 0 ? ` (${unreadCount})` : ''}` : 
                  tab === 'leido' ? 'Leídos' : tab}
              </button>
              {isCustom && (
                <button
                  onClick={() => setModal({ type: 'delete-category', category: tab })}
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Eliminar categoría ${tab}`}
                  title={`Eliminar ${tab}`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )
        })}
        
        {/* Add new category button */}
        {showNewCategory ? (
          <div className="flex items-center gap-1 px-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              placeholder="Nombre..."
              className="font-mono text-xs bg-transparent border-b border-gray-600 px-2 py-2 outline-none text-gray-300 w-24"
              autoFocus
            />
            <button onClick={handleCreateCategory} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-white">
              <Plus size={14} />
            </button>
            <button onClick={() => { setShowNewCategory(false); setNewCategory('') }} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-white">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewCategory(true)}
            className="flex items-center gap-1 font-mono text-xs px-4 py-3 text-gray-500 hover:text-white transition-colors min-h-[44px]"
          >
            <Plus size={12} />
            Agregar
          </button>
        )}
      </div>

      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="rounded-lg px-4 py-3 font-mono text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertCircleIcon size={14} />
            {error}
          </div>
        </div>
      )}

      {/* Messages list */}
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <MessagesSkeleton />
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-mono text-sm text-gray-600">No hay mensajes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg overflow-hidden bg-dark-card border border-dark-border"
              >
                  <button
                    className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                    onClick={() => {
                      // Mark as read ONLY when collapsing the message, not when opening
                      if (selectedMessage?.id === msg.id && !msg.read) {
                        handleMarkRead(msg)
                      }
                      setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)
                    }}
                  >
                  <div className="flex-shrink-0 mt-1">
                    {msg.read ? (
                      <CheckCircle size={16} className="text-gray-600" />
                    ) : (
                      <Clock size={16} className="text-neon-cyan" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-sm font-bold ${msg.read ? 'text-gray-500' : 'text-gray-300'}`}>
                        {msg.name}
                      </span>
                      <span className="font-mono text-xs text-gray-600 truncate">
                        {msg.email}
                      </span>
                      <span className="font-mono text-xs text-gray-600 ml-auto">
                        {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <p className={`font-mono text-xs truncate ${msg.read ? 'text-gray-600' : 'text-gray-500'}`}>
                      {msg.message}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className={`flex-shrink-0 mt-1 text-gray-600 transition-transform ${
                      selectedMessage?.id === msg.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Expanded message with actions */}
                {selectedMessage?.id === msg.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 pb-4 pl-10"
                  >
                    <div
                      className="rounded-lg p-4 mb-3 bg-dark-card/50 border border-neon-purple/20"
                    >
                      <p className="font-mono text-xs text-gray-500 mb-1">{msg.email}</p>
                      <p className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>

                    {/* Actions bar */}
                    <div className="flex gap-2 flex-wrap">
                      {/* Toggle read/unread */}
                      {msg.read ? (
                        <button
                          onClick={() => handleMarkUnread(msg)}
                          className="flex items-center gap-1 px-3 py-2 rounded font-mono text-xs bg-dark-border text-gray-400 min-h-[44px]"
                          aria-label="Marcar como no leído"
                        >
                          <Clock size={12} />
                          Marcar no leído
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkRead(msg)}
                          className="flex items-center gap-1 px-3 py-2 rounded font-mono text-xs bg-dark-border text-neon-cyan min-h-[44px]"
                          aria-label="Marcar como leído"
                        >
                          <CheckCircle size={12} />
                          Marcar leído
                        </button>
                      )}

                      {/* Move to category */}
                      <div className="relative">
                        <button
                          onClick={() => setShowMoveMenu(showMoveMenu === msg.id ? null : msg.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded font-mono text-xs bg-dark-border text-gray-400 min-h-[44px]"
                          aria-label="Mover mensaje a otra categoría"
                        >
                          <Move size={12} />
                          Mover a...
                        </button>
                        
                        {showMoveMenu === msg.id && (
                          <div
                            className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-10 bg-dark-border border border-gray-700"
                          >
                            {[...defaultTabs, ...allCategoryTabs]
                              .filter((c) => c !== msg.category)
                              .map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => handleMove(msg, cat)}
                                  className="block w-full px-4 py-2 text-left font-mono text-xs hover:bg-white/5"
                                >
                                  {cat === 'no-leido' ? 'No leídos' : cat === 'leido' ? 'Leídos' : cat}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => setModal({ type: 'delete-message', msg })}
                        className="flex items-center gap-1 px-3 py-2 rounded font-mono text-xs bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 min-h-[44px]"
                        aria-label="Eliminar mensaje"
                      >
                        <Trash2 size={12} />
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm modals */}
      <ConfirmModal
        open={modal?.type === 'delete-message'}
        title="Eliminar mensaje"
        message="¿Estás seguro que querés eliminar este mensaje? No se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (modal?.type === 'delete-message') handleDelete(modal.msg)
          setModal(null)
        }}
        onCancel={() => setModal(null)}
      />

      <ConfirmModal
        open={modal?.type === 'delete-category'}
        title="Eliminar categoría"
        message="¿Estás seguro que querés eliminar esta categoría? Los mensajes no se pierden, solo se elimina el filtro."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (modal?.type === 'delete-category') handleDeleteCategory(modal.category)
          setModal(null)
        }}
        onCancel={() => setModal(null)}
      />
    </div>
  )
}
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Clock,
  ChevronRight,
  Trash2,
  Move,
  Plus,
  X,
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

type TabType = 'no-leido' | 'leido' | string

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('no-leido')
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null)

  // Get unique categories from messages
  const categories = Array.from(
    new Set(messages.map((m) => m.category || 'leido').filter(Boolean))
  )

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMessages()
      setMessages(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

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
    } catch (e) {
      console.error(e)
    }
  }

  async function handleMarkUnread(msg: ContactMessage) {
    try {
      await markMessageUnread(msg.id)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: false, category: 'no-leido' } : m))
      )
    } catch (e) {
      console.error(e)
    }
  }

  async function handleMove(msg: ContactMessage, category: string) {
    try {
      await moveMessage(msg.id, category)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, category } : m))
      )
      setShowMoveMenu(null)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete(msg: ContactMessage) {
    if (!confirm('¿Eliminar este mensaje?')) return
    try {
      await deleteMessage(msg.id)
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function handleCreateCategory() {
    if (!newCategory.trim()) return
    // The category is created automatically when a message is moved to it
    setShowNewCategory(false)
    setNewCategory('')
    setActiveTab(newCategory.trim())
  }

  const defaultTabs: TabType[] = ['no-leido', 'leido']
  const customCategories = categories.filter(c => !defaultTabs.includes(c))

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#e0e0e0' }}>
      {/* Sub-tabs */}
      <div className="sticky top-16 z-30 flex border-b overflow-x-auto" style={{ background: 'rgba(10,10,15,0.95)', borderColor: '#1e1e2e' }}>
        {[...defaultTabs, ...customCategories].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="font-mono text-xs px-4 py-3 whitespace-nowrap transition-colors"
            style={{
              color: activeTab === tab ? '#b026ff' : '#666',
              borderBottom: activeTab === tab ? '2px solid #b026ff' : '2px solid transparent',
            }}
          >
            {tab === 'no-leido' ? `No leídos${unreadCount > 0 ? ` (${unreadCount})` : ''}` : 
              tab === 'leido' ? 'Leídos' : tab}
          </button>
        ))}
        
        {/* Add new category button */}
        {showNewCategory ? (
          <div className="flex items-center gap-1 px-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              placeholder="Nombre..."
              className="font-mono text-xs bg-transparent border-b border-gray-600 px-2 py-2 outline-none"
              style={{ color: '#e0e0e0', width: '100px' }}
              autoFocus
            />
            <button onClick={handleCreateCategory} className="p-2 hover:text-white">
              <Plus size={14} />
            </button>
            <button onClick={() => setShowNewCategory(false)} className="p-2 hover:text-white">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewCategory(true)}
            className="flex items-center gap-1 font-mono text-xs px-4 py-3 text-gray-500 hover:text-white transition-colors"
          >
            <Plus size={12} />
            Agregar
          </button>
        )}
      </div>

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
                className="rounded-lg overflow-hidden"
                style={{ background: '#12121a', border: '1px solid #1e1e2e' }}
              >
                <button
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                  onClick={() => {
                    setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)
                    handleMarkRead(msg)
                  }}
                >
                  <div className="flex-shrink-0 mt-1">
                    {msg.read ? (
                      <CheckCircle size={16} style={{ color: '#4a4a5a' }} />
                    ) : (
                      <Clock size={16} style={{ color: '#00e5ff' }} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold" style={{ color: msg.read ? '#888' : '#e0e0e0' }}>
                        {msg.name}
                      </span>
                      <span className="font-mono text-xs text-gray-600 truncate">
                        {msg.email}
                      </span>
                      <span className="font-mono text-xs text-gray-600 ml-auto">
                        {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <p className="font-mono text-xs truncate" style={{ color: msg.read ? '#555' : '#888' }}>
                      {msg.message}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="flex-shrink-0 mt-1"
                    style={{
                      color: '#444',
                      transform: selectedMessage?.id === msg.id ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
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
                      className="rounded-lg p-4 mb-3"
                      style={{
                        background: 'rgba(176,38,255,0.05)',
                        border: '1px solid rgba(176,38,255,0.15)',
                      }}
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
                          className="flex items-center gap-1 px-3 py-1.5 rounded font-mono text-xs"
                          style={{ background: '#1e1e2e', color: '#888' }}
                        >
                          <Clock size={12} />
                          Marcar no leído
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkRead(msg)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded font-mono text-xs"
                          style={{ background: '#1e1e2e', color: '#00e5ff' }}
                        >
                          <CheckCircle size={12} />
                          Marcar leído
                        </button>
                      )}

                      {/* Move to category */}
                      <div className="relative">
                        <button
                          onClick={() => setShowMoveMenu(showMoveMenu === msg.id ? null : msg.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded font-mono text-xs"
                          style={{ background: '#1e1e2e', color: '#888' }}
                        >
                          <Move size={12} />
                          Mover a...
                        </button>
                        
                        {showMoveMenu === msg.id && (
                          <div
                            className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-10"
                            style={{ background: '#1e1e2e', border: '1px solid #333' }}
                          >
                            {[...defaultTabs, ...categories]
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
                        onClick={() => handleDelete(msg)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded font-mono text-xs"
                        style={{ background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.3)', color: '#ff5555' }}
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
    </div>
  )
}
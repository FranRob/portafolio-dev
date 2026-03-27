import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  Eye,
  CalendarDays,
  BarChart2,
  Mail,
  RefreshCw,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { getStats, getMessages, markMessageRead } from '../../services/api'
import type { AnalyticsStats, ContactMessage } from '../../services/api'
import AdminProjects from './AdminProjects'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  glow: string
}

function StatCard({ label, value, icon, color, glow }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg p-3 sm:p-5"
      style={{
        background: '#12121a',
        border: `1px solid ${color}`,
        boxShadow: `0 0 10px ${glow}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-gray-500 mb-2 uppercase tracking-wider">{label}</p>
          <p
            className="font-orbitron font-bold text-xl sm:text-2xl"
            style={{ color, textShadow: `0 0 10px ${glow}` }}
          >
            {value}
          </p>
        </div>
        <span style={{ color, opacity: 0.6 }}>{icon}</span>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'metrics' | 'projects'>('metrics')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsData, messagesData] = await Promise.all([getStats(), getMessages()])
      setStats(statsData)
      setMessages(messagesData)
    } catch {
      setError('Error al cargar los datos. Verificá tu conexión.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleMarkRead(msg: ContactMessage) {
    if (msg.read) return
    try {
      await markMessageRead(msg.id)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)),
      )
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...msg, read: true })
      }
      if (stats) {
        setStats({ ...stats, unreadMessages: Math.max(0, stats.unreadMessages - 1) })
      }
    } catch {
      // silently fail
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  const sectionNames = stats ? Object.keys(stats.sectionViews) : []
  const maxSectionViews = stats
    ? Math.max(...Object.values(stats.sectionViews), 1)
    : 1

  const maxDaily = stats
    ? Math.max(...stats.dailyVisits.map((d) => d.count), 1)
    : 1

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0a0a0f', color: '#e0e0e0' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(10, 10, 15, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1e1e2e',
        }}
      >
        <div>
          <h1
            className="font-orbitron font-bold text-lg"
            style={{ color: '#b026ff', textShadow: '0 0 8px rgba(176,38,255,0.4)' }}
          >
            Panel de Métricas
          </h1>
          <p className="font-mono text-xs text-gray-500">divMalCentrado admin</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-white px-3 py-2 rounded transition-colors"
            style={{ border: '1px solid #1e1e2e', background: '#12121a' }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-mono text-xs px-3 py-2 rounded transition-all"
            style={{
              border: '1px solid rgba(176,38,255,0.3)',
              color: '#b026ff',
              background: 'rgba(176,38,255,0.05)',
            }}
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div
        className="sticky top-16 z-30 flex border-b"
        style={{ background: 'rgba(10,10,15,0.95)', borderColor: '#1e1e2e' }}
      >
        {(['metrics', 'projects'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="font-mono text-xs px-6 py-3 transition-colors"
            style={{
              color: activeTab === tab ? '#b026ff' : '#666',
              borderBottom: activeTab === tab ? '2px solid #b026ff' : '2px solid transparent',
            }}
          >
            {tab === 'metrics' ? 'Métricas' : 'Proyectos'}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {activeTab === 'projects' && <AdminProjects />}

        {activeTab === 'metrics' && (
        <>
        {error && (
          <div
            className="rounded-lg px-4 py-3 font-mono text-sm"
            style={{
              background: 'rgba(255,85,85,0.1)',
              border: '1px solid rgba(255,85,85,0.3)',
              color: '#ff5555',
            }}
          >
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-8 h-8 border-2 rounded-full"
              style={{ borderColor: '#b026ff', borderTopColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span className="font-mono text-sm text-gray-500 ml-3">Cargando datos...</span>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Visitas"
                value={stats?.totalVisits ?? 0}
                icon={<Eye size={22} />}
                color="#00e5ff"
                glow="rgba(0,229,255,0.3)"
              />
              <StatCard
                label="Visitas Hoy"
                value={stats?.todayVisits ?? 0}
                icon={<CalendarDays size={22} />}
                color="#b026ff"
                glow="rgba(176,38,255,0.3)"
              />
              <StatCard
                label="Sección Más Vista"
                value={stats?.mostViewedSection ?? '—'}
                icon={<BarChart2 size={22} />}
                color="#ff00ff"
                glow="rgba(255,0,255,0.3)"
              />
              <StatCard
                label="Mensajes Sin Leer"
                value={stats?.unreadMessages ?? 0}
                icon={<Mail size={22} />}
                color="#00e5ff"
                glow="rgba(0,229,255,0.3)"
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
              {/* Section views bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg p-3 sm:p-6"
                style={{ background: '#12121a', border: '1px solid #1e1e2e' }}
              >
                <h2 className="font-orbitron font-bold text-sm text-white mb-6">
                  Vistas por Sección
                </h2>
                <div className="space-y-4">
                  {sectionNames.map((section) => {
                    const views = stats!.sectionViews[section]
                    const pct = (views / maxSectionViews) * 100
                    return (
                      <div key={section}>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-xs text-gray-400 capitalize">
                            {section}
                          </span>
                          <span className="font-mono text-xs text-gray-500">{views}</span>
                        </div>
                        <div
                          className="w-full rounded-full overflow-hidden"
                          style={{ background: '#1e1e2e', height: '6px' }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            style={{
                              height: '100%',
                              borderRadius: '9999px',
                              background: 'linear-gradient(90deg, #b026ff, #00e5ff)',
                              boxShadow: '0 0 8px rgba(176,38,255,0.5)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {sectionNames.length === 0 && (
                    <p className="font-mono text-xs text-gray-600">Sin datos aún</p>
                  )}
                </div>
              </motion.div>

              {/* Last 7 days timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg p-3 sm:p-6"
                style={{ background: '#12121a', border: '1px solid #1e1e2e' }}
              >
                <h2 className="font-orbitron font-bold text-sm text-white mb-6">
                  Últimos 7 Días
                </h2>
                <div className="flex items-end justify-between gap-2 h-32">
                  {(stats?.dailyVisits ?? []).map((day) => {
                    const heightPct = (day.count / maxDaily) * 100
                    const dateLabel = new Date(day.date).toLocaleDateString('es-AR', {
                      weekday: 'short',
                    })
                    return (
                      <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                        <span className="font-mono text-xs text-gray-500">{day.count}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(heightPct, 4)}%` }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          className="w-full rounded-t"
                          style={{
                            background: 'linear-gradient(180deg, #b026ff, rgba(176,38,255,0.3))',
                            boxShadow: '0 0 6px rgba(176,38,255,0.4)',
                            minHeight: '4px',
                          }}
                        />
                        <span className="font-mono text-xs text-gray-600 capitalize">
                          {dateLabel}
                        </span>
                      </div>
                    )
                  })}
                  {(!stats?.dailyVisits || stats.dailyVisits.length === 0) && (
                    <p className="font-mono text-xs text-gray-600">Sin datos aún</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Messages table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg overflow-hidden"
              style={{ background: '#12121a', border: '1px solid #1e1e2e' }}
            >
              <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
                <h2 className="font-orbitron font-bold text-sm text-white">Mensajes</h2>
                <span className="font-mono text-xs text-gray-500">
                  {messages.length} total
                </span>
              </div>

              <div className="divide-y divide-dark-border">
                {messages.length === 0 && (
                  <div className="px-6 py-8 text-center">
                    <p className="font-mono text-xs text-gray-600">Sin mensajes todavía</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id}>
                    <button
                      className="w-full flex items-start gap-4 px-6 py-4 text-left hover:bg-white/5 transition-colors"
                      onClick={() => {
                        setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)
                        handleMarkRead(msg)
                      }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {msg.read ? (
                          <CheckCircle size={14} style={{ color: '#4a4a5a' }} />
                        ) : (
                          <Clock size={14} style={{ color: '#00e5ff' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className="font-mono text-sm font-bold truncate"
                            style={{ color: msg.read ? '#888' : '#e0e0e0' }}
                          >
                            {msg.name}
                          </span>
                          <span className="font-mono text-xs text-gray-600 truncate hidden sm:block">
                            {msg.email}
                          </span>
                          <span className="font-mono text-xs text-gray-600 ml-auto whitespace-nowrap">
                            {new Date(msg.createdAt).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <p
                          className="font-mono text-xs truncate"
                          style={{ color: msg.read ? '#555' : '#888' }}
                        >
                          {msg.message}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className="flex-shrink-0 mt-1"
                        style={{
                          color: '#444',
                          transform: selectedMessage?.id === msg.id ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>

                    {/* Expanded message */}
                    {selectedMessage?.id === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-4 pl-14"
                      >
                        <div
                          className="rounded-lg p-4"
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
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
        </>
        )}
      </main>
    </div>
  )
}

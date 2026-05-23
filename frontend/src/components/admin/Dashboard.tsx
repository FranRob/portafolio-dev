import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LogOut,
  Eye,
  CalendarDays,
  BarChart2,
  Mail,
  RefreshCw,
} from 'lucide-react'
import { getStats, logout } from '../../services/api'
import type { AnalyticsStats } from '../../services/api'

const AdminProjects = lazy(() => import('./AdminProjects'))
const AdminMessages = lazy(() => import('./AdminMessages').then(m => ({ default: m.AdminMessages })))
const AdminSettings = lazy(() => import('./AdminSettings'))

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  glow: string
  onClick?: () => void
  className?: string
}

function StatCard({ label, value, icon, color, glow, onClick, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-3 sm:p-5 bg-dark-card ${className || ''}`}
      style={{
        border: `1px solid ${color}`,
        boxShadow: `0 0 10px ${glow}`,
      }}
      onClick={onClick}
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'metrics' | 'projects' | 'messages' | 'settings'>(() => {
    return (sessionStorage.getItem('admin_active_tab') as 'metrics' | 'projects' | 'messages' | 'settings') || 'metrics'
  })

  function handleTabChange(tab: 'metrics' | 'projects' | 'messages' | 'settings') {
    setActiveTab(tab)
    sessionStorage.setItem('admin_active_tab', tab)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const statsData = await getStats()
      setStats(statsData)
    } catch {
      setError('Error al cargar los datos. Verificá tu conexión.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleLogout() {
    logout().finally(() => {
      navigate('/admin/login', { replace: true })
    })
  }

  const sectionNames = stats ? Object.keys(stats.sectionViews) : []
  const maxSectionViews = stats ? Math.max(...Object.values(stats.sectionViews), 1) : 1
  const maxDaily = stats ? Math.max(...stats.dailyVisits.map((d) => d.count), 1) : 1

  return (
    <div className="min-h-screen bg-dark-base text-gray-300">
      {/* Header */}
      <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-dark-base/90 backdrop-blur-xl border-b border-dark-border">
        <div>
          <h1 className="font-orbitron font-bold text-lg text-neon-purple neon-text-purple-sm">
            Panel de Métricas
          </h1>
          <p className="font-mono text-xs text-gray-500">divMalCentrado admin</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-white px-3 py-2 rounded transition-colors min-h-[44px] bg-dark-card border border-dark-border"
            aria-label="Recargar datos"
            title="Recargar datos"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-white px-3 py-2 rounded transition-colors min-h-[44px] bg-dark-card border border-dark-border"
            title="Volver al portfolio"
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Portfolio
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-mono text-xs px-3 py-2 rounded transition-all min-h-[44px] border border-neon-purple/30 text-neon-purple bg-neon-purple/[0.05] hover:bg-neon-purple/10"
            aria-label="Cerrar sesión"
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-16 z-30 flex border-b bg-dark-base/95 border-dark-border">
        {(['metrics', 'messages', 'projects', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`font-mono text-xs px-6 py-3 transition-colors min-h-[44px] ${
              activeTab === tab ? 'text-neon-purple border-b-2 border-neon-purple' : 'text-gray-500 border-b-2 border-transparent'
            }`}
            aria-label={tab === 'metrics' ? 'Métricas' : tab === 'messages' ? 'Mensajes' : tab === 'projects' ? 'Proyectos' : 'Ajustes'}
          >
            {tab === 'metrics' ? 'Métricas' : tab === 'messages' ? 'Mensajes' : tab === 'projects' ? 'Proyectos' : 'Ajustes'}
          </button>
        ))}
      </div>

<main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {activeTab === 'projects' && <Suspense fallback={<div className="font-mono text-sm text-gray-500 py-20 text-center">Cargando...</div>}><AdminProjects /></Suspense>}
        {activeTab === 'messages' && <Suspense fallback={<div className="font-mono text-sm text-gray-500 py-20 text-center">Cargando...</div>}><AdminMessages /></Suspense>}
        {activeTab === 'settings' && <Suspense fallback={<div className="font-mono text-sm text-gray-500 py-20 text-center">Cargando...</div>}><AdminSettings /></Suspense>}
        {activeTab === 'metrics' && (
          <>
            {error && (
              <div className="rounded-lg px-4 py-3 font-mono text-sm bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}
            {loading && !stats ? (
              <div className="flex items-center justify-center py-20">
                <motion.div className="w-8 h-8 border-2 rounded-full border-neon-purple border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                <span className="font-mono text-sm text-gray-500 ml-3">Cargando datos...</span>
              </div>
            ) : (
              <>
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Visitas" value={stats?.totalVisits ?? 0} icon={<Eye size={22} />} color="var(--stat-total-color)" glow="var(--stat-total-glow)" />
                  <StatCard label="Visitas Hoy" value={stats?.todayVisits ?? 0} icon={<CalendarDays size={22} />} color="var(--stat-today-color)" glow="var(--stat-today-glow)" />
                  <StatCard label="Sección Más Vista" value={stats?.mostViewedSection ?? '—'} icon={<BarChart2 size={22} />} color="var(--stat-top-section-clr)" glow="var(--stat-top-section-glow)" />
                  <StatCard label="Mensajes Sin Leer" value={stats?.unreadMessages ?? 0} icon={<Mail size={22} />} color="var(--stat-unread-color)" glow="var(--stat-unread-glow)" onClick={() => handleTabChange('messages')} className="cursor-pointer hover:border-cyan-400/50 transition-colors" />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Section views bar chart */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg p-6 bg-dark-card border border-dark-border">
                    <h2 className="font-orbitron font-bold text-sm text-white mb-6">Vistas por Sección</h2>
                    <div className="space-y-4">
                      {sectionNames.map((section) => {
                        const views = stats!.sectionViews[section]
                        const pct = (views / maxSectionViews) * 100
                        return (
                          <div key={section}>
                            <div className="flex justify-between mb-1">
                              <span className="font-mono text-xs text-gray-400 capitalize">{section}</span>
                              <span className="font-mono text-xs text-gray-500">{views}</span>
                            </div>
                            <div className="w-full rounded-full overflow-hidden bg-dark-border" style={{ height: '6px' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="gradient-bar-section" style={{ height: '100%', borderRadius: '9999px' }} />
                            </div>
                          </div>
                        )
                      })}
                      {sectionNames.length === 0 && <p className="font-mono text-xs text-gray-600">Sin datos aún</p>}
                    </div>
                  </motion.div>

                  {/* Last 7 days timeline */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-lg p-6 bg-dark-card border border-dark-border">
                    <h2 className="font-orbitron font-bold text-sm text-white mb-6">Últimos 7 Días</h2>
                    <div className="flex items-end justify-between gap-2 h-32">
                      {(stats?.dailyVisits ?? []).map((day) => {
                        const heightPct = (day.count / maxDaily) * 100
                        const dateLabel = new Date(day.date).toLocaleDateString('es-AR', { weekday: 'short' })
                        return (
                          <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                            <span className="font-mono text-xs text-gray-500">{day.count}</span>
                            <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(heightPct, 4)}%` }} transition={{ duration: 0.6, delay: 0.4 }} className="w-full rounded-t gradient-bar-daily" style={{ minHeight: '4px' }} />
                            <span className="font-mono text-xs text-gray-600 capitalize">{dateLabel}</span>
                          </div>
                        )
                      })}
                      {(!stats?.dailyVisits || stats.dailyVisits.length === 0) && <p className="font-mono text-xs text-gray-600">Sin datos aún</p>}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

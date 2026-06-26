import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
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
const AdminServices = lazy(() => import('./AdminServices'))
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
      className={`rounded-lg p-2.5 sm:p-5 bg-dark-card ${className || ''}`}
      style={{
        border: `1px solid ${color}`,
        boxShadow: `0 0 10px ${glow}`,
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="font-mono text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2 uppercase tracking-wider truncate">{label}</p>
          <p
            className="font-orbitron font-bold text-sm sm:text-xl lg:text-2xl truncate"
            style={{ color, textShadow: `0 0 10px ${glow}` }}
          >
            {value}
          </p>
        </div>
        <span className="shrink-0 hidden sm:block" style={{ color, opacity: 0.6 }}>{icon}</span>
      </div>
    </motion.div>
  )
}

const NEON_PURPLE = 'var(--color-neon-purple)'
const NEON_CYAN = 'var(--color-neon-cyan)'
const CHART_GRID = 'var(--chart-grid)'
const CHART_LABEL = 'var(--chart-label)'

interface DailyVisitsChartProps {
  data: AnalyticsStats['dailyVisits']
  maxDaily: number
}

function DailyVisitsChart({ data, maxDaily }: DailyVisitsChartProps) {
  if (data.length === 0) return <p className="font-mono text-xs text-gray-600">Sin datos aún</p>

  const VW = 400
  const VH = 110
  const padL = 4
  const padR = 4
  const padTop = 18   // space for value labels
  const padBot = 22   // space for date labels
  const chartW = VW - padL - padR
  const chartH = VH - padTop - padBot
  const compact = data.length > 10
  const labelEvery = data.length > 20 ? 7 : data.length > 10 ? 5 : 1

  const pts = data.map((d, i) => {
    const x = padL + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW)
    const y = padTop + (maxDaily === 0 ? chartH : (1 - d.count / maxDaily) * chartH)
    return { x, y, count: d.count, date: new Date(d.date + 'T12:00:00') }
  })

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const bottom = padTop + chartH
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${bottom} L${pts[0].x.toFixed(1)},${bottom} Z`

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ height: '130px' }} aria-label="Gráfico de visitas diarias">
      <defs>
        <linearGradient id="dailyAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NEON_PURPLE} stopOpacity="0.3" />
          <stop offset="100%" stopColor={NEON_PURPLE} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill="url(#dailyAreaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke={NEON_PURPLE} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots + count labels (only non-compact) */}
      {!compact && pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill={NEON_PURPLE} />
          {p.count > 0 && (
            <text x={p.x} y={p.y - 5} textAnchor="middle" style={{ fontSize: '9px', fill: NEON_CYAN, fontFamily: 'monospace' }}>
              {p.count}
            </text>
          )}
        </g>
      ))}

      {/* Horizontal baseline */}
      <line x1={padL} y1={bottom} x2={VW - padR} y2={bottom} stroke={CHART_GRID} strokeWidth="1" />

      {/* X axis date labels */}
      {pts.map((p, i) => {
        const isLast = i === pts.length - 1
        if (i % labelEvery !== 0 && !isLast) return null
        // avoid overlap between last and second-to-last label
        if (isLast && i % labelEvery !== 0 && i - (Math.floor((i - 1) / labelEvery) * labelEvery) < 3) return null
        const label = compact
          ? `${p.date.getDate()}/${p.date.getMonth() + 1}`
          : p.date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
        return (
          <text key={i} x={p.x} y={VH - 4} textAnchor="middle" style={{ fontSize: '8px', fill: CHART_LABEL, fontFamily: 'monospace' }}>
            {label}
          </text>
        )
      })}
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'metrics' | 'messages' | 'services' | 'projects' | 'settings'>(() => {
    return (sessionStorage.getItem('admin_active_tab') as 'metrics' | 'messages' | 'services' | 'projects' | 'settings') || 'metrics'
  })
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('all')
  const statsCache = useRef<Partial<Record<'7d' | '30d' | 'all', AnalyticsStats>>>({})

  function handleTabChange(tab: 'metrics' | 'messages' | 'services' | 'projects' | 'settings') {
    setActiveTab(tab)
    sessionStorage.setItem('admin_active_tab', tab)
  }

  const fetchData = useCallback(async (bust = false) => {
    if (!bust && statsCache.current[range]) {
      setStats(statsCache.current[range]!)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const statsData = await getStats(range)
      statsCache.current[range] = statsData
      setStats(statsData)
    } catch {
      setError('Error al cargar los datos. Verificá tu conexión.')
    } finally {
      setLoading(false)
    }
  }, [range])

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
  const maxReferrer = stats ? Math.max(...(stats.referrerStats ?? []).map(r => r.count), 1) : 1
  const maxDevice = stats ? Math.max(...(stats.deviceStats ?? []).map(d => d.count), 1) : 1

  return (
    <div className="min-h-screen bg-dark-base text-gray-300">
      {/* Header */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-1.5 bg-dark-base/90 backdrop-blur-xl border-b border-dark-border">
        <div className="min-w-0 flex-1 sm:flex-none">
          <h1 className="font-orbitron font-bold text-sm sm:text-lg text-neon-purple neon-text-purple-sm truncate">
            Panel de Métricas
          </h1>
          <p className="font-mono text-[10px] sm:text-xs text-gray-500 hidden sm:block">divMalCentrado admin</p>
        </div>
        <div className="flex gap-1.5 sm:gap-3">
          <button
            onClick={() => { statsCache.current = {}; fetchData(true) }}
            className="cursor-pointer flex items-center justify-center gap-1 sm:gap-2 font-mono text-[10px] sm:text-xs text-gray-400 hover:text-white px-2 sm:px-3 py-2 rounded-sm transition-colors min-h-[44px] min-w-[44px] bg-dark-card border border-dark-border"
            aria-label="Recargar datos"
            title="Recargar datos"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="cursor-pointer flex items-center justify-center gap-1 sm:gap-2 font-mono text-[10px] sm:text-xs text-gray-400 hover:text-white px-2 sm:px-3 py-2 rounded-sm transition-colors min-h-[44px] min-w-[44px] bg-dark-card border border-dark-border"
            title="Volver al portfolio"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Portfolio</span>
          </button>
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center justify-center gap-1 sm:gap-2 font-mono text-[10px] sm:text-xs px-2 sm:px-3 py-2 rounded-sm transition-all min-h-[44px] min-w-[44px] border border-neon-purple/30 text-neon-purple bg-neon-purple/5 hover:bg-neon-purple/10"
            aria-label="Cerrar sesión"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-[57px] sm:top-[65px] z-30 flex overflow-x-auto border-b bg-dark-base/95 border-dark-border">
        {(['metrics', 'messages', 'services', 'projects', 'settings'] as const).map((tab) => {
          const labels: Record<typeof tab, string> = {
            metrics: 'Métricas',
            messages: 'Mensajes',
            services: 'Servicios',
            projects: 'Proyectos',
            settings: 'Ajustes',
          }
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`cursor-pointer font-mono text-[11px] sm:text-xs px-3 sm:px-6 py-3 transition-colors min-h-[44px] whitespace-nowrap ${
                activeTab === tab ? 'text-neon-purple border-b-2 border-neon-purple' : 'text-gray-500 border-b-2 border-transparent'
              }`}
              aria-label={labels[tab]}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

<main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {activeTab === 'messages' && <Suspense fallback={<div className="font-mono text-sm text-gray-500 py-20 text-center">Cargando...</div>}><AdminMessages /></Suspense>}
        {activeTab === 'services' && <Suspense fallback={<div className="font-mono text-sm text-gray-500 py-20 text-center">Cargando...</div>}><AdminServices /></Suspense>}
        {activeTab === 'projects' && <Suspense fallback={<div className="font-mono text-sm text-gray-500 py-20 text-center">Cargando...</div>}><AdminProjects /></Suspense>}
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
                {/* Range filter */}
                <div className="flex gap-2">
                  {(['7d', '30d', 'all'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`cursor-pointer font-mono text-xs px-3 py-1.5 rounded-sm border transition-colors min-h-[36px] ${
                        range === r
                          ? 'border-neon-purple text-neon-purple bg-neon-purple/10'
                          : 'border-dark-border text-gray-500 hover:text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {r === '7d' ? '7 días' : r === '30d' ? '30 días' : 'Todo'}
                    </button>
                  ))}
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard label="Total Visitas" value={stats?.totalVisits ?? 0} icon={<Eye size={18} />} color="var(--stat-total-color)" glow="var(--stat-total-glow)" />
                  <StatCard label="Visitas Hoy" value={stats?.todayVisits ?? 0} icon={<CalendarDays size={18} />} color="var(--stat-today-color)" glow="var(--stat-today-glow)" />
                  <StatCard label="Sección + Vista" value={stats?.mostViewedSection ?? '—'} icon={<BarChart2 size={18} />} color="var(--stat-top-section-clr)" glow="var(--stat-top-section-glow)" />
                  <StatCard label="Sin Leer" value={stats?.unreadMessages ?? 0} icon={<Mail size={18} />} color="var(--stat-unread-color)" glow="var(--stat-unread-glow)" onClick={() => handleTabChange('messages')} className="cursor-pointer hover:border-cyan-400/50 transition-colors" />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Section views bar chart */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg p-4 sm:p-6 bg-dark-card border border-dark-border">
                    <h2 className="font-orbitron font-bold text-xs sm:text-sm text-white mb-4 sm:mb-6">Vistas por Sección</h2>
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

                  {/* Daily visits line chart */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-lg p-4 sm:p-6 bg-dark-card border border-dark-border">
                    <h2 className="font-orbitron font-bold text-xs sm:text-sm text-white mb-4 sm:mb-6">{range === '7d' ? 'Últimos 7 Días' : range === '30d' ? 'Últimos 30 Días' : 'Visitas (últ. 30 días)'}</h2>
                    <DailyVisitsChart data={stats?.dailyVisits ?? []} maxDaily={maxDaily} />
                  </motion.div>
                </div>

                {/* Referrer + Device row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Referrer sources */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-lg p-4 sm:p-6 bg-dark-card border border-dark-border">
                    <h2 className="font-orbitron font-bold text-xs sm:text-sm text-white mb-4 sm:mb-6">Fuente de Tráfico</h2>
                    <div className="space-y-4">
                      {(stats?.referrerStats ?? []).map((r) => (
                        <div key={r.source}>
                          <div className="flex justify-between mb-1">
                            <span className="font-mono text-xs text-gray-400">{r.source}</span>
                            <span className="font-mono text-xs text-gray-500">{r.count}</span>
                          </div>
                          <div className="w-full rounded-full overflow-hidden bg-dark-border" style={{ height: '6px' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(r.count / maxReferrer) * 100}%` }} transition={{ duration: 0.8, delay: 0.5 }} className="gradient-bar-section" style={{ height: '100%', borderRadius: '9999px' }} />
                          </div>
                        </div>
                      ))}
                      {(!stats?.referrerStats || stats.referrerStats.length === 0) && <p className="font-mono text-xs text-gray-600">Sin datos aún</p>}
                    </div>
                  </motion.div>

                  {/* Device types */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-lg p-4 sm:p-6 bg-dark-card border border-dark-border">
                    <h2 className="font-orbitron font-bold text-xs sm:text-sm text-white mb-4 sm:mb-6">Dispositivos</h2>
                    <div className="space-y-4">
                      {(stats?.deviceStats ?? []).map((d) => {
                        const total = (stats?.deviceStats ?? []).reduce((sum, x) => sum + x.count, 0)
                        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
                        return (
                          <div key={d.type}>
                            <div className="flex justify-between mb-1">
                              <span className="font-mono text-xs text-gray-400">{d.type}</span>
                              <span className="font-mono text-xs text-gray-500">{d.count} <span className="text-gray-600">({pct}%)</span></span>
                            </div>
                            <div className="w-full rounded-full overflow-hidden bg-dark-border" style={{ height: '6px' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(d.count / maxDevice) * 100}%` }} transition={{ duration: 0.8, delay: 0.6 }} className="gradient-bar-section" style={{ height: '100%', borderRadius: '9999px' }} />
                            </div>
                          </div>
                        )
                      })}
                      {(!stats?.deviceStats || stats.deviceStats.length === 0) && <p className="font-mono text-xs text-gray-600">Sin datos aún</p>}
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

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAnalytics } from '../../hooks/useAnalytics'

type Category = 'frontend' | 'backend' | 'tools'

interface TechNode {
  id: string
  name: string
  abbr: string
  category: Category
  x: number // percentage 0-100
  y: number // percentage 0-100
  description: string
  floatDelay: number
}

const techNodes: TechNode[] = [
  // Frontend
  { id: 'react', name: 'React', abbr: 'Re', category: 'frontend', x: 20, y: 15, description: 'UI library basada en componentes y hooks', floatDelay: 0 },
  { id: 'typescript', name: 'TypeScript', abbr: 'TS', category: 'frontend', x: 38, y: 8, description: 'Tipado estático sobre JavaScript', floatDelay: 0.5 },
  { id: 'angular', name: 'Angular', abbr: 'Ng', category: 'frontend', x: 12, y: 38, description: 'Framework full de Google, basado en componentes', floatDelay: 1 },
  { id: 'html5', name: 'HTML5', abbr: 'H5', category: 'frontend', x: 28, y: 55, description: 'Estructura semántica de la web', floatDelay: 0.3 },
  { id: 'css3', name: 'CSS3', abbr: 'CS', category: 'frontend', x: 18, y: 72, description: 'Estilos, animaciones y layouts modernos', floatDelay: 0.8 },
  { id: 'tailwind', name: 'Tailwind', abbr: 'Tw', category: 'frontend', x: 40, y: 68, description: 'Utility-first CSS framework', floatDelay: 1.2 },

  // Backend
  { id: 'nodejs', name: 'Node.js', abbr: 'No', category: 'backend', x: 62, y: 12, description: 'JS en el servidor con V8 engine', floatDelay: 0.4 },
  { id: 'express', name: 'Express', abbr: 'Ex', category: 'backend', x: 75, y: 28, description: 'Framework minimalista para APIs REST', floatDelay: 0.9 },
  { id: 'postgresql', name: 'PostgreSQL', abbr: 'PG', category: 'backend', x: 60, y: 50, description: 'Base de datos relacional avanzada', floatDelay: 1.4 },
  { id: 'prisma', name: 'Prisma', abbr: 'Pr', category: 'backend', x: 78, y: 60, description: 'ORM moderno con type-safety total', floatDelay: 0.6 },

  // Tools
  { id: 'git', name: 'Git', abbr: 'Gt', category: 'tools', x: 52, y: 80, description: 'Control de versiones distribuido', floatDelay: 0.2 },
  { id: 'docker', name: 'Docker', abbr: 'Dk', category: 'tools', x: 70, y: 82, description: 'Contenedores para entornos reproducibles', floatDelay: 0.7 },
  { id: 'vscode', name: 'VS Code', abbr: 'VS', category: 'tools', x: 88, y: 45, description: 'Editor de código extensible y potente', floatDelay: 1.1 },
  { id: 'linux', name: 'Linux', abbr: 'Lx', category: 'tools', x: 90, y: 72, description: 'Sistema operativo libre y potente', floatDelay: 0.35 },
]

// SVG connection pairs
const connections: [string, string][] = [
  ['react', 'typescript'],
  ['react', 'tailwind'],
  ['typescript', 'angular'],
  ['angular', 'html5'],
  ['html5', 'css3'],
  ['css3', 'tailwind'],
  ['react', 'nodejs'],
  ['nodejs', 'express'],
  ['express', 'postgresql'],
  ['postgresql', 'prisma'],
  ['nodejs', 'git'],
  ['git', 'docker'],
  ['docker', 'vscode'],
  ['vscode', 'linux'],
  ['express', 'git'],
]

const categoryColors: Record<Category, { node: string; glow: string; text: string }> = {
  frontend: { node: '#00e5ff', glow: 'rgba(0,229,255,0.4)', text: 'text-neon-cyan' },
  backend: { node: '#b026ff', glow: 'rgba(176,38,255,0.4)', text: 'neon-text-purple' },
  tools: { node: '#ff00ff', glow: 'rgba(255,0,255,0.4)', text: 'neon-text-magenta' },
}

const categoryInfo: { key: Category; label: string; items: string[] }[] = [
  {
    key: 'frontend',
    label: 'Frontend',
    items: ['React', 'TypeScript', 'Angular', 'HTML5', 'CSS3', 'Tailwind CSS'],
  },
  {
    key: 'backend',
    label: 'Backend',
    items: ['Node.js', 'Express', 'PostgreSQL', 'Prisma'],
  },
  {
    key: 'tools',
    label: 'Herramientas',
    items: ['Git', 'Docker', 'VS Code', 'Linux'],
  },
]

function getNodeById(id: string): TechNode | undefined {
  return techNodes.find((n) => n.id === id)
}

interface TooltipState {
  nodeId: string
  x: number
  y: number
}

export default function Stack() {
  const sectionRef = useAnalytics('stack')
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  }

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 15 } },
  }

  return (
    <section
      id="stack"
      ref={sectionRef}
      className="relative z-10 py-24 px-4"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0e0e18 50%, #0a0a0f 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-subtitle">// tecnologías</p>
          <h2 className="section-title">Mi Stack Tecnológico</h2>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Una constelación de herramientas que uso para construir cosas
          </p>
        </motion.div>

        {/* Constellation */}
        <motion.div
          className="relative w-full rounded-xl mb-16 min-h-64 sm:min-h-96 md:min-h-[520px]"
          style={{
            background: 'rgba(10,10,20,0.8)',
            border: '1px solid #1e1e2e',
            boxShadow: 'inset 0 0 60px rgba(176,38,255,0.05)',
          }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* SVG connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {connections.map(([fromId, toId]) => {
              const from = getNodeById(fromId)
              const to = getNodeById(toId)
              if (!from || !to) return null
              const fromColor = categoryColors[from.category]
              return (
                <line
                  key={`${fromId}-${toId}`}
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke={fromColor.node}
                  strokeWidth="0.5"
                  strokeOpacity="0.25"
                  strokeDasharray="4 4"
                />
              )
            })}
          </svg>

          {/* Tech nodes */}
          {techNodes.map((node) => {
            const colors = categoryColors[node.category]
            return (
              <motion.div
                key={node.id}
                variants={nodeVariants}
                className="absolute"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                }}
                animate={{
                  y: [0, -3, 0],
                  transition: {
                    duration: 3 + node.floatDelay,
                    delay: node.floatDelay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                onMouseEnter={() => setTooltip({ nodeId: node.id, x: node.x, y: node.y })}
                onMouseLeave={() => setTooltip(null)}
              >
                <motion.div
                  className="flex flex-col items-center cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                >
                  <div
                    className="w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono font-bold transition-all duration-200"
                    style={{
                      background: `radial-gradient(circle, ${colors.glow} 0%, rgba(10,10,20,0.9) 70%)`,
                      border: `1.5px solid ${colors.node}`,
                      boxShadow: `0 0 8px ${colors.glow}, 0 0 16px ${colors.glow}`,
                      color: colors.node,
                      fontSize: 'clamp(8px, 1.5vw, 12px)',
                    }}
                  >
                    {node.abbr}
                  </div>
                  <span
                    className="hidden sm:inline font-mono mt-1 whitespace-nowrap"
                    style={{ color: colors.node, opacity: 0.8, fontSize: '10px' }}
                  >
                    {node.name}
                  </span>
                </motion.div>

                {/* Tooltip */}
                {tooltip?.nodeId === node.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 mb-2 z-20 pointer-events-none"
                    style={{ transform: 'translateX(-50%)' }}
                  >
                    <div
                      className="font-mono rounded px-2 py-1 whitespace-nowrap"
                      style={{
                        background: '#12121a',
                        border: `1px solid ${colors.node}`,
                        color: '#e0e0e0',
                        boxShadow: `0 0 8px ${colors.glow}`,
                        maxWidth: '160px',
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        fontSize: '10px',
                      }}
                    >
                      {node.description}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}

          {/* Legend */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-4 z-10">
            {(Object.entries(categoryColors) as [Category, typeof categoryColors[Category]][]).map(([cat, colors]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: colors.node, boxShadow: `0 0 6px ${colors.glow}` }}
                />
                <span className="font-mono text-xs text-gray-500 capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          {categoryInfo.map((cat, i) => {
            const colors = categoryColors[cat.key]
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-lg p-3 sm:p-6"
                style={{
                  background: '#12121a',
                  border: `1px solid ${colors.node}`,
                  boxShadow: `0 0 10px ${colors.glow}`,
                }}
              >
                <h3
                  className="font-orbitron font-bold text-sm mb-4 tracking-wider"
                  style={{ color: colors.node }}
                >
                  {cat.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-xs px-2 py-1 rounded"
                      style={{
                        background: `${colors.glow}`,
                        border: `1px solid ${colors.node}`,
                        color: colors.node,
                        opacity: 0.85,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAnalytics } from '../../hooks/useAnalytics'
import { getProjects } from '../../services/api'
import type { Project } from '../../services/api'
import ProjectCard from './ProjectCard'

export default function Projects() {
  const sectionRef = useAnalytics('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError('Error al cargar los proyectos.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 py-24 px-4"
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
          <p className="section-subtitle">// mis proyectos</p>
          <h2 className="section-title">Proyectos</h2>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-8 h-8 border-2 rounded-full"
              style={{ borderColor: '#b026ff', borderTopColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span className="font-mono text-sm text-gray-500 ml-3">Cargando proyectos...</span>
          </div>
        )}

        {/* Error state */}
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

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <p className="text-center font-mono text-xs text-gray-600">
            No hay proyectos todavía
          </p>
        )}

        {/* Grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

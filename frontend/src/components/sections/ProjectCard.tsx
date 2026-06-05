import { memo } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import type { Project } from '../../services/api'

interface ProjectCardProps {
  project: Project
  index: number
}

const statusConfig = {
  in_progress: {
    label: 'En desarrollo',
    color: 'var(--status-in-progress)',
    shadow: 'var(--status-in-progress-shadow)',
  },
  completed: {
    label: 'Live',
    color: 'var(--status-completed)',
    shadow: 'var(--status-completed-shadow)',
  },
  private: {
    label: 'Próximamente',
    color: 'var(--status-private)',
    shadow: 'none',
  },
}

function getInitials(title: string): string {
  return title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default memo(function ProjectCard({ project, index }: ProjectCardProps) {
  const status = statusConfig[project.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
    <Link
      to={`/proyectos/${project.slug}`}
      className="cursor-pointer group h-full block rounded-lg overflow-hidden flex flex-col bg-dark-card border border-dark-border hover:border-neon-purple/50 transition-colors duration-200"
      aria-label={`Ver detalles de ${project.title}`}
    >
      {/* Image area */}
      <div className="relative h-32 sm:h-44 shrink-0">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center project-card-gradient">
            <span className="font-orbitron font-bold text-2xl sm:text-4xl select-none text-neon-purple neon-text-purple-lg">
              {getInitials(project.title)}
            </span>
          </div>
        )}

        {/* Status badge — top right */}
        <span
          className="absolute top-3 right-3 font-mono text-xs px-2 py-0.5 rounded-sm bg-dark-base/70"
          style={{
            color: status.color,
            border: `1px solid ${status.color}`,
            boxShadow: status.shadow !== 'none' ? `0 0 8px ${status.shadow}` : undefined,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Card body */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <h3 className="font-orbitron font-bold text-sm text-white mb-2">
          {project.title}
        </h3>

        <p
          className="font-mono text-xs text-gray-400 leading-relaxed mb-3 line-clamp-3"
        >
          {project.description}
        </p>

        {/* Stack pills */}
        <div className="flex flex-wrap gap-1 mb-4">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-xs text-gray-400 px-2 py-0.5 rounded-sm bg-neon-purple/8 border border-neon-purple/20"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* "Ver detalles" hint */}
        <div className="mt-auto pt-2">
          <span className="font-mono text-xs text-neon-purple/60 group-hover:text-neon-purple transition-colors">
            Ver detalles →
          </span>
        </div>
      </div>
    </Link>
    </motion.div>
  )
})
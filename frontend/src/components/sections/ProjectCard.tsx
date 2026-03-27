import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import type { Project } from '../../services/api'

interface ProjectCardProps {
  project: Project
  index: number
}

const statusConfig = {
  in_progress: {
    label: 'En desarrollo',
    color: '#b026ff',
    shadow: 'rgba(176,38,255,0.3)',
  },
  completed: {
    label: 'Live',
    color: '#00e5ff',
    shadow: 'rgba(0,229,255,0.3)',
  },
  private: {
    label: 'Próximamente',
    color: '#4a4a5a',
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

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const status = statusConfig[project.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-lg overflow-hidden flex flex-col"
      style={{ background: '#12121a', border: '1px solid #1e1e2e' }}
    >
      {/* Image area */}
      <div className="relative h-44 flex-shrink-0">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(176,38,255,0.3) 0%, rgba(0,229,255,0.15) 50%, rgba(176,38,255,0.1) 100%)',
            }}
          >
            <span
              className="font-orbitron font-bold text-4xl select-none"
              style={{
                color: '#b026ff',
                textShadow: '0 0 20px rgba(176,38,255,0.6)',
              }}
            >
              {getInitials(project.title)}
            </span>
          </div>
        )}

        {/* Status badge — top right */}
        <span
          className="absolute top-3 right-3 font-mono text-xs px-2 py-0.5 rounded"
          style={{
            color: status.color,
            border: `1px solid ${status.color}`,
            background: 'rgba(10,10,15,0.7)',
            boxShadow: status.shadow !== 'none' ? `0 0 8px ${status.shadow}` : undefined,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-orbitron font-bold text-sm text-white mb-2">
          {project.title}
        </h3>

        <p
          className="font-mono text-xs text-gray-400 leading-relaxed mb-3"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>

        {/* Stack pills */}
        <div className="flex flex-wrap gap-1 mb-4">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-xs text-gray-400 px-2 py-0.5 rounded"
              style={{
                background: 'rgba(176,38,255,0.08)',
                border: '1px solid rgba(176,38,255,0.2)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links row — only for completed projects */}
        {project.status === 'completed' && (
          <div className="mt-auto flex gap-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-xs transition-colors"
                style={{ color: '#00e5ff' }}
              >
                <ExternalLink size={12} />
                Ver demo
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-xs transition-colors"
                style={{ color: '#888' }}
              >
                <Github size={12} />
                Ver código
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import { GithubIcon } from '../ui/BrandIcons'
import { getProjectBySlug } from '../../services/api'
import type { ProjectDetail } from '../../services/api'

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

const categoryLabels = {
  freelance: 'Freelance',
  personal: 'Personal',
  collaborative: 'Colaborativo',
}

// Custom component map — applies neon theme to react-markdown output
const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => (
    <h1 className="font-orbitron font-bold text-2xl text-neon-cyan neon-text-cyan-sm mb-4 mt-6">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-orbitron font-bold text-xl text-neon-cyan neon-text-cyan-sm mb-3 mt-5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-orbitron font-bold text-base text-neon-cyan mb-2 mt-4">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="font-mono text-sm text-gray-300 leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="font-mono text-sm text-gray-300 leading-relaxed mb-4 list-disc list-inside space-y-1 pl-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="font-mono text-sm text-gray-300 leading-relaxed mb-4 list-decimal list-inside space-y-1 pl-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="font-mono text-sm text-gray-300">
      {children}
    </li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <code className="block font-mono text-xs text-neon-cyan bg-dark-card border border-dark-border rounded-md px-4 py-3 mb-4 overflow-x-auto whitespace-pre">
          {children}
        </code>
      )
    }
    return (
      <code className="font-mono text-xs text-neon-purple bg-dark-card border border-dark-border rounded px-1.5 py-0.5">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-dark-card border border-dark-border rounded-lg mb-4 overflow-x-auto">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-neon-purple hover:text-neon-cyan transition-colors underline underline-offset-2 cursor-pointer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-neon-purple pl-4 my-4 text-gray-400 font-mono text-sm italic">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="border-dark-border my-6" />
  ),
  strong: ({ children }) => (
    <strong className="text-white font-bold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-gray-300 italic">{children}</em>
  ),
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setNotFound(false)

    getProjectBySlug(slug)
      .then(setProject)
      .catch((err) => {
        const status = err?.response?.status
        if (status === 404) {
          setNotFound(true)
        } else {
          setNotFound(true)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-8 h-8 border-2 rounded-full"
            style={{ borderColor: 'var(--status-in-progress)', borderTopColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span className="font-mono text-sm text-gray-500">Cargando proyecto...</span>
        </div>
      </div>
    )
  }

  // 404 / error state
  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
          role="alert"
          aria-live="assertive"
        >
          <p className="font-mono text-neon-purple text-sm tracking-widest uppercase mb-4">// 404</p>
          <h1 className="font-orbitron font-bold text-2xl text-white mb-4">
            Proyecto no encontrado
          </h1>
          <p className="font-mono text-sm text-gray-400 mb-8">
            El proyecto que buscás no existe o fue removido.
          </p>
          <a
            href="/#projects"
            className="cursor-pointer inline-flex items-center gap-2 font-mono text-sm px-5 py-3 rounded-sm transition-all border border-neon-purple/40 text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/20 min-h-[44px]"
            aria-label="Volver a la sección de proyectos"
          >
            <ArrowLeft size={14} />
            Volver a proyectos
          </a>
        </motion.div>
      </div>
    )
  }

  const status = statusConfig[project.status]
  const categoryLabel = categoryLabels[project.category]

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Grid bg overlay */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 sm:py-16">
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <a
            href="/#projects"
            className="cursor-pointer inline-flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors group min-h-[44px] py-2"
            aria-label="Volver a la sección de proyectos"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Volver a proyectos
          </a>
        </motion.div>

        {/* Header section */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Status badge */}
            <span
              className="font-mono text-xs px-2 py-0.5 rounded-sm bg-dark-card"
              style={{
                color: status.color,
                border: `1px solid ${status.color}`,
                boxShadow: status.shadow !== 'none' ? `0 0 8px ${status.shadow}` : undefined,
              }}
              aria-label={`Estado: ${status.label}`}
            >
              {status.label}
            </span>

            {/* Category badge */}
            <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-dark-card border border-dark-border text-gray-500">
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-orbitron font-bold text-2xl sm:text-3xl text-white mb-4 leading-tight neon-text-purple-md">
            {project.title}
          </h1>

          {/* Description */}
          <p className="font-mono text-sm text-gray-300 leading-relaxed mb-5">
            {project.description}
          </p>

          {/* Stack pills */}
          {project.stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6" aria-label="Stack tecnológico">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-xs text-gray-400 px-2 py-0.5 rounded-sm bg-neon-purple/8 border border-neon-purple/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Repo / Demo buttons */}
          <div className="flex flex-wrap gap-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-sm transition-all border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/5 hover:bg-neon-cyan/15 min-h-[44px]"
                aria-label={`Ver demo de ${project.title}`}
              >
                <ExternalLink size={13} aria-hidden="true" />
                Ver demo
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-sm transition-all border border-dark-border text-gray-400 bg-dark-card hover:border-neon-purple/40 hover:text-white min-h-[44px]"
                aria-label={`Ver código fuente de ${project.title}`}
              >
                <GithubIcon size={13} aria-hidden="true" />
                Ver código
              </a>
            )}
          </div>
        </motion.header>

        {/* Divider */}
        {project.content && (
          <div className="border-t border-dark-border mb-8" aria-hidden="true" />
        )}

        {/* Markdown content */}
        {project.content && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            aria-label="Descripción detallada del proyecto"
          >
            <ReactMarkdown
              rehypePlugins={[rehypeSanitize]}
              components={markdownComponents}
            >
              {project.content}
            </ReactMarkdown>
          </motion.article>
        )}

        {/* Bottom back nav — always visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-dark-border"
        >
          <a
            href="/#projects"
            className="cursor-pointer inline-flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors group min-h-[44px] py-2"
            aria-label="Volver a la sección de proyectos"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Volver a proyectos
          </a>
        </motion.div>
      </div>
    </div>
  )
}

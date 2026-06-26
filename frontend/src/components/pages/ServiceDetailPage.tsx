import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { ArrowLeft } from 'lucide-react'
import { getServiceBySlug } from '../../services/api'
import type { ServiceDetail } from '../../services/api'

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

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [service, setService] = useState<ServiceDetail | null>(null)
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

    getServiceBySlug(slug)
      .then(setService)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-8 h-8 border-2 rounded-full"
            style={{ borderColor: 'var(--social-cyan)', borderTopColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span className="font-mono text-sm text-gray-500">Cargando servicio...</span>
        </div>
      </div>
    )
  }

  if (notFound || !service) {
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
            Servicio no encontrado
          </h1>
          <p className="font-mono text-sm text-gray-400 mb-8">
            El servicio que buscás no existe o fue removido.
          </p>
          <a
            href="/#services"
            className="cursor-pointer inline-flex items-center gap-2 font-mono text-sm px-5 py-3 rounded-sm transition-all border border-neon-purple/40 text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/20 min-h-[44px]"
            aria-label="Volver a la sección de servicios"
          >
            <ArrowLeft size={14} />
            Volver a servicios
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-base">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <a
            href="/#services"
            className="cursor-pointer inline-flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors group min-h-[44px] py-2"
            aria-label="Volver a la sección de servicios"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Volver a servicios
          </a>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-orbitron font-bold text-2xl sm:text-3xl text-white mb-2 leading-tight neon-text-purple-md">
            {service.title}
          </h1>

          {service.tagline && (
            <p className="font-mono text-sm text-neon-cyan mb-4">
              {service.tagline}
            </p>
          )}

          <p className="font-mono text-sm text-gray-300 leading-relaxed mb-5">
            {service.description}
          </p>

          {service.stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6" aria-label="Stack tecnológico">
              {service.stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-xs text-gray-400 px-2 py-0.5 rounded-sm bg-neon-purple/8 border border-neon-purple/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {service.deliverables.length > 0 && (
            <div className="mb-6">
              <p className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">Entregables</p>
              <ul className="flex flex-col gap-1.5">
                {service.deliverables.map((item) => (
                  <li key={item} className="font-mono text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-neon-cyan shrink-0 mt-0.5" aria-hidden="true">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(service.estimatedTimeline || service.priceRange) && (
            <div className="flex flex-wrap gap-4 mb-4">
              {service.estimatedTimeline && (
                <div>
                  <p className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">Tiempo estimado</p>
                  <p className="font-mono text-sm text-gray-300">{service.estimatedTimeline}</p>
                </div>
              )}
              {service.priceRange && (
                <div>
                  <p className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">Inversión</p>
                  <p className="font-mono text-sm text-neon-cyan">{service.priceRange}</p>
                </div>
              )}
            </div>
          )}
        </motion.header>

        {service.content && (
          <div className="border-t border-dark-border mb-8" aria-hidden="true" />
        )}

        {service.content && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            aria-label="Descripción detallada del servicio"
          >
            <ReactMarkdown
              rehypePlugins={[rehypeSanitize]}
              components={markdownComponents}
            >
              {service.content}
            </ReactMarkdown>
          </motion.article>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-dark-border"
        >
          <a
            href="/#services"
            className="cursor-pointer inline-flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors group min-h-[44px] py-2"
            aria-label="Volver a la sección de servicios"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Volver a servicios
          </a>
        </motion.div>
      </div>
    </div>
  )
}

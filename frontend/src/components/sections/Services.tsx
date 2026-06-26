import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { LayoutDashboard, Globe, Zap, Code2, Smartphone, ShoppingCart, Database } from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { getServices } from '../../services/api'
import type { Service } from '../../services/api'

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={24} />,
  Globe: <Globe size={24} />,
  Zap: <Zap size={24} />,
  Code2: <Code2 size={24} />,
  Smartphone: <Smartphone size={24} />,
  ShoppingCart: <ShoppingCart size={24} />,
  Database: <Database size={24} />,
}

function getIcon(iconName: string | null): React.ReactNode {
  if (!iconName || !(iconName in iconMap)) return <Zap size={24} />
  return iconMap[iconName]
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Services() {
  const sectionRef = useAnalytics('services')
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative z-10 py-24 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-subtitle">// lo que construyo</p>
          <h2 className="section-title">Servicios</h2>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg p-6 bg-dark-card border border-dark-border animate-pulse"
                style={{ minHeight: '200px' }}
              />
            ))}
          </div>
        )}

        {!loading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => navigate(`/servicios/${service.slug}`)}
                className="cursor-pointer flex flex-col gap-4 rounded-lg p-6 bg-dark-card border border-dark-border transition-all duration-300 hover:border-neon-cyan hover:shadow-[0_0_20px_var(--shadow-cyan-lg)]"
                role="button"
                tabIndex={0}
                aria-label={`Ver detalles de ${service.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/servicios/${service.slug}`)
                  }
                }}
              >
                <span style={{ color: 'var(--social-cyan)' }}>
                  {getIcon(service.iconName)}
                </span>

                <h3 className="font-orbitron font-bold text-base text-white">
                  {service.title}
                </h3>

                <p className="font-mono text-sm text-gray-400 leading-relaxed flex-1">
                  {service.description}
                </p>

                {service.deliverables.length > 0 && (
                  <ul className="flex flex-col gap-1 mt-1">
                    {service.deliverables.slice(0, 3).map((item) => (
                      <li key={item} className="font-mono text-xs text-gray-500 flex items-start gap-1.5">
                        <span style={{ color: 'var(--social-cyan)' }} aria-hidden="true">›</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-2 mt-auto">
                  {service.stack.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-2 py-1 rounded-sm"
                      style={{
                        background: 'var(--trait-bg)',
                        border: '1px solid var(--trait-border)',
                        color: 'var(--social-purple)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={() => scrollTo('contact')}
            className="cursor-pointer font-mono text-sm px-8 py-3 rounded-sm transition-all duration-300 uppercase tracking-wider border border-neon-cyan text-neon-cyan bg-neon-cyan/5 hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_var(--shadow-cyan-lg)] shadow-[0_0_10px_var(--shadow-cyan-sm)]"
            aria-label="Hablemos de tu proyecto"
          >
            Hablemos de tu proyecto
          </button>
        </motion.div>
      </div>
    </section>
  )
}

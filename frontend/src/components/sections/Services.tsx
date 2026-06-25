import { motion } from 'motion/react'
import { LayoutDashboard, Globe, Zap } from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'

interface Service {
  icon: React.ReactNode
  title: string
  description: string
  tags: string[]
}

const services: Service[] = [
  {
    icon: <LayoutDashboard size={24} />,
    title: 'Sistemas de gestión',
    description:
      'Reemplazás la hoja de cálculo por un sistema que tu equipo realmente usa. Turnos, pedidos, inventario, clientes — lo que necesite tu negocio.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    icon: <Globe size={24} />,
    title: 'Landing pages y sitios corporativos',
    description:
      'Presencia profesional online, sin pagar una agencia. Sitios rápidos, accesibles y pensados para que el visitante haga algo.',
    tags: ['Next.js', 'SEO', 'Responsive'],
  },
  {
    icon: <Zap size={24} />,
    title: 'MVPs y productos web',
    description:
      'Tu idea funcionando en semanas, no meses. La versión mínima que valida tu concepto y puede crecer cuando lo necesites.',
    tags: ['Full-Stack', 'Auth', 'Deploy'],
  },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Services() {
  const sectionRef = useAnalytics('services')

  return (
    <section
      id="services"
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
          <p className="section-subtitle">// lo que construyo</p>
          <h2 className="section-title">Servicios</h2>
        </motion.div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col gap-4 rounded-lg p-6 bg-dark-card border border-dark-border transition-all duration-300 hover:border-neon-cyan hover:shadow-[0_0_20px_var(--shadow-cyan-lg)]"
            >
              {/* Icon */}
              <span style={{ color: 'var(--social-cyan)' }}>
                {service.icon}
              </span>

              {/* Title */}
              <h3 className="font-orbitron font-bold text-base text-white">
                {service.title}
              </h3>

              {/* Description */}
              <p className="font-mono text-sm text-gray-400 leading-relaxed flex-1">
                {service.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {service.tags.map((tag) => (
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

        {/* CTA */}
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

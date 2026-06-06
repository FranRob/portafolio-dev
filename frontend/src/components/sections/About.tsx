import { motion } from 'motion/react'
import { Rocket, ShieldCheck, FlaskConical, CreditCard } from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'

interface Trait {
  icon: React.ReactNode
  label: string
}

const traits: Trait[] = [
  { icon: <Rocket size={16} />, label: 'Ships to Production' },
  { icon: <ShieldCheck size={16} />, label: 'Security-First' },
  { icon: <FlaskConical size={16} />, label: 'TDD Practitioner' },
  { icon: <CreditCard size={16} />, label: 'LATAM Integrations' },
]

interface CodeToken {
  type: 'keyword' | 'property' | 'string' | 'boolean' | 'bracket' | 'plain' | 'comment' | 'number'
  value: string
}

type CodeLine = CodeToken[]

const codeLines: CodeLine[] = [
  [{ type: 'keyword', value: 'const' }, { type: 'plain', value: ' developer ' }, { type: 'plain', value: '= ' }, { type: 'bracket', value: '{' }],
  [{ type: 'property', value: '  name' }, { type: 'plain', value: ': ' }, { type: 'string', value: '"Franco Robles"' }, { type: 'plain', value: ',' }],
  [{ type: 'property', value: '  alias' }, { type: 'plain', value: ': ' }, { type: 'string', value: '"divMalCentrado"' }, { type: 'plain', value: ',' }],
  [{ type: 'property', value: '  location' }, { type: 'plain', value: ': ' }, { type: 'string', value: '"Argentina"' }, { type: 'plain', value: ',' }],
  [{ type: 'property', value: '  role' }, { type: 'plain', value: ': ' }, { type: 'string', value: '"Full-Stack Developer"' }, { type: 'plain', value: ',' }],
  [{ type: 'property', value: '  stack' }, { type: 'plain', value: ': ' }, { type: 'bracket', value: '[' }],
  [{ type: 'string', value: '    "PERN"' }, { type: 'plain', value: ',' }],
  [{ type: 'string', value: '    "Next.js"' }, { type: 'plain', value: ',' }],
  [{ type: 'string', value: '    ".NET"' }],
  [{ type: 'bracket', value: '  ]' }, { type: 'plain', value: ',' }],
  [{ type: 'property', value: '  interests' }, { type: 'plain', value: ': ' }, { type: 'bracket', value: '[' }],
  [{ type: 'string', value: '    "Web Development"' }, { type: 'plain', value: ',' }],
  [{ type: 'string', value: '    "Clean Architecture"' }, { type: 'plain', value: ',' }],
  [{ type: 'string', value: '    "Sci-Fi & Space"' }, { type: 'plain', value: ',' }],
  [{ type: 'string', value: '    "Synthwave Music"' }],
  [{ type: 'bracket', value: '  ]' }],
  [{ type: 'bracket', value: '}' }, { type: 'plain', value: ';' }],
]

const tokenColors: Record<CodeToken['type'], string> = {
  keyword: 'var(--syntax-keyword)',
  property: 'var(--syntax-property)',
  string: 'var(--syntax-string)',
  boolean: 'var(--syntax-boolean)',
  bracket: 'var(--syntax-bracket)',
  plain: 'var(--syntax-plain)',
  comment: 'var(--syntax-comment)',
  number: 'var(--syntax-number)',
}

export default function About() {
  const sectionRef = useAnalytics('about')

  return (
    <section
      id="about"
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
          <p className="section-subtitle">// quien soy</p>
          <h2 className="section-title">Sobre Mí</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-5 mb-8">
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                Desarrollo aplicaciones web completas — desde el diseño de la base de
                datos hasta la interfaz. Trabajo con TypeScript en todo el stack,
                entrego en producción, y me importa que el código que dejo sea
                mantenible por alguien más.
              </p>
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                Trabajo en proyectos reales de clientes — el sitio de una consultora,
                un sistema de gestión para una pastelería artesanal — y en un SaaS de
                turnos propio que está próximo a producción. Cada uno con sus propias
                restricciones de arquitectura, seguridad y deployment.
              </p>
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                Cuando no estoy programando, estoy pensando en qué construir después.
                No sé si eso es disciplina o un problema, pero funciona.
              </p>
            </div>

            {/* Traits */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {traits.map((trait, i) => (
                <motion.div
                  key={trait.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 rounded-sm px-3 py-2"
                  style={{
                    background: 'var(--trait-bg)',
                    border: '1px solid var(--trait-border)',
                  }}
                >
                  <span style={{ color: 'var(--social-purple)' }}>{trait.icon}</span>
                  <span className="font-mono text-xs text-gray-400">{trait.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Currently */}
            <div
              className="rounded-lg p-4"
              style={{
                background: 'var(--currently-bg)',
                border: '1px solid var(--currently-border)',
              }}
            >
              <p
                className="font-mono text-xs font-bold mb-3 tracking-wider uppercase"
                style={{ color: 'var(--social-cyan)' }}
              >
                {'>'} Actualmente
              </p>
              <ul className="space-y-1">
                {[
                  '→ Desarrollando un SaaS de gestión para negocios locales',
                  '→ Construyendo productos para clientes reales',
                  '→ Disponible para nuevos proyectos freelance',
                ].map((item) => (
                  <li key={item} className="font-mono text-xs text-gray-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right: Terminal code block */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--dark-border)',
                boxShadow: '0 0 30px var(--terminal-shadow)',
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-2 px-2 sm:px-4 py-2 sm:py-3"
                style={{ background: 'var(--terminal-header)', borderBottom: '1px solid var(--dark-border)' }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                </div>
                <span className="font-mono text-xs text-gray-500 ml-2">about.ts</span>
              </div>

              {/* Code content */}
              <div
                className="p-6 overflow-x-auto"
                style={{ background: 'var(--terminal-bg)' }}
              >
                <pre className="font-mono text-xs sm:text-sm leading-7">
                  {codeLines.map((line, lineIdx) => (
                    <div key={lineIdx}>
                      <span className="select-none mr-4 text-xs" style={{ color: 'var(--terminal-line-num)' }}>
                        {String(lineIdx + 1).padStart(2, ' ')}
                      </span>
                      {line.map((token, tokenIdx) => (
                        <span
                          key={tokenIdx}
                          style={{ color: tokenColors[token.type] }}
                        >
                          {token.value}
                        </span>
                      ))}
                    </div>
                  ))}
                  {/* Cursor line */}
                  <div>
                    <span className="select-none mr-4 text-xs" style={{ color: 'var(--terminal-line-num)' }}>
                      {String(codeLines.length + 1).padStart(2, ' ')}
                    </span>
                    <motion.span
                      className="font-mono text-xs"
                      style={{ color: 'var(--social-purple)' }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      █
                    </motion.span>
                  </div>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

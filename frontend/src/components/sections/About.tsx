import { motion } from 'framer-motion'
import { Code2, Lightbulb, BookOpen, Heart } from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'

interface Trait {
  icon: React.ReactNode
  label: string
}

const traits: Trait[] = [
  { icon: <Code2 size={16} />, label: 'Problem Solver' },
  { icon: <Lightbulb size={16} />, label: 'Clean Code Advocate' },
  { icon: <BookOpen size={16} />, label: 'Continuous Learner' },
  { icon: <Heart size={16} />, label: 'Open Source Enthusiast' },
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
  [{ type: 'property', value: '  location' }, { type: 'plain', value: ': ' }, { type: 'string', value: '"Argentina 🇦🇷"' }, { type: 'plain', value: ',' }],
  [{ type: 'property', value: '  education' }, { type: 'plain', value: ': ' }, { type: 'string', value: '"TSADS - Cursando"' }, { type: 'plain', value: ',' }],
  [{ type: 'property', value: '  available' }, { type: 'plain', value: ': ' }, { type: 'boolean', value: 'true' }, { type: 'plain', value: ',' }],
  [{ type: 'property', value: '  interests' }, { type: 'plain', value: ': ' }, { type: 'bracket', value: '[' }],
  [{ type: 'string', value: '    "Web Development"' }, { type: 'plain', value: ',' }],
  [{ type: 'string', value: '    "Clean Architecture"' }, { type: 'plain', value: ',' }],
  [{ type: 'string', value: '    "Sci-Fi & Space"' }, { type: 'plain', value: ',' }],
  [{ type: 'string', value: '    "Synthwave Music"' }],
  [{ type: 'bracket', value: '  ]' }],
  [{ type: 'bracket', value: '}' }, { type: 'plain', value: ';' }],
]

const tokenColors: Record<CodeToken['type'], string> = {
  keyword: '#ff79c6',
  property: '#50fa7b',
  string: '#f1fa8c',
  boolean: '#bd93f9',
  bracket: '#f8f8f2',
  plain: '#f8f8f2',
  comment: '#6272a4',
  number: '#bd93f9',
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
                Soy un desarrollador apasionado por crear soluciones web que combinen
                buen código con una experiencia de usuario que valga la pena. Me muevo
                cómodo tanto en el frontend como en el backend, y disfruto de ese
                momento cuando algo difícil finalmente hace clic.
              </p>
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                Empecé a programar por curiosidad y terminé eligiéndolo como carrera.
                La Tecnicatura Superior en Análisis y Desarrollo de Software me dio
                una base sólida, pero lo que más me formó fue el tiempo dedicado a
                proyectos reales, lectura técnica y esa constante idea de que siempre
                hay algo nuevo que aprender.
              </p>
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                Fuera del código me encontrás consumiendo ciencia ficción, escuchando
                synthwave a toda velocidad o pensando en la arquitectura de software
                como si fuera un problema de urbanismo. Cada detalle importa.
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
                  className="flex items-center gap-2 rounded px-3 py-2"
                  style={{
                    background: 'rgba(176, 38, 255, 0.08)',
                    border: '1px solid rgba(176, 38, 255, 0.2)',
                  }}
                >
                  <span style={{ color: '#b026ff' }}>{trait.icon}</span>
                  <span className="font-mono text-xs text-gray-400">{trait.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Currently */}
            <div
              className="rounded-lg p-4"
              style={{
                background: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
              }}
            >
              <p
                className="font-mono text-xs font-bold mb-3 tracking-wider uppercase"
                style={{ color: '#00e5ff' }}
              >
                {'>'} Actualmente
              </p>
              <ul className="space-y-1">
                {[
                  '📚 Terminando la Tecnicatura (1 materia restante)',
                  '🧪 Aprendiendo patrones de arquitectura limpia',
                  '🔭 Construyendo proyectos personales con React + Node',
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
                border: '1px solid #1e1e2e',
                boxShadow: '0 0 30px rgba(176, 38, 255, 0.1)',
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-2 px-2 sm:px-4 py-2 sm:py-3"
                style={{ background: '#16161f', borderBottom: '1px solid #1e1e2e' }}
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
                style={{ background: '#0d0d16' }}
              >
                <pre className="font-mono text-xs sm:text-sm leading-7">
                  {codeLines.map((line, lineIdx) => (
                    <div key={lineIdx}>
                      <span className="select-none mr-4 text-xs" style={{ color: '#3a3a4a' }}>
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
                </pre>
              </div>
            </div>

            {/* Blinking cursor decoration */}
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-xs text-gray-600">$</span>
              <motion.span
                className="font-mono text-xs"
                style={{ color: '#b026ff' }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                █
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

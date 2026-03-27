import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Linkedin, Github, ExternalLink, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { submitContact } from '../../services/api'
import { useAnalytics } from '../../hooks/useAnalytics'

interface SocialLink {
  label: string
  handle: string
  url: string
  icon: React.ReactNode
  color: 'purple' | 'cyan'
}

const socialLinks: SocialLink[] = [
  {
    label: 'LinkedIn',
    handle: 'Franco Robles',
    url: 'https://www.linkedin.com/in/francorob',
    icon: <Linkedin size={28} />,
    color: 'cyan',
  },
  {
    label: 'GitHub',
    handle: 'divMalCentrado',
    url: 'https://github.com/FranRob',
    icon: <Github size={28} />,
    color: 'purple',
  },
]

const colorMap = {
  purple: {
    border: '#b026ff',
    glow: 'rgba(176,38,255,0.3)',
    hoverGlow: 'rgba(176,38,255,0.6)',
    text: '#b026ff',
  },
  cyan: {
    border: '#00e5ff',
    glow: 'rgba(0,229,255,0.3)',
    hoverGlow: 'rgba(0,229,255,0.6)',
    text: '#00e5ff',
  },
}

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

interface FormState {
  name: string
  email: string
  message: string
}

export default function Contact() {
  const sectionRef = useAnalytics('contact')
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return

    setStatus('sending')
    try {
      await submitContact(form)
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(18, 18, 26, 0.9)',
    border: '1px solid #1e1e2e',
    color: '#e0e0e0',
    fontFamily: '"Space Mono", monospace',
    fontSize: '13px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const inputFocusStyle = {
    borderColor: '#b026ff',
    boxShadow: '0 0 10px rgba(176, 38, 255, 0.2)',
    outline: 'none',
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative z-10 py-24 px-4"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0e0e18 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-subtitle">// conectemos</p>
          <h2 className="section-title">Contacto</h2>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Abierto a oportunidades y proyectos interesantes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs text-gray-600 uppercase tracking-widest mb-6">
              Seguime en
            </p>
            <div className="flex flex-col gap-4">
              {socialLinks.map((social) => {
                const colors = colorMap[social.color]
                const isHovered = hoveredCard === social.label
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-lg px-3 sm:px-6 py-3 sm:py-5 transition-all duration-300 group"
                    style={{
                      background: isHovered ? `rgba(${social.color === 'cyan' ? '0,229,255' : '176,38,255'}, 0.08)` : '#12121a',
                      border: `1px solid ${colors.border}`,
                      boxShadow: isHovered
                        ? `0 0 20px ${colors.hoverGlow}, 0 0 40px ${colors.glow}`
                        : `0 0 8px ${colors.glow}`,
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={() => setHoveredCard(social.label)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <span style={{ color: colors.text }}>{social.icon}</span>
                    <div className="flex-1">
                      <p
                        className="font-orbitron font-bold text-sm"
                        style={{ color: colors.text }}
                      >
                        {social.label}
                      </p>
                      <p className="font-mono text-xs text-gray-500 mt-0.5">
                        {social.handle}
                      </p>
                    </div>
                    <ExternalLink
                      size={14}
                      style={{
                        color: colors.text,
                        opacity: isHovered ? 0.8 : 0.3,
                        transition: 'opacity 0.2s',
                      }}
                    />
                  </a>
                )
              })}
            </div>

            {/* Availability status */}
            <div
              className="mt-6 flex items-center gap-3 rounded-lg px-4 py-3"
              style={{
                background: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.15)',
              }}
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: '#00e5ff' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-xs text-gray-400">
                Disponible para nuevas oportunidades
              </span>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs text-gray-600 uppercase tracking-widest mb-6">
              O mandame un mensaje
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="font-mono text-xs text-gray-500 mb-2 block">
                  <span style={{ color: '#b026ff' }}>{'> '}</span>nombre_
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                  className="w-full rounded px-3 py-2 sm:px-4 sm:py-3"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1e1e2e'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-mono text-xs text-gray-500 mb-2 block">
                  <span style={{ color: '#b026ff' }}>{'> '}</span>email_
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="w-full rounded px-3 py-2 sm:px-4 sm:py-3"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1e1e2e'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Message */}
              <div>
                <label className="font-mono text-xs text-gray-500 mb-2 block">
                  <span style={{ color: '#b026ff' }}>{'> '}</span>mensaje_
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Contame en qué puedo ayudarte..."
                  className="w-full rounded px-3 py-2 sm:px-4 sm:py-3 resize-none"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1e1e2e'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Status messages */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded px-4 py-3"
                  style={{
                    background: 'rgba(80, 250, 123, 0.1)',
                    border: '1px solid rgba(80, 250, 123, 0.3)',
                  }}
                >
                  <CheckCircle size={14} style={{ color: '#50fa7b' }} />
                  <span className="font-mono text-xs" style={{ color: '#50fa7b' }}>
                    ¡Mensaje enviado! Te respondo a la brevedad.
                  </span>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded px-4 py-3"
                  style={{
                    background: 'rgba(255, 85, 85, 0.1)',
                    border: '1px solid rgba(255, 85, 85, 0.3)',
                  }}
                >
                  <AlertCircle size={14} style={{ color: '#ff5555' }} />
                  <span className="font-mono text-xs" style={{ color: '#ff5555' }}>
                    Error al enviar. Intentá de nuevo o contactame por LinkedIn.
                  </span>
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={status === 'sending'}
                className="w-full flex items-center justify-center gap-2 rounded px-4 sm:px-6 py-2 sm:py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  border: '1px solid #b026ff',
                  color: status === 'sending' ? '#888' : '#b026ff',
                  background: 'rgba(176, 38, 255, 0.08)',
                  cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                }}
                whileHover={{ boxShadow: '0 0 20px rgba(176, 38, 255, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                {status === 'sending' ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 rounded-full"
                      style={{ borderColor: '#b026ff', borderTopColor: 'transparent' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar mensaje
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

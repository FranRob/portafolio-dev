import { motion } from 'motion/react'
import { useNavigate } from 'react-router'
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Printer,
  ChevronLeft,
} from 'lucide-react'
import { useAnalytics } from '../hooks/useAnalytics'
import StarField from './ui/StarField'
import { GithubIcon, LinkedinIcon } from './ui/BrandIcons'

// ── Types ────────────────────────────────────────────────────────

interface Experience {
  company: string
  period: string
  role: string
  desc: string
  tags: string[]
}

interface Education {
  title: string
  subtitle: string
}

interface SkillGroup {
  title: string
  skills: string[]
}

// ── Data ─────────────────────────────────────────────────────────

const experiences: Experience[] = [
  {
    company: 'Rebrit S.R.L.',
    period: 'dic. 2023 – jun. 2024 · 7 meses',
    role: 'Desarrollador Full Stack',
    desc: 'Desarrollo de módulos para aplicaciones de clientes de terceros utilizando PHP y el framework propietario de la empresa. Integración con sistemas existentes, adaptación a requerimientos específicos de cada cliente y entrega dentro de ciclos de desarrollo internos.',
    tags: ['PHP', 'Framework propietario', 'Módulos de negocio', 'Integración de sistemas'],
  },
  {
    company: 'Bourlot Maxiferretería',
    period: 'dic. 2024 – mar. 2026 · 1 año 3 meses',
    role: 'Técnico de TI',
    desc: 'Soporte, implementación y mantenimiento de equipos informáticos en empresa regional del rubro ferretero. Contacto directo con usuarios no técnicos en entornos operativos reales, lo que generó una comprensión profunda de las fricciones que enfrentan las PyMEs al adoptar tecnología: desde la resistencia al cambio hasta los requerimientos de usabilidad en herramientas de gestión.',
    tags: ['Soporte técnico', 'Hardware', 'Implementaciones', 'Entorno PyME regional'],
  },
  {
    company: 'Critical Tech Gchu',
    period: 'jul. 2025 – presente',
    role: 'Freelance — Técnico en Sistemas',
    desc: 'Primeros proyectos freelance con clientes locales: relevamiento de requerimientos, elaboración de presupuestos y documentación de planes de acción para soluciones de software.',
    tags: ['Freelance', 'Toma de requerimientos', 'Documentación'],
  },
]

const education: Education[] = [
  {
    title: 'Técnico Superior en Análisis y Desarrollo de Software',
    subtitle: 'Instituto Sedes Sapientiae · Gualeguaychú, Entre Ríos · 2022 – 2025',
  },
  {
    title: 'Marketing Digital',
    subtitle: 'Neetwork.com · 2021 – 2022',
  },
]

const skillGroups: SkillGroup[] = [
  { title: 'Backend', skills: ['Node.js', 'TypeScript', 'Express', 'PHP', 'Prisma ORM', 'Zod'] },
  { title: 'Base de datos', skills: ['PostgreSQL', 'Redis', 'MongoDB', 'Multi-tenancy'] },
  { title: 'Seguridad', skills: ['JWT', '2FA TOTP', 'OAuth 2.0', 'HMAC', 'AES', 'Rate limiting'] },
  { title: 'Testing', skills: ['TDD', 'Vitest', 'Supertest', 'Testcontainers'] },
  { title: 'Frontend', skills: ['Next.js 14', 'React', 'Tailwind CSS', 'shadcn/ui', 'Zustand'] },
  { title: 'Infra', skills: ['Docker', 'Docker Compose', 'Caddy', 'Git'] },
]

const methodologies = ['TDD', 'REST API design', 'Conventional commits', 'Documentación técnica']

interface Language {
  name: string
  level: string
}

const languages: Language[] = [
  { name: 'Español', level: 'Nativo' },
  { name: 'Inglés', level: 'Lectura técnica fluida' },
]

interface Reference {
  name: string
  lines: string[]
}

const references: Reference[] = [
  {
    name: 'Alejandra Garrigue',
    lines: ['Profesora de Ingeniería de Software', 'Instituto Sedes Sapientiae', 'Tel. institución: 03446 42-6865'],
  },
]

// ── Helpers ──────────────────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// ── Component ────────────────────────────────────────────────────

export default function CurriculumPage() {
  const sectionRef = useAnalytics('curriculum')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-base relative overflow-hidden">
      <StarField />

      {/* Toolbar */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dark-border bg-dark-card text-gray-400 hover:text-neon-cyan hover:border-neon-cyan font-mono text-xs transition-colors"
        >
          <Printer size={14} />
          Exportar PDF
        </button>
      </div>

      {/* Content */}
      <section
        ref={sectionRef}
        className="relative z-10 max-w-5xl mx-auto px-4 py-24"
      >
        {/* Back link */}
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 hover:text-neon-cyan font-mono text-xs mb-6 transition-colors"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ChevronLeft size={14} />
          Volver al portfolio
        </motion.button>

        {/* Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-neon-purple">
          {/* ── Header ──────────────────────────────────────── */}
          <div className="p-8 lg:p-10 border-b border-dark-border">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="min-w-0">
                <h1 className="font-orbitron text-3xl font-bold text-white mb-1">
                  Franco Robles
                </h1>
                <p className="font-mono text-sm text-neon-cyan mb-5">
                  Desarrollador Backend · Node.js · TypeScript · PostgreSQL
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                  <a
                    href="tel:+5493446581705"
                    className="flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors"
                  >
                    <Phone size={12} className="text-gray-600 shrink-0" />
                    +54 9 3446 581705
                  </a>

                  <a
                    href="mailto:roblesafranco@gmail.com"
                    className="flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors"
                  >
                    <Mail size={12} className="text-gray-600 shrink-0" />
                    roblesafranco@gmail.com
                  </a>

                  <a
                    href="https://divmalcentrado.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors"
                  >
                    <Globe size={12} className="text-gray-600 shrink-0" />
                    divmalcentrado.vercel.app
                  </a>

                  <a
                    href="https://www.linkedin.com/in/francorob/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors"
                  >
                    <LinkedinIcon size={12} className="text-gray-600 shrink-0" />
                    linkedin.com/in/francorob
                  </a>

                  <a
                    href="https://github.com/FranRob"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors"
                  >
                    <GithubIcon size={12} className="text-gray-600 shrink-0" />
                    github.com/FranRob
                  </a>

                  <span className="flex items-center gap-2 font-mono text-xs text-gray-400">
                    <MapPin size={12} className="text-gray-600 shrink-0" />
                    Gualeguaychú, Entre Ríos · Argentina
                  </span>
                </div>
              </div>

              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold shrink-0 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan"
              >
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                Disponible
              </div>
            </div>
          </div>

          {/* ── Body ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
            {/* ══ Main column ══════════════════════════════════ */}
            <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-dark-border">
              {/* Sobre mí */}
              <motion.div
                className="mb-10"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <p className="font-mono text-neon-cyan text-xs tracking-[0.2em] uppercase mb-1">
                  {'//'} sobre-mi
                </p>
                <h2 className="font-orbitron text-xl font-bold text-white mb-4">
                  Sobre Mí
                </h2>
                <p className="font-sans text-sm text-gray-400 leading-relaxed">
                  Técnico Superior en Análisis y Desarrollo de Software con experiencia
                  profesional en desarrollo de software y soporte técnico. Construí de forma
                  independiente una plataforma SaaS multi-tenant para barberías — incluyendo
                  autenticación avanzada (JWT + 2FA TOTP), integración con MercadoPago y
                  WhatsApp, sistema de notificaciones con retry automático y más de 130 tests
                  de integración con bases de datos reales. Mi paso por empresas regionales me
                  dio una comprensión concreta de las necesidades reales de los usuarios en
                  entornos no técnicos — contexto que aplico directamente al diseño de productos.
                </p>
              </motion.div>

              {/* Experiencia */}
              <motion.div
                className="mb-10"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <p className="font-mono text-neon-cyan text-xs tracking-[0.2em] uppercase mb-1">
                  {'//'} experiencia
                </p>
                <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                  Experiencia
                </h2>

                {experiences.map((exp) => (
                  <div
                    key={exp.company + exp.period}
                    className="mb-6 pb-6 border-b border-dark-border last:mb-0 last:pb-0 last:border-b-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-0.5">
                      <h3 className="font-sans text-sm font-semibold text-white">
                        {exp.company}
                      </h3>
                      <span className="font-mono text-[11px] text-gray-600 shrink-0">
                        {exp.period}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-neon-cyan mb-2.5">
                      {exp.role}
                    </p>
                    <p className="font-sans text-sm text-gray-400 leading-relaxed mb-3">
                      {exp.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[11px] px-2 py-0.5 rounded-sm border bg-neon-purple/10 border-neon-purple/20 text-neon-purple"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Proyecto principal */}
              <motion.div
                className="mb-10"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <p className="font-mono text-neon-cyan text-xs tracking-[0.2em] uppercase mb-1">
                  {'//'} proyecto-principal
                </p>
                <h2 className="font-orbitron text-xl font-bold text-white mb-5">
                  Proyecto Principal
                </h2>

                <div className="rounded-xl overflow-hidden border border-dark-border">
                  {/* Project header */}
                  <div
                    className="p-5 border-b border-dark-border bg-linear-to-br from-neon-purple/15 to-neon-cyan/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                      <h3 className="font-sans text-base font-semibold text-white">
                        GlowApp — SaaS Multi-Tenant para Barberías
                      </h3>
                      <span className="font-mono text-[11px] text-gray-600 shrink-0">
                        2025 – presente
                      </span>
                    </div>
                    <p className="font-mono text-xs text-neon-purple">
                      Node.js · TypeScript · PostgreSQL · Next.js · Docker
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="font-sans text-sm text-gray-400 leading-relaxed mb-4">
                      Plataforma SaaS completa construida de forma independiente. Permite a
                      múltiples barberías operar con datos completamente aislados. 15+ módulos
                      de negocio, sistema de pagos, notificaciones con retry y frontend con
                      booking público por tenant.
                    </p>

                    {/* Highlight */}
                    <div
                      className="px-4 py-3 rounded-lg mb-4 text-xs font-mono bg-neon-cyan/5 border-l-[3px] border-l-neon-cyan text-gray-400"
                    >
                      130+ tests de integración · PostgreSQL y Redis reales con Testcontainers
                      · TDD estricto
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      {[
                        'API RESTful con Express y TypeScript strict — arquitectura modular por feature',
                        'Multi-tenancy estricto: toda query filtrada por tenantId',
                        'Auth completa: JWT rotativo (15min/7d), blacklisting en Redis, 2FA TOTP con trusted devices',
                        'Tokens de terceros encriptados con AES; HMAC para OAuth state y validación de webhooks',
                        'Retry de notificaciones con SELECT FOR UPDATE SKIP LOCKED y backoff exponencial',
                        'OAuth 2.0 con MercadoPago: authorize → callback → token encriptado → rotación proactiva',
                        'Transacciones para evitar doble reserva concurrente; paginación por cursor',
                        'Deploy: Docker Compose con backend + frontend + PostgreSQL + Redis + Caddy (TLS automático)',
                      ].map((item) => (
                        <li
                          key={item}
                          className="font-sans text-sm text-gray-400 pl-4 relative"
                        >
                          <span
                            className="absolute left-0 top-0 text-neon-cyan"
                            aria-hidden="true"
                          >
                            →
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Node.js',
                        'TypeScript',
                        'Express',
                        'Prisma',
                        'PostgreSQL',
                        'Redis',
                        'Next.js',
                        'Docker',
                        'Vitest',
                        'Testcontainers',
                        'TDD',
                        'JWT · 2FA',
                        'MercadoPago',
                        'WhatsApp API',
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[11px] px-2 py-0.5 rounded-sm bg-neon-purple/10 border border-neon-purple/20 text-neon-purple"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Educación */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <p className="font-mono text-neon-cyan text-xs tracking-[0.2em] uppercase mb-1">
                  {'//'} educación
                </p>
                <h2 className="font-orbitron text-xl font-bold text-white mb-5">
                  Educación
                </h2>

                {education.map((edu) => (
                  <div key={edu.title} className="mb-4 last:mb-0">
                    <h3 className="font-sans text-sm font-semibold text-white">
                      {edu.title}
                    </h3>
                    <p className="font-mono text-xs text-gray-500">{edu.subtitle}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ══ Aside ═════════════════════════════════════════ */}
            <div className="p-8 lg:p-10">
              {/* Stack principal */}
              <motion.div
                className="mb-8"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="font-orbitron text-sm font-bold text-white mb-5">
                  Stack Principal
                </h3>

                {skillGroups.map((group) => (
                  <div key={group.title} className="mb-4 last:mb-0">
                    <p className="font-mono text-[11px] text-gray-500 tracking-wider uppercase mb-2">
                      {group.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.skills.map((skill) => (
                        <span
                          key={skill}
                          className="font-mono text-[11px] px-2.5 py-1 rounded-md border border-dark-border bg-dark-base text-gray-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Metodologías */}
              <motion.div
                className="mb-8"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="font-orbitron text-sm font-bold text-white mb-4">
                  Metodologías
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {methodologies.map((m) => (
                    <span
                      key={m}
                      className="font-mono text-[11px] px-2.5 py-1 rounded-md border border-dark-border bg-dark-base text-gray-400"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Idiomas */}
              <motion.div
                className="mb-8"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="font-orbitron text-sm font-bold text-white mb-4">
                  Idiomas
                </h3>
                {languages.map((lang) => (
                  <div key={lang.name} className="mb-2.5 last:mb-0">
                    <p className="font-sans text-sm font-semibold text-white">
                      {lang.name}
                    </p>
                    <p className="font-mono text-xs text-gray-500">{lang.level}</p>
                  </div>
                ))}
              </motion.div>

              {/* Referencias */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="font-orbitron text-sm font-bold text-white mb-4">
                  Referencias
                </h3>
                {references.map((ref) => (
                  <div key={ref.name}>
                    <p className="font-sans text-sm font-semibold text-white">
                      {ref.name}
                    </p>
                    {ref.lines.map((line, i) => (
                      <p key={i} className="font-mono text-xs text-gray-500 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center font-mono text-xs text-gray-700 mt-8">
          © 2026 Franco Robles · Curriculum Vitae
        </p>
      </section>
    </div>
  )
}

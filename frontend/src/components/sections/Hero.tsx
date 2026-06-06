import { motion, type Variants } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import StarField from '../ui/StarField'
import GlitchText from '../ui/GlitchText'
import { useAnalytics } from '../../hooks/useAnalytics'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.3,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Hero() {
  const sectionRef = useAnalytics('hero')

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Starfield background */}
      <StarField />

      {/* Grid BG */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" style={{ zIndex: 1 }} />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 pt-16 pb-16 sm:pb-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* "Hola soy" */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-base md:text-lg tracking-widest mb-3 text-neon-cyan neon-text-cyan-sm">
          Hola, soy
        </motion.p>

        {/* Name */}
        <motion.h1
          variants={itemVariants}
          className="font-orbitron font-black text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-4 neon-text-white-subtle"
        >
          Franco Robles
        </motion.h1>

        {/* Dev tag */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="font-mono text-lg sm:text-xl md:text-2xl font-bold">
            <span className="text-gray-500">// </span>
            <GlitchText
              text="divMalCentrado"
              className="neon-text-purple font-orbitron"
            />
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-sm md:text-base tracking-widest text-gray-400 mb-4 uppercase"
        >
          Full-Stack Developer{' '}
          <span className="text-neon-cyan opacity-60">·</span>{' '}
          Productos & Clientes
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-sm md:text-base text-gray-500 max-w-xl leading-relaxed mb-10"
        >
          Construyo aplicaciones web completas y las pongo en producción.
          Trabajo con clientes y equipos.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => scrollTo('projects')}
            className="cursor-pointer font-mono text-sm px-4 sm:px-8 py-3 rounded-sm transition-all duration-300 uppercase tracking-wider border border-neon-cyan text-neon-cyan bg-neon-cyan/15 hover:bg-neon-cyan/30 shadow-[0_0_16px_var(--shadow-cyan-lg)] hover:shadow-[0_0_28px_var(--shadow-cyan-lg)]"
            aria-label="Ver mis proyectos"
          >
            Ver proyectos
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="cursor-pointer font-mono text-sm px-4 sm:px-8 py-3 rounded-sm transition-all duration-300 uppercase tracking-wider border border-neon-purple/50 text-neon-purple/70 bg-transparent hover:border-neon-purple hover:text-neon-purple hover:bg-neon-purple/10"
            aria-label="Contactarme"
          >
            Contactarme
          </button>
        </motion.div>
      </motion.div>

      {/* Synthwave grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-36 sm:h-[260px]"
        style={{ zIndex: 2 }}
        aria-hidden="true"
      >
        <div
          className="synthwave-grid"
          style={{
            position: 'absolute',
            bottom: 0,
            left: '-10%',
            right: '-10%',
            height: '260px',
            transform: 'perspective(300px) rotateX(75deg)',
            transformOrigin: 'bottom center',
            maskImage: 'linear-gradient(to top, var(--mask-fade) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, var(--mask-fade) 0%, transparent 100%)',
          }}
        />
        {/* Horizon glow */}
        <div
          className="horizon-glow"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
          }}
        />
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <span className="font-mono text-xs text-gray-600 tracking-widest uppercase">scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-neon-purple"
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}

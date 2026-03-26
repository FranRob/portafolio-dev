import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import StarField from '../ui/StarField'
import GlitchText from '../ui/GlitchText'
import { useAnalytics } from '../../hooks/useAnalytics'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
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
        className="relative z-10 flex flex-col items-center text-center px-4 pt-16 pb-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* "Hola soy" */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-base md:text-lg tracking-widest mb-3"
          style={{
            color: '#00e5ff',
            textShadow: '0 0 8px rgba(0, 229, 255, 0.5)',
          }}
        >
          Hola, soy
        </motion.p>

        {/* Name */}
        <motion.h1
          variants={itemVariants}
          className="font-orbitron font-black text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-4"
          style={{
            textShadow: '0 0 30px rgba(255,255,255,0.1)',
          }}
        >
          Franco Robles
        </motion.h1>

        {/* Dev tag */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="font-mono text-xl md:text-2xl font-bold">
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
          Desarrollador Web{' '}
          <span className="text-neon-cyan opacity-60">·</span>{' '}
          Analista de Sistemas
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="font-mono text-sm md:text-base text-gray-500 max-w-xl leading-relaxed mb-10"
        >
          Próximo egresado de la Tecnicatura Superior en Análisis y Desarrollo
          de Software. Apasionado por construir experiencias web que funcionen
          de verdad.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => scrollTo('stack')}
            className="font-mono text-sm px-8 py-3 rounded transition-all duration-300 uppercase tracking-wider"
            style={{
              border: '1px solid #00e5ff',
              color: '#00e5ff',
              boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)',
              background: 'rgba(0, 229, 255, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 229, 255, 0.05)'
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.2)'
            }}
          >
            Ver mi Stack
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="font-mono text-sm px-8 py-3 rounded transition-all duration-300 uppercase tracking-wider"
            style={{
              border: '1px solid #b026ff',
              color: '#b026ff',
              boxShadow: '0 0 10px rgba(176, 38, 255, 0.2)',
              background: 'rgba(176, 38, 255, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(176, 38, 255, 0.15)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(176, 38, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(176, 38, 255, 0.05)'
              e.currentTarget.style.boxShadow = '0 0 10px rgba(176, 38, 255, 0.2)'
            }}
          >
            Contactarme
          </button>
        </motion.div>
      </motion.div>

      {/* Synthwave grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 2, height: '260px' }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '-20%',
            right: '-20%',
            height: '260px',
            backgroundImage: `
              linear-gradient(rgba(176, 38, 255, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(176, 38, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(300px) rotateX(75deg)',
            transformOrigin: 'bottom center',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          }}
        />
        {/* Horizon glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #b026ff, #ff00ff, #b026ff, transparent)',
            boxShadow: '0 0 20px #b026ff, 0 0 40px rgba(176, 38, 255, 0.5)',
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
          style={{ color: '#b026ff' }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}

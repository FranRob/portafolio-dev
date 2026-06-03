import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

interface NavLink {
  label: string
  href: string
}

const navLinks: NavLink[] = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Stack', href: '#stack' },
  { label: 'Sobre mí', href: '#about' },
  { label: 'Proyectos', href: '#projects' },
  { label: 'Contacto', href: '#contact' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleSectionClick(href: string) {
    setMenuOpen(false)
    if (isHome) {
      const id = href.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/' + href)
    }
  }

  function handleCurriculumClick() {
    setMenuOpen(false)
    if (location.pathname === '/curriculum') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/curriculum')
    }
  }

  return (
    <nav
      aria-label="Navegación principal"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-dark-base/85 backdrop-blur-xl ${
        scrolled
          ? 'border-b border-neon-purple shadow-[0_0_20px_var(--shadow-purple-sm)]'
          : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex flex-col leading-tight">
            <button
              onClick={() => handleSectionClick('#hero')}
              className="font-orbitron font-bold text-lg text-neon-purple neon-text-purple-xl bg-none border-none p-0"
              aria-label="Ir al inicio"
            >
              divMalCentrado
            </button>
            <span className="font-mono text-xs text-gray-500">
              /* margin: 0 auto; */
            </span>
          </div>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleSectionClick(link.href)}
                  className="font-mono text-sm text-gray-400 hover:text-white transition-colors duration-200 relative group"
                  aria-label={`Ir a ${link.label}`}
                >
                  <span className="text-neon-cyan opacity-60 group-hover:opacity-100 transition-opacity">
                    &gt;{' '}
                  </span>
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-neon-cyan group-hover:w-full transition-all duration-300" />
                </button>
              </li>
            ))}

            {/* Curriculum link */}
            <li>
              <button
                onClick={handleCurriculumClick}
                className={`font-mono text-sm transition-colors duration-200 relative group ${
                  location.pathname === '/curriculum'
                    ? 'text-neon-cyan'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Ir a Curriculum"
              >
                <span className="text-neon-cyan opacity-60 group-hover:opacity-100 transition-opacity">
                  &gt;{' '}
                </span>
                Curriculum
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-neon-cyan transition-all duration-300 ${
                    location.pathname === '/curriculum' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-dark-border bg-dark-base/97">
          <ul className="flex flex-col py-4 px-6 gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleSectionClick(link.href)}
                  className="font-mono text-sm text-gray-400 hover:text-white transition-colors w-full text-left py-2"
                  aria-label={`Ir a ${link.label}`}
                >
                  <span className="neon-text-cyan opacity-60">{'> '}</span>
                  {link.label}
                </button>
              </li>
            ))}

            {/* Curriculum link (mobile) */}
            <li>
              <button
                onClick={handleCurriculumClick}
                className={`font-mono text-sm transition-colors w-full text-left py-2 ${
                  location.pathname === '/curriculum'
                    ? 'text-neon-cyan'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Ir a Curriculum"
              >
                <span className="neon-text-cyan opacity-60">{'> '}</span>
                Curriculum
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}

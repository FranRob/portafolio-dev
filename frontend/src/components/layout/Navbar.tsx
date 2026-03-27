import { useState, useEffect } from 'react'
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
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleNavClick(href: string) {
    setMenuOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled
          ? '1px solid #b026ff'
          : '1px solid transparent',
        boxShadow: scrolled
          ? '0 0 20px rgba(176, 38, 255, 0.2)'
          : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex flex-col leading-tight">
            <span
              className="font-orbitron font-bold text-lg cursor-pointer"
              style={{
                color: '#b026ff',
                textShadow: '0 0 10px #b026ff, 0 0 20px rgba(176, 38, 255, 0.5)',
              }}
              onClick={() => handleNavClick('#hero')}
            >
              divMalCentrado
            </span>
            <span className="font-mono text-xs text-gray-500">
              /* margin: 0 auto; */
            </span>
          </div>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="font-mono text-sm text-gray-400 hover:text-white transition-colors duration-200 relative group"
                >
                  <span className="text-neon-cyan opacity-60 group-hover:opacity-100 transition-opacity">
                    &gt;{' '}
                  </span>
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-neon-cyan group-hover:w-full transition-all duration-300" />
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-dark-border"
          style={{ background: 'rgba(10, 10, 15, 0.97)' }}
        >
          <ul className="flex flex-col py-4 px-6 gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="font-mono text-sm text-gray-400 hover:text-white transition-colors w-full text-left py-1"
                >
                  <span className="neon-text-cyan opacity-60">{'> '}</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}

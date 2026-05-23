import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import Stack from './components/sections/Stack'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-dark-base">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
                   focus:px-4 focus:py-2 focus:bg-dark-card focus:text-neon-cyan focus:rounded-lg
                   focus:outline-2 focus:outline-neon-cyan focus:outline-offset-2 focus:shadow-lg
                   transition-none"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Stack />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

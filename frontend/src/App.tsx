import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import Stack from './components/sections/Stack'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import Login from './components/admin/Login'
import Dashboard from './components/admin/Dashboard'

function PortfolioPage() {
  return (
    <div className="min-h-screen bg-dark-base">
      <Navbar />
      <main>
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App

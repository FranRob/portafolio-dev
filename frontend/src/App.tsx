import {lazy, Suspense} from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import Stack from './components/sections/Stack'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import Login from './components/admin/Login'

// Lazy load admin dashboard for faster initial load
const Dashboard = lazy(() => import('./components/admin/Dashboard').then(m => ({ default: m.default })))

// Fallback component for lazy loading
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 border-3 rounded-full"
          style={{ borderColor: '#b026ff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
        />
        <p className="font-mono text-sm text-gray-500">Cargando...</p>
      </div>
    </div>
  )
}

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
  // Check for token in sessionStorage - cleared when browser closes
  const token = sessionStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App

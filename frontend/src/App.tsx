import {lazy, Suspense} from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Dashboard = lazy(() => import('./components/admin/Dashboard'))
const Login = lazy(() => import('./components/admin/Login'))
const PortfolioPage = lazy(() => import('./PortfolioPage'))

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<LoadingFallback />}><PortfolioPage /></Suspense>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
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

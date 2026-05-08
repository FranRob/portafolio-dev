import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { login } from '../../services/api'

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 2000, 4000] // exponential backoff

async function loginWithRetry(email: string, password: string, onRetry: (attempt: number) => void): Promise<void> {
  let lastError: unknown
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await login({ email, password })
      return // success
    } catch (err) {
      lastError = err
      
      // Only retry on network errors or 499 (cancelled)
      if (axios.isAxiosError(err)) {
        const isRetryable = !err.response || err.response.status === 499 || err.code === 'ECONNABORTED'
        if (!isRetryable || attempt === MAX_RETRIES - 1) {
          throw err
        }
      } else if (attempt === MAX_RETRIES - 1) {
        throw err
      }
      
      onRetry(attempt + 1)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]))
    }
  }
  
  throw lastError
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setRetryCount(0)
    
    try {
      await loginWithRetry(email, password, (attempt) => {
        setRetryCount(attempt)
      })
      navigate('/admin/dashboard', { replace: true })
    } catch (err: unknown) {
      // Parse error for better messaging
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          // Network error
          setError('No hay conexión con el servidor. Verificá que el backend esté funcionando.')
        } else if (err.response.status === 401) {
          setError('Email o contraseña incorrectos.')
        } else if (err.response.status === 429) {
          setError('Demasiados intentos. Esperá 15 minutos.')
        } else if (err.response.status === 499) {
          setError('La solicitud fue cancelada. Intentá de nuevo.')
        } else {
          setError(`Error ${err.response.status}: ${err.response.data?.error || 'Error desconocido'}`)
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al iniciar sesión.')
      }
    } finally {
      setLoading(false)
      setRetryCount(0)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(18, 18, 26, 0.9)',
    border: '1px solid #1e1e2e',
    color: '#e0e0e0',
    fontFamily: '"Space Mono", monospace',
    fontSize: '13px',
    width: '100%',
    borderRadius: '6px',
    padding: '12px 16px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0a0a0f' }}
    >
      {/* Grid bg */}
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className="rounded-xl p-4 sm:p-8"
          style={{
            background: '#12121a',
            border: '1px solid #1e1e2e',
            boxShadow: '0 0 40px rgba(176, 38, 255, 0.1)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'rgba(176, 38, 255, 0.1)',
                border: '1px solid rgba(176, 38, 255, 0.3)',
              }}
            >
              <Lock size={20} style={{ color: '#b026ff' }} />
            </div>
            <h1
              className="font-orbitron font-bold text-xl mb-1"
              style={{
                color: '#b026ff',
                textShadow: '0 0 10px rgba(176, 38, 255, 0.4)',
              }}
            >
              divMalCentrado
            </h1>
            <p className="font-mono text-xs text-gray-500">Panel de métricas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="font-mono text-xs text-gray-500 mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@ejemplo.com"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#b026ff'
                  e.target.style.boxShadow = '0 0 10px rgba(176, 38, 255, 0.2)'
                  e.target.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#1e1e2e'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-mono text-xs text-gray-500 mb-2 block">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#b026ff'
                  e.target.style.boxShadow = '0 0 10px rgba(176, 38, 255, 0.2)'
                  e.target.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#1e1e2e'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded px-3 py-2"
                style={{
                  background: 'rgba(255, 85, 85, 0.1)',
                  border: '1px solid rgba(255, 85, 85, 0.3)',
                }}
              >
                <AlertCircle size={13} style={{ color: '#ff5555' }} />
                <span className="font-mono text-xs" style={{ color: '#ff5555' }}>
                  {error}
                </span>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all duration-300"
              style={{
                border: '1px solid #b026ff',
                color: loading ? '#888' : '#b026ff',
                background: 'rgba(176, 38, 255, 0.1)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(176, 38, 255, 0.2)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(176, 38, 255, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(176, 38, 255, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 rounded-full"
                    style={{ borderColor: '#b026ff', borderTopColor: 'transparent' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  {retryCount > 0 ? `Reintentando (${retryCount}/${MAX_RETRIES})...` : 'Verificando...'}
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="font-mono text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              ← Volver al portfolio
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="relative z-10 border-t border-dark-border bg-dark-base py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span
              className="font-orbitron text-sm font-bold"
              style={{
                color: '#b026ff',
                textShadow: '0 0 8px rgba(176, 38, 255, 0.5)',
              }}
            >
              divMalCentrado
            </span>
            <span className="font-mono text-xs text-gray-600">
              © 2025 Franco Robles
            </span>
          </div>

          <span className="font-mono text-xs text-gray-600 text-center">
            Hecho con React y demasiado café ☕
          </span>

          <button
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-1 text-gray-700 hover:text-gray-500 transition-colors duration-200 group"
            title="Admin"
          >
            <Lock size={11} className="opacity-40 group-hover:opacity-60" />
            <span className="font-mono text-xs opacity-30 group-hover:opacity-50">
              admin
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}

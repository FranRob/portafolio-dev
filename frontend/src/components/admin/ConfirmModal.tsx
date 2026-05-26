import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'neutral'
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) {
  const glowRgb = variant === 'danger' ? '255,85,85' : '0,229,255'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop — solid color, NO backdrop-blur (carísimo) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70"
            onClick={onCancel}
          />

          {/* Modal card — sin backdrop-blur, will-change para GPU */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-sm rounded-xl bg-dark-card border p-6 shadow-2xl will-change-[transform,opacity]"
            style={{
              borderColor: `rgba(${glowRgb},0.3)`,
              boxShadow: `0 0 20px rgba(${glowRgb},0.12)`,
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `rgba(${glowRgb},0.1)`,
                  border: `1px solid rgba(${glowRgb},0.3)`,
                }}
              >
                <AlertTriangle
                  size={22}
                  className={variant === 'danger' ? 'text-red-400' : 'text-neon-cyan'}
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="font-orbitron font-bold text-sm text-center text-white mb-2">
              {title}
            </h2>

            {/* Message */}
            <p className="font-mono text-xs text-gray-400 text-center mb-6 leading-relaxed">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 font-mono text-xs px-4 py-2.5 rounded-lg border border-dark-border text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors min-h-[44px]"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 font-mono text-xs px-4 py-2.5 rounded-lg border font-bold tracking-wider transition-colors min-h-[44px]"
                style={{
                  borderColor: `rgba(${glowRgb},0.4)`,
                  color: variant === 'danger' ? '#ff5555' : '#00e5ff',
                  background: `rgba(${glowRgb},0.1)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `rgba(${glowRgb},0.2)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `rgba(${glowRgb},0.1)`
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

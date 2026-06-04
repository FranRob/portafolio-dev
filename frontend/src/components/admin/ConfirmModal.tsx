import { motion, AnimatePresence } from 'motion/react'
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
  const isDanger = variant === 'danger'
  const glowColor = isDanger ? 'var(--error-color)' : 'var(--color-neon-cyan)'
  const glowBg10 = isDanger ? 'var(--error-bg)' : 'color-mix(in srgb, var(--color-neon-cyan) 10%, transparent)'
  const glowBg20 = isDanger ? 'color-mix(in srgb, var(--error-color) 20%, transparent)' : 'color-mix(in srgb, var(--color-neon-cyan) 20%, transparent)'
  const glowBorder30 = isDanger ? 'var(--error-border)' : 'color-mix(in srgb, var(--color-neon-cyan) 30%, transparent)'
  const glowBorder40 = isDanger ? 'color-mix(in srgb, var(--error-color) 40%, transparent)' : 'color-mix(in srgb, var(--color-neon-cyan) 40%, transparent)'
  const glowShadow = isDanger ? 'color-mix(in srgb, var(--error-color) 12%, transparent)' : 'color-mix(in srgb, var(--color-neon-cyan) 12%, transparent)'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop — solid color, NO backdrop-blur-sm (carísimo) */}
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
              borderColor: glowBorder30,
              boxShadow: `0 0 20px ${glowShadow}`,
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: glowBg10,
                  border: `1px solid ${glowBorder30}`,
                }}
              >
                <AlertTriangle
                  size={22}
                  className={isDanger ? 'text-red-400' : 'text-neon-cyan'}
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
                className="cursor-pointer flex-1 font-mono text-xs px-4 py-2.5 rounded-lg border border-dark-border text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors min-h-[44px]"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="cursor-pointer flex-1 font-mono text-xs px-4 py-2.5 rounded-lg border font-bold tracking-wider transition-colors min-h-[44px]"
                style={{
                  borderColor: glowBorder40,
                  color: glowColor,
                  background: glowBg10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = glowBg20
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = glowBg10
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

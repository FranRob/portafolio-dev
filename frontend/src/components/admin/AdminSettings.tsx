import { useState, useEffect } from 'react'
import { Shield, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { getTwoFactorStatus, setupTwoFactor, enableTwoFactor, disableTwoFactor, changePassword } from '../../services/api'

const inputClass = "w-full font-mono text-sm bg-dark-card border border-dark-border rounded-md px-3 py-2 text-gray-300 focus:border-neon-purple focus:shadow-[0_0_10px_rgba(176,38,255,0.2)] outline-none transition-[border-color,box-shadow]"
const labelClass = "font-mono text-xs text-gray-500 uppercase tracking-wider block mb-1"

export default function AdminSettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 2FA setup
  const [showSetup, setShowSetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  // 2FA disable confirmation
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [disableCode, setDisableCode] = useState('')

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    fetchTwoFactorStatus()
  }, [])

  async function fetchTwoFactorStatus() {
    try {
      const status = await getTwoFactorStatus()
      setTwoFactorEnabled(status.enabled)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSetup() {
    setSaving(true)
    setError('')
    try {
      const data = await setupTwoFactor()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setShowSetup(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar código 2FA')
    } finally {
      setSaving(false)
    }
  }

  async function handleEnable() {
    if (!code) {
      setError('Ingresá el código de tu app autenticadora')
      return
    }
    setSaving(true)
    setError('')
    try {
      await enableTwoFactor(code, secret)
      setTwoFactorEnabled(true)
      setShowSetup(false)
      setCode('')
      setSuccess('2FA habilitado')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al habilitar 2FA')
    } finally {
      setSaving(false)
    }
  }

  async function handleDisable() {
    if (!disableCode) return
    
    setSaving(true)
    setError('')
    try {
      await disableTwoFactor(disableCode)
      setTwoFactorEnabled(false)
      setShowDisableConfirm(false)
      setDisableCode('')
      setSuccess('2FA deshabilitado')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al deshabilitar 2FA')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setSaving(true)
    setError('')
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess('Contraseña actualizada')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-orbitron font-bold text-sm text-white mb-6">Ajustes de Seguridad</h2>

      {error && (
        <div className="rounded-lg px-4 py-3 font-mono text-sm mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg px-4 py-3 font-mono text-sm mb-4 flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
          <CheckCircle size={14} />
          {success}
        </div>
      )}

      {/* 2FA Section */}
      <div className="rounded-lg p-6 mb-6 bg-dark-card border border-dark-border">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={20} className="text-neon-purple" />
          <h3 className="font-orbitron text-sm font-bold text-neon-purple">
            Autenticación de Dos Factores (2FA)
          </h3>
        </div>

        {loading ? (
          <div className="font-mono text-sm text-gray-500">Cargando...</div>
        ) : twoFactorEnabled ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-neon-cyan" />
                <span className="font-mono text-sm text-green-400">2FA habilitado</span>
              </div>
              {!showDisableConfirm && (
                <button
                  onClick={() => setShowDisableConfirm(true)}
                  disabled={saving}
                  className="font-mono text-xs px-4 py-2 rounded transition-colors min-h-[44px] border border-red-500/40 text-red-400 bg-transparent"
                  aria-label="Deshabilitar autenticación de dos factores"
                >
                  Deshabilitar
                </button>
              )}
            </div>
            {showDisableConfirm && (
              <div className="space-y-3 border-t border-dark-border pt-4">
                <label className={labelClass}>Código 2FA para deshabilitar</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    className={inputClass}
                    placeholder="Ingresá el código de 6 dígitos"
                  />
                  <button
                    onClick={handleDisable}
                    disabled={saving || !disableCode}
                    className="font-mono text-xs px-3 py-2 rounded min-h-[44px] bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => { setShowDisableConfirm(false); setDisableCode('') }}
                    className="font-mono text-xs px-3 py-2 rounded min-h-[44px] border border-dark-border text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : showSetup ? (
          <div>
            <p className="font-mono text-xs text-gray-400 mb-4">
              Escaneá el código QR con tu app autenticadora (Google Authenticator, Authy, etc.)
            </p>
            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Código</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingresá el código de 6 dígitos"
                className={inputClass}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEnable}
                disabled={saving || !code}
                className="font-mono text-xs px-4 py-2 rounded min-h-[44px] border border-neon-purple/40 text-neon-purple bg-neon-purple/10 disabled:opacity-50"
                aria-label="Habilitar autenticación de dos factores"
              >
                {saving ? 'Verificando...' : 'Habilitar'}
              </button>
              <button
                onClick={() => { setShowSetup(false); setQrCode(''); setCode('') }}
                className="font-mono text-xs px-4 py-2 rounded min-h-[44px] border border-dark-border text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">
              Agregá una capa extra de seguridad
            </span>
            <button
              onClick={handleSetup}
              disabled={saving}
              className="font-mono text-xs px-4 py-2 rounded min-h-[44px] border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10"
              aria-label="Configurar autenticación de dos factores"
            >
              {saving ? 'Generando...' : 'Configurar 2FA'}
            </button>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="rounded-lg p-6 bg-dark-card border border-dark-border">
        <div className="flex items-center gap-3 mb-4">
          <Key size={20} className="text-neon-cyan" />
          <h3 className="font-orbitron text-sm font-bold text-neon-cyan">
            Cambiar Contraseña
          </h3>
        </div>

        {showPasswordForm ? (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Contraseña actual</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showCurrentPassword ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
                >
                  {showCurrentPassword ? <EyeOff size={14} className="text-gray-500" /> : <Eye size={14} className="text-gray-500" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                >
                  {showNewPassword ? <EyeOff size={14} className="text-gray-500" /> : <Eye size={14} className="text-gray-500" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePasswordChange}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="font-mono text-xs px-4 py-2 rounded min-h-[44px] border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10 disabled:opacity-50"
                aria-label="Confirmar cambio de contraseña"
              >
                {saving ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
              <button
                onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }}
                className="font-mono text-xs px-4 py-2 rounded min-h-[44px] border border-dark-border text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">
              Actualizá tu contraseña periódicamente
            </span>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="font-mono text-xs px-4 py-2 rounded min-h-[44px] border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10"
              aria-label="Cambiar contraseña"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Shield, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { getTwoFactorStatus, setupTwoFactor, enableTwoFactor, disableTwoFactor, changePassword } from '../../services/api'

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  background: '#0d0d16',
  border: '1px solid #1e1e2e',
  borderRadius: '0.375rem',
  padding: '0.5rem 0.75rem',
  color: '#d1d5db',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: '0.25rem',
}

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
    const codeToDisable = prompt('Ingresá el código 2FA para deshabilitar:')
    if (!codeToDisable) return
    
    setSaving(true)
    setError('')
    try {
      await disableTwoFactor(codeToDisable)
      setTwoFactorEnabled(false)
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
        <div className="rounded-lg px-4 py-3 font-mono text-sm mb-4 flex items-center gap-2" style={{ background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.3)', color: '#ff5555' }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg px-4 py-3 font-mono text-sm mb-4 flex items-center gap-2" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff' }}>
          <CheckCircle size={14} />
          {success}
        </div>
      )}

      {/* 2FA Section */}
      <div className="rounded-lg p-6 mb-6" style={{ background: '#12121a', border: '1px solid #1e1e2e' }}>
        <div className="flex items-center gap-3 mb-4">
          <Shield size={20} style={{ color: '#b026ff' }} />
          <h3 className="font-orbitron text-sm font-bold" style={{ color: '#b026ff' }}>
            Autenticación de Dos Factores (2FA)
          </h3>
        </div>

        {loading ? (
          <div className="font-mono text-sm text-gray-500">Cargando...</div>
        ) : twoFactorEnabled ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} style={{ color: '#00e5ff' }} />
              <span className="font-mono text-sm text-green-400">2FA habilitado</span>
            </div>
            <button
              onClick={handleDisable}
              disabled={saving}
              className="font-mono text-xs px-4 py-2 rounded transition-colors"
              style={{ border: '1px solid rgba(255,85,85,0.4)', color: '#ff5555', background: 'transparent' }}
            >
              Deshabilitar
            </button>
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
              <label style={labelStyle}>Código</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingresá el código de 6 dígitos"
                style={inputStyle}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEnable}
                disabled={saving || !code}
                className="font-mono text-xs px-4 py-2 rounded"
                style={{ border: '1px solid rgba(176,38,255,0.4)', color: '#b026ff', background: 'rgba(176,38,255,0.1)', opacity: saving ? 0.5 : 1 }}
              >
                {saving ? 'Verificando...' : 'Habilitar'}
              </button>
              <button
                onClick={() => { setShowSetup(false); setQrCode(''); setCode('') }}
                className="font-mono text-xs px-4 py-2 rounded"
                style={{ border: '1px solid #1e1e2e', color: '#666' }}
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
              className="font-mono text-xs px-4 py-2 rounded"
              style={{ border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', background: 'rgba(0,229,255,0.1)' }}
            >
              {saving ? 'Generando...' : 'Configurar 2FA'}
            </button>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="rounded-lg p-6" style={{ background: '#12121a', border: '1px solid #1e1e2e' }}>
        <div className="flex items-center gap-3 mb-4">
          <Key size={20} style={{ color: '#00e5ff' }} />
          <h3 className="font-orbitron text-sm font-bold" style={{ color: '#00e5ff' }}>
            Cambiar Contraseña
          </h3>
        </div>

        {showPasswordForm ? (
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Contraseña actual</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showCurrentPassword ? <EyeOff size={14} style={{ color: '#666' }} /> : <Eye size={14} style={{ color: '#666' }} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? <EyeOff size={14} style={{ color: '#666' }} /> : <Eye size={14} style={{ color: '#666' }} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePasswordChange}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="font-mono text-xs px-4 py-2 rounded"
                style={{ border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', background: 'rgba(0,229,255,0.1)', opacity: saving ? 0.5 : 1 }}
              >
                {saving ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
              <button
                onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }}
                className="font-mono text-xs px-4 py-2 rounded"
                style={{ border: '1px solid #1e1e2e', color: '#666' }}
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
              className="font-mono text-xs px-4 py-2 rounded"
              style={{ border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', background: 'rgba(0,229,255,0.1)' }}
            >
              Cambiar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
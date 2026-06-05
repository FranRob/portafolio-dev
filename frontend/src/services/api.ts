import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Important: allow cookies to be sent with requests
  withCredentials: true,
})

// Track if we're in the middle of a login request
let isLoggingIn = false
let isLoggingOut = false

// Use sessionStorage - data is cleared when browser is closed (more secure)
const storage = sessionStorage

// Read a cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

// Request interceptor: use token from sessionStorage for Authorization header
api.interceptors.request.use((config) => {
  // Skip redirect for login requests (no session yet)
  if (config.url?.includes('/auth/login')) {
    return config
  }
  
  // Add token from sessionStorage (set by login) - more secure for cross-origin
  const token = storage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // CSRF protection: send x-csrf-token header on state-changing requests
  // Read from sessionStorage first (cross-origin production), fallback to cookie (same-origin local dev)
  if (config.method && !['get', 'head', 'options'].includes(config.method)) {
    const csrfToken = storage.getItem('csrf_token') || getCookie('csrf-token')
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken
    }
  }

  // Check if session exists
  const hasSession = token || storage.getItem('has_session')
  
  if (!hasSession && !isLoggingIn && !isLoggingOut) {
    // No session - redirect to login if on admin route
    if (window.location.pathname.startsWith('/admin')) {
      window.location.pathname = '/admin/login'
    }
  }
  return config
})

// Token refresh state — evita múltiples refreshes simultáneos
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

// Response interceptor: handle 401/expired tokens with auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh')
    const isLoginOrLogout =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/logout')

    // No reintentar login, logout, ni el propio refresh
    if (isLoginOrLogout || isRefreshEndpoint || !error.response || error.response.status !== 401) {
      return Promise.reject(error)
    }

    // Si ya hay un refresh en curso, encolar esta request para reintentarla después
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    isRefreshing = true

    try {
      const res = await api.post<{ accessToken: string; csrfToken?: string }>('/auth/refresh')
      const newToken = res.data.accessToken

      storage.setItem('admin_token', newToken)
      storage.setItem('has_session', 'true')
      if (res.data.csrfToken) {
        storage.setItem('csrf_token', res.data.csrfToken)
      }

      // Reintentar todas las requests encoladas
      processQueue(null, newToken)

      // Reintentar la request original
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)

      // Refresh falló — limpiar sesión
      storage.removeItem('has_session')
      storage.removeItem('admin_token')
      storage.removeItem('csrf_token')

      if (window.location.pathname.startsWith('/admin')) {
        window.location.pathname = '/admin/login'
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// Auth
export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    createdAt: string
  }
  accessToken?: string
  csrfToken?: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  isLoggingIn = true
  try {
    const res = await api.post<LoginResponse>('/auth/login', payload)
    if (res.data.accessToken) {
      storage.setItem('admin_token', res.data.accessToken)
    }
    if (res.data.csrfToken) {
      storage.setItem('csrf_token', res.data.csrfToken)
    }
    storage.setItem('has_session', 'true')
    return res.data
  } finally {
    isLoggingIn = false
  }
}

// Logout - call the backend to revoke tokens
export async function logout(): Promise<void> {
  isLoggingOut = true
  try {
    await api.post('/auth/logout')
  } finally {
    isLoggingOut = false
    storage.removeItem('has_session')
    storage.removeItem('admin_token')
    storage.removeItem('admin_active_tab')
  }
}

// Analytics
export async function trackSection(section: string): Promise<void> {
  await api.post('/analytics/track', { section })
}

export interface AnalyticsStats {
  totalVisits: number
  todayVisits: number
  mostViewedSection: string
  unreadMessages: number
  sectionViews: Record<string, number>
  dailyVisits: { date: string; count: number }[]
}

export async function getStats(): Promise<AnalyticsStats> {
  const res = await api.get<AnalyticsStats>('/analytics/stats')
  return res.data
}

// Contact
export interface ContactPayload {
  name: string
  email: string
  message: string
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  await api.post('/contact', payload)
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
  read: boolean
  category: string | null
}

export async function getMessages(): Promise<ContactMessage[]> {
  const res = await api.get<ContactMessage[]>('/contact/messages')
  return res.data
}

export async function markMessageRead(id: string): Promise<void> {
  await api.patch(`/contact/${id}/read`)
}

export async function markMessageUnread(id: string): Promise<void> {
  await api.patch(`/contact/${id}/unread`)
}

export async function moveMessage(id: string, category: string): Promise<void> {
  await api.patch(`/contact/${id}/category`, { category })
}

export async function deleteMessage(id: string): Promise<void> {
  await api.delete(`/contact/${id}`)
}

// Projects
export interface Project {
  id: string
  title: string
  description: string
  stack: string[]
  status: 'in_progress' | 'completed' | 'private'
  category: 'freelance' | 'personal' | 'collaborative'
  featured: boolean
  order: number
  slug: string
  repoUrl: string | null
  demoUrl: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectDetail extends Project {
  content: string | null
}

export interface ProjectPayload {
  title: string
  description: string
  stack: string[]
  status: 'in_progress' | 'completed' | 'private'
  category?: 'freelance' | 'personal' | 'collaborative'
  featured?: boolean
  order?: number
  slug?: string
  repoUrl?: string | null
  demoUrl?: string | null
  imageUrl?: string | null
  content?: string | null
}

export async function getProjects(): Promise<Project[]> {
  const res = await api.get<Project[]>('/projects')
  return res.data
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail> {
  const res = await api.get<ProjectDetail>(`/projects/${slug}`)
  return res.data
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const res = await api.post<Project>('/projects', payload)
  return res.data
}

export async function updateProject(id: string, payload: Partial<ProjectPayload>): Promise<Project> {
  const res = await api.patch<Project>(`/projects/${id}`, payload)
  return res.data
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`)
}

// 2FA
export interface TwoFactorStatus {
  enabled: boolean
}

export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  const res = await api.get<TwoFactorStatus>('/auth/2fa/status')
  return res.data
}

export interface TwoFactorSetup {
  secret: string
  qrCode: string
}

export async function setupTwoFactor(): Promise<TwoFactorSetup> {
  const res = await api.post<TwoFactorSetup>('/auth/2fa/setup')
  return res.data
}

export async function enableTwoFactor(code: string, secret: string): Promise<{ success: boolean }> {
  const res = await api.post<{ success: boolean }>('/auth/2fa/enable', { code, secret })
  return res.data
}

export async function disableTwoFactor(code: string): Promise<{ success: boolean }> {
  const res = await api.post<{ success: boolean }>('/auth/2fa/disable', { code })
  return res.data
}

// Password
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  const res = await api.patch<{ success: boolean }>('/auth/password', {
    currentPassword,
    newPassword,
  })
  return res.data
}

export default api
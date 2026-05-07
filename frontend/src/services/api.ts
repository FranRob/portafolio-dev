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

// Request interceptor: check if accessToken cookie exists
api.interceptors.request.use((config) => {
  // Skip redirect for login/logout requests
  if (config.url?.includes('/auth/login') || config.url?.includes('/auth/logout')) {
    return config
  }
  
  // Check if accessToken cookie exists (set by login via HTTP-only cookie)
  // We can't read HTTP-only cookies from JS, but we can check localStorage as a fallback
  const hasSession = document.cookie.includes('accessToken=') || localStorage.getItem('has_session')
  
  if (!hasSession && !isLoggingIn && !isLoggingOut) {
    // No session - redirect to login if on admin route
    if (window.location.pathname.startsWith('/admin')) {
      window.location.pathname = '/admin/login'
    }
  }
  return config
})

// Response interceptor: handle 401/expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip redirect for login/logout responses
    if (error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/logout')) {
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401) {
      // Clear session flag
      localStorage.removeItem('has_session')
      // Redirect to login
      if (window.location.pathname.startsWith('/admin')) {
        window.location.pathname = '/admin/login'
      }
    }
    }
    return Promise.reject(error)
  },
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
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  isLoggingIn = true
  try {
    const res = await api.post<LoginResponse>('/auth/login', payload)
    // Mark that we have a session (for checking in interceptor)
    // We can't read the HTTP-only cookie, but we know login succeeded
    localStorage.setItem('has_session', 'true')
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
    localStorage.removeItem('has_session')
    localStorage.removeItem('admin_active_tab')
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
  repoUrl: string | null
  demoUrl: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectPayload {
  title: string
  description: string
  stack: string[]
  status: 'in_progress' | 'completed' | 'private'
  category?: 'freelance' | 'personal' | 'collaborative'
  featured?: boolean
  order?: number
  repoUrl?: string | null
  demoUrl?: string | null
  imageUrl?: string | null
}

export async function getProjects(): Promise<Project[]> {
  const res = await api.get<Project[]>('/projects')
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

export default api
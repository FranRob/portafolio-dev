import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.hash = '/admin/login'
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
  token: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', payload)
  return res.data
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
}

export async function getMessages(): Promise<ContactMessage[]> {
  const res = await api.get<ContactMessage[]>('/contact/messages')
  return res.data
}

export async function markMessageRead(id: string): Promise<void> {
  await api.patch(`/contact/${id}/read`)
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

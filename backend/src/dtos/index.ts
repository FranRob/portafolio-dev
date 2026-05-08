// =====================================================
// Response Types - Consistent API output types
// =====================================================

// -------------------
// PROJECT Response Types
// -------------------

export interface ProjectResponse {
  id: string;
  title: string;
  description: string;
  stack: string[];
  status: 'in_progress' | 'completed' | 'private';
  category: 'freelance' | 'personal' | 'collaborative';
  featured: boolean;
  order: number;
  repoUrl: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  stack: string[];
  status: 'in_progress' | 'completed' | 'private';
  category?: 'freelance' | 'personal' | 'collaborative';
  featured?: boolean;
  order?: number;
  repoUrl?: string | null;
  demoUrl?: string | null;
  imageUrl?: string | null;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  // All fields optional for updates
}

// -------------------
// AUTH Response Types
// -------------------

export interface AuthUserResponse {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// -------------------
// CONTACT Response Types
// -------------------

export interface ContactMessageResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  category: string | null;
  createdAt: string;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  message: string;
}

// -------------------
// ANALYTICS Response Types
// -------------------

export interface AnalyticsStatsResponse {
  totalVisits: number;
  todayVisits: number;
  mostViewedSection: string;
  unreadMessages: number;
  sectionViews: Record<string, number>;
  dailyVisits: { date: string; count: number }[];
}

export interface TrackViewRequest {
  section: string;
}

// -------------------
// Generic API Response Types
// -------------------

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  count: number;
}
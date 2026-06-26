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
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetailResponse extends ProjectResponse {
  content: string | null;
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
  content?: string | null;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  slug?: string;
}

// -------------------
// SERVICE Response Types
// -------------------

export interface ServiceResponse {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  iconName: string | null;
  imageUrl: string | null;
  stack: string[];
  deliverables: string[];
  estimatedTimeline: string | null;
  priceRange: string | null;
  isActive: boolean;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDetailResponse extends ServiceResponse {
  content: string | null;
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  stack: string[];
  deliverables?: string[];
  tagline?: string | null;
  iconName?: string | null;
  imageUrl?: string | null;
  estimatedTimeline?: string | null;
  priceRange?: string | null;
  isActive?: boolean;
  featured?: boolean;
  order?: number;
  content?: string | null;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  slug?: string;
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

export interface ContactCategoryResponse {
  name: string;
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
  referrerStats: { source: string; count: number }[];
  deviceStats: { type: string; count: number }[];
}

export interface TrackViewRequest {
  section: string;
  sessionId?: string;
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
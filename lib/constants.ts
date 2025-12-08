// Application constants

export const APP_NAME = 'Ivory';
export const APP_DESCRIPTION = 'AI-powered nail design platform connecting clients with nail techs';

// User roles
export const USER_TYPES = {
  CLIENT: 'client',
  TECH: 'tech',
} as const;

// Request statuses
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  MODIFIED: 'modified',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

// Auth providers
export const AUTH_PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
  APPLE: 'apple',
} as const;

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rating
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// API Routes
export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
  },
  USERS: {
    BASE: '/api/users',
    UPDATE_TYPE: '/api/users/update-type',
  },
  LOOKS: {
    BASE: '/api/looks',
    BY_ID: (id: string | number) => `/api/looks/${id}`,
  },
  DESIGN_REQUESTS: {
    BASE: '/api/design-requests',
    BY_ID: (id: string | number) => `/api/design-requests/${id}`,
  },
  TECH_PROFILES: {
    BASE: '/api/tech-profiles',
  },
} as const;

// App Routes
export const APP_ROUTES = {
  HOME: '/home',
  LOGIN: '/',
  USER_TYPE: '/user-type',
  PERMISSIONS: '/permissions',
  CAPTURE: '/capture',
  EDITOR: '/editor',
  PROFILE: '/profile',
  LOOK: (id: string | number) => `/look/${id}`,
  SHARE: (id: string | number) => `/share/${id}`,
  SEND_TO_TECH: (id: string | number) => `/send-to-tech/${id}`,
  TECH: {
    DASHBOARD: '/tech/dashboard',
    PROFILE_SETUP: '/tech/profile-setup',
    REVIEW: (id: string | number) => `/tech/review/${id}`,
  },
} as const;

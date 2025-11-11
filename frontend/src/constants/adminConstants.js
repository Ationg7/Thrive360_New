// Admin Dashboard Constants
// Following Clean Code Principle: Extract Magic Numbers and Strings

// Import API endpoints from centralized config
import { API_ENDPOINTS } from '../config/api.js';

// Re-export for backward compatibility
export { API_ENDPOINTS };

export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
  ADMIN_USER: 'adminUser',
};

export const ROUTES = {
  ADMIN_LOGIN: '/admin-login',
  ADMIN_DASHBOARD: '/admin-dashboard',
  USERS_MANAGEMENT: '/admin/users',
  POSTS_MANAGEMENT: '/admin/posts',
  CHALLENGES_MANAGEMENT: '/admin/challenges',
  MEDITATION_MANAGEMENT: '/admin/meditation',
  BLOGS_MANAGEMENT: '/admin/blogs',
  REPORTS: '/admin/reports',
  PSYCHIATRISTS: '/admin/psychiatrists',
  SETTINGS: '/admin/settings',
  EVENTS_MANAGEMENT: '/admin/events',
  PASSWORD_RESET: '/admin/password-reset',
  PROFILE_COVERS: '/admin/profile-covers'
};

export const COLORS = {
  PRIMARY: '#007bff',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  PURPLE: '#6f42c1',
  LIGHT: '#f8f9fa',
  WHITE: '#ffffff',
  DARK: '#333333',
  GRAY: '#666666',
};

export const LAYOUT = {
  MAX_WIDTH: '1200px',
  CARD_PADDING: '30px',
  BUTTON_PADDING: '15px 25px',
  BORDER_RADIUS: '10px',
  SHADOW: '0 2px 10px rgba(0,0,0,0.1)',
  GAP: '20px',
};

export const MESSAGES = {
  LOADING: 'Loading Admin Dashboard...',
  LOGOUT_CONFIRM: 'Are you sure you want to logout?',
  FEATURE_COMING_SOON: 'This feature is coming soon!',
  ERROR_FETCHING_DATA: 'Failed to fetch dashboard data',
  ERROR_GENERIC: 'An error occurred. Please try again.',
};

export const STATS_LABELS = {
  TOTAL_USERS: 'Total Users',
  ACTIVE_USERS: 'Active Users',
  TOTAL_POSTS: 'Total Posts',
  TOTAL_CHALLENGES: 'Total Challenges',
};

export const NAVIGATION_BUTTONS = [
  { id: 'users', label: 'Users', color: COLORS.SUCCESS, route: ROUTES.USERS_MANAGEMENT, badge: 0 },
  { id: 'posts', label: 'Posts', color: COLORS.PRIMARY, route: ROUTES.POSTS_MANAGEMENT, badge: 0 },
  { id: 'challenges', label: 'Challenges', color: COLORS.WARNING, route: ROUTES.CHALLENGES_MANAGEMENT, badge: 0 },
  { id: 'meditation', label: 'Meditation', color: '#e91e63', route: ROUTES.MEDITATION_MANAGEMENT, badge: 0 },
  { id: 'blogs', label: 'Health Blogs', color: '#9c27b0', route: ROUTES.BLOGS_MANAGEMENT, badge: 0 },
  { id: 'reports', label: 'Reports', color: COLORS.INFO, route: ROUTES.REPORTS, badge: 0 },
  { id: 'psychiatrists', label: 'Psychiatrists', color: '#16a085', route: ROUTES.PSYCHIATRISTS, badge: 0 },
  { id: 'events', label: 'Events', color: COLORS.PURPLE, route: ROUTES.EVENTS_MANAGEMENT, badge: 0 },
  { id: 'password-reset', label: 'Password Reset', color: '#ff6b35', route: ROUTES.PASSWORD_RESET, badge: 0 },
  { id: 'profile-covers', label: 'Profile Cover', color: COLORS.INFO, route: ROUTES.PROFILE_COVERS, badge: 0 },
];

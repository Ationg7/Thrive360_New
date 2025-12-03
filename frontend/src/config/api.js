// API Configuration
// This file centralizes all API endpoints and base URLs

// Get the current hostname and port to construct the API base URL dynamically
const getApiBaseUrl = () => {
  // In development, use localhost:8000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }
  
  // In production, use the same hostname as the frontend but with port 8000
  // You can modify this logic based on your deployment setup
  return `${window.location.protocol}//${window.location.hostname}:8000/api`;
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to get storage URL for images
export const getStorageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /storage, prepend the base URL
  if (imagePath.startsWith('/storage')) {
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  }
  
  // Otherwise, construct the full storage URL
  return `${API_BASE_URL.replace('/api', '')}/storage/${imagePath}`;
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  LOGOUT: `${API_BASE_URL}/logout`,
  
  // Freedom Wall
  FREEDOM_WALL_POSTS: `${API_BASE_URL}/freedom-wall/posts`,
  FREEDOM_WALL_POSTS_AUTH: `${API_BASE_URL}/freedom-wall/posts/auth`,
  FREEDOM_WALL_SAVED_POSTS: `${API_BASE_URL}/freedom-wall/saved-posts`,
  FREEDOM_WALL_MY_POSTS: `${API_BASE_URL}/freedom-wall/my-posts`,
  
  // Challenges
  CHALLENGES: `${API_BASE_URL}/challenges`,
  CHALLENGES_HISTORY: `${API_BASE_URL}/challenges/history`,
  
  // Events
  EVENTS: `${API_BASE_URL}/events`,
  EVENTS_SUGGESTIONS: `${API_BASE_URL}/events/suggestions`,
  
  // Todos
  TODOS: `${API_BASE_URL}/todos`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  
  // Password Reset
  PASSWORD_RESET_REQUEST: `${API_BASE_URL}/password-reset/request-code`,
  PASSWORD_RESET_CHECK: `${API_BASE_URL}/password-reset/check-request`,
  PASSWORD_RESET_VERIFY: `${API_BASE_URL}/password-reset/verify-code`,
  PASSWORD_RESET_RESET: `${API_BASE_URL}/password-reset/reset`,
  
  // Admin
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_POSTS: `${API_BASE_URL}/admin/posts`,
  ADMIN_CHALLENGES: `${API_BASE_URL}/admin/challenges`,
  ADMIN_MEDITATION: `${API_BASE_URL}/admin/meditation`,
  ADMIN_BLOGS: `${API_BASE_URL}/admin/blogs`,
  ADMIN_ANALYTICS: `${API_BASE_URL}/admin/analytics`,
  ADMIN_EVENTS: `${API_BASE_URL}/admin/events`,
  ADMIN_PSYCHIATRISTS: `${API_BASE_URL}/admin/psychiatrists`,
  ADMIN_PSYCHIATRISTS_ACTIVE: `${API_BASE_URL}/admin/psychiatrists/active`,
  ADMIN_PROFILE_COVERS: `${API_BASE_URL}/admin/profile-covers`,
  ADMIN_REPORTS: `${API_BASE_URL}/admin/reports`,
  ADMIN_REPORTS_STATS: `${API_BASE_URL}/admin/reports/stats`,
  ADMIN_SETTINGS: `${API_BASE_URL}/admin/settings`,
  ADMIN_SETTINGS_RESET: `${API_BASE_URL}/admin/settings/reset`,
  
  // Backward compatibility aliases
  DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
  USERS: `${API_BASE_URL}/admin/users`,
  POSTS: `${API_BASE_URL}/admin/posts`,
  MEDITATION: `${API_BASE_URL}/admin/meditation`,
  BLOGS: `${API_BASE_URL}/admin/blogs`,
  CHALLENGES: `${API_BASE_URL}/admin/challenges`,
  EVENTS_LIST: `${API_BASE_URL}/events`,
  UPLOAD_CHALLENGE: `${API_BASE_URL}/admin/challenges`,
  UPLOAD_MEDITATION: `${API_BASE_URL}/admin/meditation`,
  UPLOAD_BLOG: `${API_BASE_URL}/admin/blogs`,
  UPLOAD_EVENT: `${API_BASE_URL}/events`,
  PROFILE_COVERS: `${API_BASE_URL}/admin/profile-covers`,
  
  // User Profile
  USER_PROFILE: `${API_BASE_URL}/user/profile`,
  USER_PROFILE_COVER: `${API_BASE_URL}/user/profile-cover`,
  USER_CHANGE_PASSWORD: `${API_BASE_URL}/user/change-password`,
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  
  // Merge with provided options
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  return fetch(url, finalOptions);
};


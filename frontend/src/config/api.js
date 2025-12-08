// API Configuration
// This file centralizes all API endpoints and base URLs

// Helper to check if hostname is an IP address
const isIPAddress = (hostname) => {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
};

// Get the current hostname and port to construct the API base URL dynamically
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Desktop/Mobile View: localhost - use same hostname to avoid CORS issues
  // This ensures frontend (localhost:5173) and API (localhost:8000) are same origin
  if (hostname === 'localhost') {
    return `${protocol}//localhost:8000/api`;
  }
  
  // Desktop: 127.0.0.1 - use same hostname for consistency
  if (hostname === '127.0.0.1') {
    return `${protocol}//127.0.0.1:8000/api`;
  }
  
  // Mobile/Network: If accessing via IP address, use same IP for API
  // This handles mobile devices accessing the dev server via network IP
  if (isIPAddress(hostname)) {
    return `${protocol}//${hostname}:8000/api`;
  }
  
  // Production or other hostnames: use same hostname with port 8000
  return `${protocol}//${hostname}:8000/api`;
};

// Make API_BASE_URL a function to recalculate dynamically if needed
export const getApiBaseUrlDynamic = () => getApiBaseUrl();

// Export static version for backward compatibility
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


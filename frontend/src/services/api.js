// API service functions for Thrive360
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to get admin auth headers
const getAdminAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Freedom Wall API calls
export const freedomWallAPI = {
  // Get all posts
  getPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/freedom-wall/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  // Create new post
  createPost: async (postData) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    if (postData.image) {
      formData.append('image', postData.image);
    }

    const response = await fetch(`${API_BASE_URL}/freedom-wall/posts`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeaders().Authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }
    return response.json();
  },

  // Like a post
  likePost: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/freedom-wall/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to like post');
    return response.json();
  },

  // Share a post
  sharePost: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/freedom-wall/posts/${postId}/share`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to share post');
    return response.json();
  },

  // Delete a post
  deletePost: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/freedom-wall/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return response.json();
  },
};

// Challenges API calls
export const challengesAPI = {
  // Get all challenges
  getChallenges: async () => {
    const response = await fetch(`${API_BASE_URL}/challenges`);
    if (!response.ok) throw new Error('Failed to fetch challenges');
    return response.json();
  },

  // Get single challenge
  getChallenge: async (id) => {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}`);
    if (!response.ok) throw new Error('Failed to fetch challenge');
    return response.json();
  },

  // Create new challenge
  createChallenge: async (challengeData) => {
    console.log('API: Creating challenge with data:', challengeData);
    console.log('API: Headers:', getAuthHeaders());
    console.log('API: URL:', `${API_BASE_URL}/challenges`);
    
    const response = await fetch(`${API_BASE_URL}/challenges`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(challengeData),
    });

    console.log('API: Response status:', response.status);
    console.log('API: Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.log('API: Error response:', error);
      throw new Error(error.message || error.errors || 'Failed to create challenge');
    }
    return response.json();
  },

  // Update challenge
  updateChallenge: async (id, challengeData) => {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(challengeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update challenge');
    }
    return response.json();
  },

  // Delete challenge
  deleteChallenge: async (id) => {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete challenge');
    return response.json();
  },

  // Join challenge
  joinChallenge: async (id) => {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join challenge');
    }
    return response.json();
  },

  // Update progress
  updateProgress: async (id, progressData) => {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update progress');
    }
    return response.json();
  },

  // Get user progress
  getUserProgress: async (id) => {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}/progress`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  },

  // Get current user's challenge history
  getUserHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/challenges/history`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch challenge history');
    return response.json();
  },
};

// Admin API calls
export const adminAPI = {
  // Dashboard statistics
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  },

  // User management
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  updateUser: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  // Content management
  getPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/posts`, {
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  deletePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return response.json();
  },

  getChallenges: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/challenges`, {
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch challenges');
    return response.json();
  },

  deleteChallenge: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/challenges/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete challenge');
    return response.json();
  },

  // Analytics
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: getAdminAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },
};

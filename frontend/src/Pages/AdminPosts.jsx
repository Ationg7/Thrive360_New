// AdminPosts Page - Posts Management
// Fetch posts including images from FreedomWall API
import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminPosts.css';

const AdminPosts = memo(() => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Convert backend image path to URL
  const toImageUrl = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `http://127.0.0.1:8000/${img}`;
  };

  // Fetch posts from Freedom Wall API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/freedom-wall/posts', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
          navigate(ROUTES.ADMIN_LOGIN);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

     const normalizedPosts = (Array.isArray(data) ? data : []).map((p) => {
  const imageUrl = p.image_url || (p.image_path ? `http://127.0.0.1:8000/storage/${p.image_path}` : null);

  const userName = p.user?.name || p.author || 'Guest User';
  const userEmail = p.user?.email || p.email || '';
  const isGuest = !p.user && !p.author;

  return {
    id: p.id,
    content: p.content,
    created_at: p.created_at,
    likes_count: p.likes || 0,
    shares_count: p.saves || 0,
    is_guest_post: isGuest,
    user: {
      name: userName,
      email: userEmail,
    },
    image_url: imageUrl,
  };
});



      setPosts(normalizedPosts);
      setSuccess('Posts loaded successfully');
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Delete post
  const handleDeletePost = useCallback(
    async (postId) => {
      if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

      try {
        const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
        const response = await fetch(`${API_ENDPOINTS.POSTS}/${postId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        setPosts((prev) => prev.filter((post) => post.id !== postId));
        setSuccess('Post deleted successfully');
        clearMessages();
      } catch (err) {
        console.error('Error deleting post:', err);
        setError(err.message || 'Failed to delete post');
      }
    },
    [clearMessages]
  );

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.user && post.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType =
      filterType === 'all' ||
      (filterType === 'user' && !post.is_guest_post) ||
      (filterType === 'guest' && post.is_guest_post);
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading)
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Posts...</h3>
        </div>
      </div>
    );

  return (
    <ErrorBoundary>
      <div className="admin-posts-page">
        <MessageDisplay error={error} success={success} onDismiss={clearMessages} />

        <div className="admin-page-header">
          <div className="admin-page-header-content">
            <h1 className="admin-page-title">Posts Management</h1>
            <p className="admin-page-subtitle">Manage all posts in the Freedom Wall</p>
          </div>
        </div>

        <div className="admin-filters">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="Search posts by content or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-filter-group">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Posts</option>
              <option value="user">User Posts</option>
              <option value="guest">Guest Posts</option>
            </select>
          </div>
        </div>

        <div className="admin-posts-container">
          <div className="admin-posts-header">
            <h3>Posts ({filteredPosts.length})</h3>
            <button onClick={fetchPosts} className="admin-refresh-btn">
              Refresh
            </button>
          </div>

          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                   <div className="post-author-avatar">
  {post.user.email
    ? post.user.email.substring(0, 2).toUpperCase()
    : 'GU'}
</div>

                    <div className="post-author-info">
                      <div className="post-author-name">{post.user ? post.user.name : 'Guest User'}</div>
                      <div className="post-author-email">{post.user ? post.user.email : 'Anonymous'}</div>
                    </div>
                  </div>
                  <div className="post-meta">
                    <span className={`post-type-badge ${post.is_guest_post ? 'guest' : 'user'}`}>
                      {post.is_guest_post ? 'Guest' : 'User'}
                    </span>
                    <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {post.image_url && (
                  <div className="post-image">
                    <img src={toImageUrl(post.image_url)} alt="Post media" />
                  </div>
                )}

                <div className="post-content">
                  <p>{post.content}</p>
                </div>

                <div className="post-stats">
                  <div className="post-stat">
                    <span className="stat-icon">👍</span>
                    <span>{post.likes_count || 0}</span>
                  </div>
                  <div className="post-stat">
                    <span className="stat-icon">📤</span>
                    <span>{post.shares_count || 0}</span>
                  </div>
                </div>

                <div className="post-actions">
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="action-btn delete"
                    title="Delete Post"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}

            {filteredPosts.length === 0 && (
              <div className="admin-empty-state">
                <p>No posts found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

AdminPosts.displayName = 'AdminPosts';

export default AdminPosts;

// AdminBlogs Page - Health Blog Content Management
// Following Clean Code Principles

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES, MESSAGES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminBlogs.css';

const AdminBlogs = memo(() => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Mental Health',
    tags: '',
    imageFile: null
  });
  const navigate = useNavigate();

  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Fetch blogs data
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch(API_ENDPOINTS.BLOGS, {
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
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
      setBlogs(data);
      setSuccess('Health blogs loaded successfully');
      
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError(error.message || 'Failed to fetch health blogs');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Handle file upload
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  // Upload new blog
  const handleUpload = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('content', uploadData.content);
      formData.append('excerpt', uploadData.excerpt);
      formData.append('category', uploadData.category);
      formData.append('tags', uploadData.tags);
      if (uploadData.imageFile) {
        formData.append('image_file', uploadData.imageFile);
      }

      const response = await fetch(API_ENDPOINTS.UPLOAD_BLOG, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) message = errorData.message;
          if (errorData?.errors) {
            const firstError = Object.values(errorData.errors)[0];
            if (Array.isArray(firstError) && firstError.length) message = firstError[0];
          }
        } catch {}
        throw new Error(message);
      }

      const newBlog = await response.json();
      setBlogs(prev => [newBlog, ...prev]);
      setSuccess('Health blog uploaded successfully');
      setShowUploadModal(false);
      setUploadData({
        title: '',
        content: '',
        excerpt: '',
        category: 'Mental Health',
        tags: '',
        imageFile: null
      });
      fetchBlogs();
      clearMessages();
      
    } catch (error) {
      console.error('Error uploading blog:', error);
      setError(error.message || 'Failed to upload health blog');
    }
  }, [uploadData, fetchBlogs, clearMessages]);

  // Delete blog
  const handleDeleteBlog = useCallback(async (blogId, blogTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      const response = await fetch(`${API_ENDPOINTS.BLOGS}/${blogId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
      setSuccess(`Blog "${blogTitle}" deleted successfully`);
      clearMessages();
      
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError(error.message || 'Failed to delete blog');
    }
  }, [clearMessages]);

  // Filter blogs based on search and filters
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || blog.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Initialize data
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Health Blogs...</h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-blogs-page">
        <MessageDisplay 
          error={error} 
          success={success} 
          onDismiss={clearMessages} 
        />

        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-page-header-content">
            <h1 className="admin-page-title">Health Blogs Management</h1>
            <p className="admin-page-subtitle">Manage health and wellness blog content</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-header">
            <h3>Create New Blog Post</h3>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="upload-btn"
            >
              ➕ Create Blog
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="admin-filters">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="Search blogs by title, content, or excerpt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          
          <div className="admin-filter-group">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Categories</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Nutrition">Nutrition</option>
              <option value="Physical-Wellness">Physical Wellness</option>
              <option value="Stress-Management">Stress Management</option>
            </select>
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="blogs-container">
          <div className="blogs-header">
            <h3>Health Blogs ({filteredBlogs.length})</h3>
            <button 
              onClick={fetchBlogs}
              className="admin-refresh-btn"
            >
              Refresh
            </button>
          </div>
          
          <div className="blogs-grid">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="blog-card">
                <div className="blog-image">
                  {blog.image_url ? (
                    <img src={`http://127.0.0.1:8000/storage/${blog.image_url}`} alt={blog.title} />
                  ) : (
                    <div className="blog-placeholder">📝</div>
                  )}
                  <div className="blog-category">
                    {blog.category}
                  </div>
                </div>
                
                <div className="blog-content">
                  <h4 className="blog-title">{blog.title}</h4>
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  
                  <div className="blog-meta">
                    <div className="blog-tags">
                      {(() => {
                        const tagList = Array.isArray(blog.tags)
                          ? blog.tags
                          : (typeof blog.tags === 'string' && blog.tags.length > 0
                              ? blog.tags.split(',')
                              : []);
                        return tagList.map((tag, index) => (
                          <span key={index} className="tag">
                            {String(tag).trim()}
                          </span>
                        ));
                      })()}
                    </div>
                    <div className="blog-created">
                      <span className="meta-icon">📅</span>
                      <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="blog-actions">
                  <button
                    onClick={() => handleDeleteBlog(blog.id, blog.title)}
                    className="action-btn delete"
                    title="Delete Blog"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
            
            {filteredBlogs.length === 0 && (
              <div className="admin-empty-state">
                <p>No health blogs found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Create New Health Blog</h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter blog title"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Excerpt *</label>
                  <textarea
                    value={uploadData.excerpt}
                    onChange={(e) => setUploadData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Enter blog excerpt (short description)"
                    className="form-textarea"
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={uploadData.content}
                    onChange={(e) => setUploadData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter blog content"
                    className="form-textarea"
                    rows="8"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={uploadData.category}
                      onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select"
                    >
                      <option value="all">All Categories</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Nutrition">Nutrition</option>
              <option value="Physical-Wellness">Physical Wellness</option>
              <option value="Stress-Management">Stress Management</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={uploadData.tags}
                      onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="e.g., health, wellness, tips"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Featured Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'imageFile')}
                    className="form-file"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  className="btn-upload"
                  disabled={!uploadData.title || !uploadData.content || !uploadData.excerpt}
                >
                  Create Blog
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

AdminBlogs.displayName = 'AdminBlogs';

export default AdminBlogs;

// AdminBlogs Page - Health Blog Content Management
// Following Clean Code Principles

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES, MESSAGES } from '../constants/adminConstants';
import { getStorageUrl } from '../config/api.js';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [blogToDelete, setBlogToDelete] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Mental Health',
    tags: '',
    imageFile: null
  });
  const [editData, setEditData] = useState({
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
      if (fileType === 'imageFile' && showEditModal) {
        setEditData(prev => ({
          ...prev,
          [fileType]: file
        }));
      } else {
        setUploadData(prev => ({
          ...prev,
          [fileType]: file
        }));
      }
    }
  };

  const toImageUrl = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return getStorageUrl(img);
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

  // Edit blog
  const handleEditBlog = useCallback((blog) => {
    setEditingBlog(blog);
    setEditData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category || 'Mental Health',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
      imageFile: null
    });
    setShowEditModal(true);
  }, []);

  // Update blog
  const handleUpdateBlog = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      const formData = new FormData();
      formData.append('title', editData.title);
      formData.append('content', editData.content);
      formData.append('excerpt', editData.excerpt);
      formData.append('category', editData.category);
      formData.append('tags', editData.tags);
      if (editData.imageFile) {
        formData.append('image_file', editData.imageFile);
      }
      formData.append('_method', 'PUT');
      const response = await fetch(`${API_ENDPOINTS.BLOGS}/${editingBlog.id}`, {
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

      const updatedBlog = await response.json();
      setBlogs(prev => prev.map(blog => 
        blog.id === editingBlog.id ? updatedBlog : blog
      ));
      setSuccess('Health blog updated successfully');
      setShowEditModal(false);
      setEditingBlog(null);
      setEditData({
        title: '',
        content: '',
        excerpt: '',
        category: 'Mental Health',
        tags: '',
        imageFile: null
      });
      clearMessages();
      
    } catch (error) {
      console.error('Error updating blog:', error);
      setError(error.message || 'Failed to update health blog');
    }
  }, [editData, editingBlog, fetchBlogs, clearMessages]);

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
      {(success || error) && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      left: "0px",
      zIndex: 10000,
      backgroundColor: "rgb(32,31,36)",
      borderLeft: `6px solid ${success ? "green" : "red"}`,
      borderRadius: "0 6px 6px 0",
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "2px 2px 8px rgba(0,0,0,0.15)",
      fontFamily: "Poppins, sans-serif",
      fontSize: "16px",
      minWidth: "320px",
      maxWidth: "400px",
      wordBreak: "break-word",
      marginLeft: "20px",
      color: "#fff",
      transition: "left 0.4s ease, opacity 0.4s ease",
    }}
  >
    <span style={{ fontWeight: 600 }}>{success || error}</span>

    <span
      onClick={() => {
        setError(null);
        setSuccess(null);
      }}
      style={{
        cursor: "pointer",
        color: "#fff",
        fontWeight: 600,
        marginLeft: "12px",
        fontSize: "18px",
      }}
    >
      ✕
    </span>
  </div>
)}


        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-page-header-content">
            <h1 className="admin-page-title">Health Blogs Management</h1>
            <p className="admin-page-subtitle">Manage health and wellness blog content</p>
          </div>
        </div>


        {/* Filters and Search */}
          <div className="admin-users-card">
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
              <option value="Physical Wellness">Physical Wellness</option>
              <option value="Stress Management">Stress Management</option>
            </select>
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="blogs-container">
  <div className="blogs-header">
    <h3>Health Blogs ({filteredBlogs.length})</h3>
    
    <div className="header-actions">
      <button onClick={fetchBlogs} className="admin-refresh-btn">Refresh</button>
      <button onClick={() => setShowUploadModal(true)} className="upload-btn">➕ Create Blog</button>
    </div>
  </div>


          
          <div className="blogs-grid">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="blog-cards">
                <div className="blog-image">
                  {toImageUrl(blog.image_url) ? (
                    <img src={toImageUrl(blog.image_url)} alt={blog.title} />
                  ) : (
                    <div className="blog-placeholder">📝</div>
                  )}
                  <div className="blog-category">
                    {blog.category}
                  </div>
                </div>
                <div className="blog-contents">
  <h4 className="blog-title">{blog.title}</h4>
  
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
                    onClick={() => handleEditBlog(blog)}
                    className="action-btn edit"
                    title="Edit Blog"
                    style={{ marginRight: '8px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
onClick={() => {
  setBlogToDelete(blog);
  setShowDeleteConfirm(true);
}}
                    className="action-btn delete"
                    title="Delete Blog"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
            
            {showDeleteConfirm && blogToDelete && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10050
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        width: "380px",
        maxWidth: "92%",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        position: "relative"
      }}
    >
      {/* Close button */}
      <button
        onClick={() => setShowDeleteConfirm(false)}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "transparent",
          border: "none",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
          color: "#555"
        }}
      >
        ×
      </button>

      <h5 style={{ fontWeight: 600, color: "#212121", marginBottom: "12px" }}>
        Delete Notice
      </h5>

      <div style={{ height: "1px", backgroundColor: "#e0e0e0", margin: "12px 0" }} />

      <p style={{ color: "#555", marginBottom: "20px" }}>
        Are you sure you want to delete this blog?
        <b> {blogToDelete.title} </b> will be permanently removed.
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            padding: "8px 20px",
            borderRadius: "24px",
            background: "#e8f5e9",
            border: "1px solid #c8e6c9",
            color: "#2e7d32",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            await handleDeleteBlog(blogToDelete.id, blogToDelete.title);
            setShowDeleteConfirm(false);
          }}
          style={{
            padding: "8px 20px",
            borderRadius: "24px",
            background: "#d32f2f",
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

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
              <option value="Physical Wellness">Physical Wellness</option>
              <option value="Stress Management">Stress Management</option>
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

        {/* Edit Modal */}
        {showEditModal && editingBlog && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Health Blog</h3>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBlog(null);
                    setEditData({
                      title: '',
                      content: '',
                      excerpt: '',
                      category: 'Mental Health',
                      tags: '',
                      imageFile: null
                    });
                  }}
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
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter blog title"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Excerpt *</label>
                  <textarea
                    value={editData.excerpt}
                    onChange={(e) => setEditData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Enter blog excerpt (short description)"
                    className="form-textarea"
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={editData.content}
                    onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter blog content"
                    className="form-textarea"
                    rows="8"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select"
                    >
                      <option value="Mental Health">Mental Health</option>
                      <option value="Nutrition">Nutrition</option>
                      <option value="Physical Wellness">Physical Wellness</option>
                      <option value="Stress Management">Stress Management</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editData.tags}
                      onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
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
                  {editData.imageFile && (
                    <div className="image-preview" style={{ marginTop: '10px' }}>
                      <img 
                        src={URL.createObjectURL(editData.imageFile)} 
                        alt="Preview" 
                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                      <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                        New image selected: {editData.imageFile.name}
                      </small>
                    </div>
                  )}
                  {!editData.imageFile && editingBlog && toImageUrl(editingBlog.image_url) && (
                    <div className="image-preview" style={{ marginTop: '10px' }}>
                      <img 
                        src={toImageUrl(editingBlog.image_url)} 
                        alt="Current" 
                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                      <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                        Current image
                      </small>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBlog(null);
                    setEditData({
                      title: '',
                      content: '',
                      excerpt: '',
                      category: 'Mental Health',
                      tags: '',
                      imageFile: null
                    });
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateBlog}
                  className="btn-upload"
                  disabled={!editData.title || !editData.content || !editData.excerpt}
                >
                  Update Blog
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

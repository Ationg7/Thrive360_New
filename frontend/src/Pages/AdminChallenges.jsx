// AdminChallenges Page - Challenges Management
// Following Clean Code Principles

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES, MESSAGES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminChallenges.css';
import { Table } from 'react-bootstrap';


const AdminChallenges = memo(() => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [challengeToDelete, setChallengeToDelete] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    difficulty_level: 'medium',
    category: 'Daily',
  });
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    difficulty_level: 'medium',
    category: 'Daily',
    
  });
  const navigate = useNavigate();

  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Fetch challenges data
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch(API_ENDPOINTS.CHALLENGES, {
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
      setChallenges(data);
      setSuccess('Challenges loaded successfully');
      
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError(error.message || 'Failed to fetch challenges');
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

  // Upload new challenge
  const handleUpload = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('difficulty_level', uploadData.difficulty_level);
      formData.append('category', uploadData.category);
      
      
      const response = await fetch(API_ENDPOINTS.UPLOAD_CHALLENGE, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newChallenge = await response.json();
      setChallenges(prev => [newChallenge, ...prev]);
      setSuccess('Challenge created successfully');
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        difficulty_level: 'medium',
        category: 'Daily',
      });
      fetchChallenges();
      clearMessages();
      
    } catch (error) {
      console.error('Error uploading challenge:', error);
      setError(error.message || 'Failed to create challenge');
    }
  }, [uploadData, fetchChallenges, clearMessages]);

  // Delete challenge
  const handleDeleteChallenge = useCallback(async (challengeId, challengeTitle) => {
    

    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      const response = await fetch(`${API_ENDPOINTS.CHALLENGES}/${challengeId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setChallenges(prevChallenges => prevChallenges.filter(challenge => challenge.id !== challengeId));
      setSuccess(`Challenge "${challengeTitle}" deleted successfully`);
      clearMessages();
      
    } catch (error) {
      console.error('Error deleting challenge:', error);
      setError(error.message || 'Failed to delete challenge');
    }
  }, [clearMessages]);

  // Edit challenge
  const handleEditChallenge = useCallback((challenge) => {
    setEditingChallenge(challenge);
    setEditData({
      title: challenge.title,
      description: challenge.description,
      difficulty_level: challenge.difficulty_level || 'medium',
      category: challenge.category || 'daily',
    });
    setShowEditModal(true);
  }, []);

  // Update challenge
  const handleUpdateChallenge = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      const formData = new FormData();
      formData.append('title', editData.title);
      formData.append('description', editData.description);
      formData.append('difficulty_level', editData.difficulty_level);
      formData.append('category', editData.category);
      
      formData.append('_method', 'PUT');
      const response = await fetch(`${API_ENDPOINTS.CHALLENGES}/${editingChallenge.id}`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedChallenge = await response.json();
      
      // Update the challenges list with the updated challenge
      setChallenges(prev => prev.map(challenge => 
        challenge.id === editingChallenge.id ? updatedChallenge : challenge
      ));
      
      setSuccess('Challenge updated successfully');
      setShowEditModal(false);
      setEditingChallenge(null);
      setEditData({
        title: '',
        description: '',
        difficulty_level: 'medium',
        category: 'Daily',
      });
      clearMessages();
      
    } catch (error) {
      console.error('Error updating challenge:', error);
      setError(error.message || 'Failed to update challenge');
    }
  }, [editData, editingChallenge, fetchChallenges, clearMessages]);

  // Filter challenges based on search and filters
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (challenge.user && challenge.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && challenge.is_active) ||
                         (filterStatus === 'inactive' && !challenge.is_active);
    
    return matchesSearch && matchesStatus;
  });

  // Initialize data
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Challenges...</h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-challenges-page">
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
            <h1 className="admin-page-title">Challenges Management</h1>
            <p className="admin-page-subtitle">Manage all challenges in the system</p>
          </div>
        </div>
       
        {/* Filters and Search */}
        <div className="admin-users-card">
        <div className="admin-filters">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="Search challenges by title, description, or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          
          <div className="admin-filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

     

        <div className="admin-table-container">
  <div className="admin-table-header">
    <h3>Challenges List</h3>
     <button 
              onClick={() => setShowUploadModal(true)}
              className="upload-btn"
            >
              ➕ Create Challenge
            </button>
  </div>
  
  <div className="admin-table">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Description</th>
          <th>Participants</th>
          <th>Difficulty</th>
          <th>Category</th>
          <th>Created At</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredChallenges.map((challenge, index) => (
          <tr key={challenge.id}>
            <td>{index + 1}</td>
            <td>{challenge.title}</td>
            <td>{challenge.description}</td>
            <td>{challenge.user_progress_count || 0}</td>
            <td>{challenge.difficulty_level || 'Medium'}</td>
            <td>{challenge.category || 'Daily'}</td>
            <td>{new Date(challenge.created_at).toLocaleDateString()}</td>
            <td>
              <span className={`status-badge ${challenge.is_active ? 'active' : 'inactive'}`}>
                {challenge.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="action-buttons">
              <button
                onClick={() => handleEditChallenge(challenge)}
                className="action-btn edit"
              >✏️</button>
              
              <button
  onClick={() => {
    setChallengeToDelete(challenge);
    setShowDeleteConfirm(true);
  }}
  className="action-btn delete"
>
  🗑️
</button>

            </td>
          </tr>
        ))}


        
        {showDeleteConfirm && challengeToDelete && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style={{ background: "rgba(0,0,0,0.35)", zIndex: 10050 }}
  >
    <div
      className="rounded-4 shadow-lg p-4"
      style={{ background: "#fff", width: "380px", maxWidth: "92%" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h5 className="fw-bold mb-2 text-dark" style={{ margin: 0 }}>
          Delete Notice
        </h5>
        <button
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            fontSize: "20px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#555"
          }}
        >
          ×
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "12px 0" }} />

      <p className="text-muted mb-4">
        Are you sure you want to delete this challenge? <b>{challengeToDelete.title}</b> will be permanently deleted.
      </p>

      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn fw-bold px-4 py-2 rounded-pill"
          style={{
            padding: "8px 20px",
            borderRadius: "24px",
            background: "#e8f5e9",
            border: "1px solid #c8e6c9",
            color: "#2e7d32",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          Cancel
        </button>
        <button
          className="btn fw-bold px-4 py-2 rounded-pill"
          style={{
            padding: "8px 20px",
            borderRadius: "24px",
            background: "#d32f2f",
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={async () => {
            await handleDeleteChallenge(challengeToDelete.id, challengeToDelete.title);
            setShowDeleteConfirm(false);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

        
        {filteredChallenges.length === 0 && (
          <tr>
            <td colSpan="9" className="admin-empty-state">
              No challenges found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
</div>



        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Create New Challenge</h3>
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
                    placeholder="Enter challenge title"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter challenge description"
                    className="form-textarea"
                    rows="4"
                  />
                </div>
                
                <div className="row g-3">
  <div className="col-md-6">
    <div className="form-group">
      <label>Difficulty Level</label>
      <select
        value={uploadData.difficulty_level}
        onChange={(e) =>
          setUploadData(prev => ({ ...prev, difficulty_level: e.target.value }))
        }
        className="form-select"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  </div>

  <div className="col-md-6">
    <div className="form-group">
      <label>Category</label>
      <select
        value={uploadData.category}
        onChange={(e) =>
          setUploadData(prev => ({ ...prev, category: e.target.value }))
        }
        className="form-select"
      >
        <option value="Daily">Daily</option>
        <option value="Weekly">Weekly</option>
        <option value="Monthly">Monthly</option>
      </select>
    </div>
  </div>
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
                  disabled={!uploadData.title || !uploadData.description}
                >
                  Create Challenge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingChallenge && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Challenge</h3>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingChallenge(null);
                    setEditData({
                      title: '',
                      description: '',
                      difficulty_level: 'medium',
                      category: 'Daily',
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
                    placeholder="Enter challenge title"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter challenge description"
                    className="form-textarea"
                    rows="4"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Difficulty Level</label>
                    <select
                      value={editData.difficulty_level}
                      onChange={(e) => setEditData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                      className="form-select"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                    className="form-select"
                  >
                     <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                
        
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingChallenge(null);
                    setEditData({
                      title: '',
                      description: '',
                      difficulty_level: 'medium',
                      category: 'Daily',
                    });
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateChallenge}
                  className="btn-upload"
                  disabled={!editData.title || !editData.description}
                >
                  Update Challenge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

AdminChallenges.displayName = 'AdminChallenges';

export default AdminChallenges;

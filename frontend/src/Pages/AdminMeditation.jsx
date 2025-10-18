// AdminMeditation Page - Meditation Content Management
// Following Clean Code Principles

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES, MESSAGES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminMeditation.css';

const AdminMeditation = memo(() => {
  const [meditations, setMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeditation, setEditingMeditation] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    duration: '',
    category: 'Meditation',
    imageFile: null,
    tutorialSteps: [
      { step: 1, title: '', description: '', imageFile: null },
      { step: 2, title: '', description: '', imageFile: null },
      { step: 3, title: '', description: '', imageFile: null }
    ]
  });
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    duration: '',
    category: 'Meditation',
    imageFile: null,
    tutorialSteps: [
      { step: 1, title: '', description: '', imageFile: null },
      { step: 2, title: '', description: '', imageFile: null },
      { step: 3, title: '', description: '', imageFile: null }
    ]
  });
  const navigate = useNavigate();

  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Fetch meditations data
  const fetchMeditations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch(API_ENDPOINTS.MEDITATION, {
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
      setMeditations(data);
      setSuccess('Meditation content loaded successfully');

    } catch (error) {
      console.error('Error fetching meditations:', error);
      setError(error.message || 'Failed to fetch meditation content');
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

  const toImageUrl = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `http://127.0.0.1:8000/storage/${img}`;
  };

  // Handle tutorial step changes
  const handleTutorialStepChange = (stepIndex, field, value) => {
    setUploadData(prev => ({
      ...prev,
      tutorialSteps: prev.tutorialSteps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  // Handle tutorial step image upload
  const handleTutorialStepImageChange = (stepIndex, file) => {
    setUploadData(prev => ({
      ...prev,
      tutorialSteps: prev.tutorialSteps.map((step, index) => 
        index === stepIndex ? { ...step, imageFile: file } : step
      )
    }));
  };

  // Handle edit tutorial step changes
  const handleEditTutorialStepChange = (stepIndex, field, value) => {
    setEditData(prev => ({
      ...prev,
      tutorialSteps: prev.tutorialSteps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  // Handle edit tutorial step image upload
  const handleEditTutorialStepImageChange = (stepIndex, file) => {
    setEditData(prev => ({
      ...prev,
      tutorialSteps: prev.tutorialSteps.map((step, index) => 
        index === stepIndex ? { ...step, imageFile: file } : step
      )
    }));
  };

  // Add new edit tutorial step
  const addEditTutorialStep = () => {
    setEditData(prev => ({
      ...prev,
      tutorialSteps: [
        ...prev.tutorialSteps,
        { step: prev.tutorialSteps.length + 1, title: '', description: '', imageFile: null }
      ]
    }));
  };

  // Remove edit tutorial step
  const removeEditTutorialStep = (stepIndex) => {
    if (editData.tutorialSteps.length > 1) {
      setEditData(prev => ({
        ...prev,
        tutorialSteps: prev.tutorialSteps.filter((_, index) => index !== stepIndex)
          .map((step, index) => ({ ...step, step: index + 1 }))
      }));
    }
  };

  // Add new tutorial step
  const addTutorialStep = () => {
    setUploadData(prev => ({
      ...prev,
      tutorialSteps: [
        ...prev.tutorialSteps,
        { step: prev.tutorialSteps.length + 1, title: '', description: '', imageFile: null }
      ]
    }));
  };

  // Remove tutorial step
  const removeTutorialStep = (stepIndex) => {
    if (uploadData.tutorialSteps.length > 1) {
      setUploadData(prev => ({
        ...prev,
        tutorialSteps: prev.tutorialSteps.filter((_, index) => index !== stepIndex)
          .map((step, index) => ({ ...step, step: index + 1 }))
      }));
    }
  };

  // Upload new meditation
  const handleUpload = useCallback(async () => {
    try {
      // Add client-side validation
      if (!uploadData.title || !uploadData.description) {
        setError('Title and description are required.');
        return;
      }
      if (uploadData.tutorialSteps.some(step => step.title && !step.description)) {
        setError('All tutorial steps with titles must have descriptions.');
        return;
      }

      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('duration', uploadData.duration);
      formData.append('category', uploadData.category);
      
      if (uploadData.imageFile) {
        formData.append('image_file', uploadData.imageFile);
      }

      // Add tutorial steps
      formData.append('tutorial_steps', JSON.stringify(
        uploadData.tutorialSteps.map(step => ({
          step: step.step,
          title: step.title,
          description: step.description
        }))
      ));

      // Add tutorial step images
      uploadData.tutorialSteps.forEach((step, index) => {
        if (step.imageFile) {
          formData.append(`tutorial_step_${index + 1}_image`, step.imageFile);
        }
      });

      const response = await fetch(API_ENDPOINTS.UPLOAD_MEDITATION, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorDetails = await response.text();  // Fetch error details
        throw new Error(`HTTP ${response.status}: ${response.statusText} - Details: ${errorDetails}`);
      }

      setSuccess('Meditation content uploaded successfully');
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        duration: '',
        category: 'Meditation',
        imageFile: null,
        tutorialSteps: [
          { step: 1, title: '', description: '', imageFile: null },
          { step: 2, title: '', description: '', imageFile: null },
          { step: 3, title: '', description: '', imageFile: null }
        ]
      });
      fetchMeditations();
      clearMessages();

    } catch (error) {
      console.error('Error uploading meditation:', error);
      setError(error.message || 'Failed to upload meditation content');
    }
  }, [uploadData, fetchMeditations, clearMessages]);

  // Delete meditation
  const handleDeleteMeditation = useCallback(async (meditationId, meditationTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${meditationTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const response = await fetch(`${API_ENDPOINTS.MEDITATION}/${meditationId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setMeditations(prevMeditations => prevMeditations.filter(meditation => meditation.id !== meditationId));
      setSuccess(`Meditation "${meditationTitle}" deleted successfully`);
      clearMessages();

    } catch (error) {
      console.error('Error deleting meditation:', error);
      setError(error.message || 'Failed to delete meditation');
    }
  }, [clearMessages]);

  // Edit meditation
  const handleEditMeditation = useCallback((meditation) => {
    setEditingMeditation(meditation);
    
    // Parse tutorial steps if they exist
    let tutorialSteps = [
      { step: 1, title: '', description: '', imageFile: null },
      { step: 2, title: '', description: '', imageFile: null },
      { step: 3, title: '', description: '', imageFile: null }
    ];
    
    if (meditation.tutorial_steps) {
      try {
        const parsedSteps = JSON.parse(meditation.tutorial_steps);
        if (Array.isArray(parsedSteps)) {
          tutorialSteps = parsedSteps.map((step, index) => ({
            step: step.step || index + 1,
            title: step.title || '',
            description: step.description || '',
            imageFile: null
          }));
        }
      } catch (e) {
        console.error('Error parsing tutorial steps:', e);
      }
    }
    
    setEditData({
      title: meditation.title,
      description: meditation.description,
      duration: meditation.duration || '',
      category: meditation.category || 'Meditation',
      imageFile: null,
      tutorialSteps: tutorialSteps
    });
    setShowEditModal(true);
  }, []);

  // Update meditation
  const handleUpdateMeditation = useCallback(async () => {
    try {
      // Add client-side validation
      if (!editData.title || !editData.description) {
        setError('Title and description are required.');
        return;
      }
      if (editData.tutorialSteps.some(step => step.title && !step.description)) {
        setError('All tutorial steps with titles must have descriptions.');
        return;
      }

      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const formData = new FormData();
      formData.append('title', editData.title);
      formData.append('description', editData.description);
      formData.append('duration', editData.duration);
      formData.append('category', editData.category);
      
      if (editData.imageFile) {
        formData.append('image_file', editData.imageFile);
      }

      // Add tutorial steps
      formData.append('tutorial_steps', JSON.stringify(
        editData.tutorialSteps.map(step => ({
          step: step.step,
          title: step.title,
          description: step.description
        }))
      ));

      // Add tutorial step images
      editData.tutorialSteps.forEach((step, index) => {
        if (step.imageFile) {
          formData.append(`tutorial_step_${index + 1}_image`, step.imageFile);
        }
      });

      const response = await fetch(`${API_ENDPOINTS.MEDITATION}/${editingMeditation.id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - Details: ${errorDetails}`);
      }

      setSuccess('Meditation updated successfully');
      setShowEditModal(false);
      setEditingMeditation(null);
      setEditData({
        title: '',
        description: '',
        duration: '',
        category: 'Meditation',
        imageFile: null,
        tutorialSteps: [
          { step: 1, title: '', description: '', imageFile: null },
          { step: 2, title: '', description: '', imageFile: null },
          { step: 3, title: '', description: '', imageFile: null }
        ]
      });
      fetchMeditations();
      clearMessages();

    } catch (error) {
      console.error('Error updating meditation:', error);
      setError(error.message || 'Failed to update meditation');
    }
  }, [editData, editingMeditation, fetchMeditations, clearMessages]);

  // Filter meditations based on search and filters
  const filteredMeditations = meditations.filter(meditation => {
    const matchesSearch = meditation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meditation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || meditation.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Initialize data
  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Meditation Content...</h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-meditation-page">
        <MessageDisplay 
          error={error} 
          success={success} 
          onDismiss={clearMessages} 
        />

        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-page-header-content">
            <h1 className="admin-page-title">Meditation Management</h1>
            <p className="admin-page-subtitle">Manage guided meditation content</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-header">
            <h3>Upload New Meditation</h3>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="upload-btn"
            >
              ➕ Upload Meditation
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="admin-filters">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="Search meditations by title or description..."
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
              <option value="Meditation">Meditation</option>
              <option value="Stretching">Stretching</option>
              <option value="Workout">Workout</option>
            </select>
          </div>
        </div>

        {/* Meditations Grid */}
        <div className="meditations-container">
          <div className="meditations-header">
            <h3>Meditation Content ({filteredMeditations.length})</h3>
            <button 
              onClick={fetchMeditations}
              className="admin-refresh-btn"
            >
              Refresh
            </button>
          </div>
          
          <div className="meditations-grid">
            {filteredMeditations.map((meditation) => (
              <div key={meditation.id} className="meditation-card">
                <div className="meditation-image">
                  {toImageUrl(meditation.image_url) ? (
                    <img src={toImageUrl(meditation.image_url)} alt={meditation.title} />
                  ) : (
                    <div className="meditation-placeholder">🧘‍♀️</div>
                  )}
                  <div className="meditation-category">
                    {meditation.category}
                  </div>
                </div>
                
                <div className="meditation-content">
                  <h4 className="meditation-title">{meditation.title}</h4>
                  <p className="meditation-description">{meditation.description}</p>
                  
                  <div className="meditation-meta">
                    <div className="meditation-duration">
                      <span className="meta-icon">⏱️</span>
                      <span>{meditation.duration || 'N/A'}</span>
                    </div>
                    <div className="meditation-created">
                      <span className="meta-icon">📅</span>
                      <span>{new Date(meditation.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="meditation-actions">
                  <button
                    onClick={() => handleEditMeditation(meditation)}
                    className="action-btn edit"
                    title="Edit Meditation"
                    style={{ marginRight: '8px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMeditation(meditation.id, meditation.title)}
                    className="action-btn delete"
                    title="Delete Meditation"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
            
            {filteredMeditations.length === 0 && (
              <div className="admin-empty-state">
                <p>No meditation content found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay">
            <div className="modal-content tutorial-modal">
              <div className="modal-header">
                <h3>Upload New Meditation Tutorial</h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                {/* Basic Information */}
                <div className="tutorial-section">
                  <h4>Basic Information</h4>
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter meditation title"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter meditation description"
                      className="form-textarea"
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        value={uploadData.duration}
                        onChange={(e) => setUploadData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 10"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={uploadData.category}
                        onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                        className="form-select"
                      >
                        <option value="Meditation">Meditation</option>
                        <option value="Stretching">Stretching</option>
                        <option value="Workout">Workout</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Main Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'imageFile')}
                      className="form-file"
                    />
                  </div>
                </div>

                {/* Tutorial Steps */}
                <div className="tutorial-section">
                  <div className="tutorial-header">
                    <h4>Step-by-Step Tutorial</h4>
                    <button 
                      type="button"
                      onClick={addTutorialStep}
                      className="btn-add-step"
                    >
                      + Add Step
                    </button>
                  </div>
                  
                  {uploadData.tutorialSteps.map((step, index) => (
                    <div key={index} className="tutorial-step">
                      <div className="step-header">
                        <h5>Step {step.step}</h5>
                        {uploadData.tutorialSteps.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeTutorialStep(index)}
                            className="btn-remove-step"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label>Step Title</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleTutorialStepChange(index, 'title', e.target.value)}
                          placeholder={`Enter step ${step.step} title`}
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Step Description</label>
                        <textarea
                          value={step.description}
                          onChange={(e) => handleTutorialStepChange(index, 'description', e.target.value)}
                          placeholder={`Describe what to do in step ${step.step}`}
                          className="form-textarea"
                          rows="2"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Step Image (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleTutorialStepImageChange(index, e.target.files[0])}
                          className="form-file"
                        />
                        {step.imageFile && (
                          <div className="file-preview">
                            <small>Selected: {step.imageFile.name}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                  Upload Meditation Tutorial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingMeditation && (
          <div className="modal-overlay">
            <div className="modal-content tutorial-modal">
              <div className="modal-header">
                <h3>Edit Meditation Tutorial</h3>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMeditation(null);
                    setEditData({
                      title: '',
                      description: '',
                      duration: '',
                      category: 'Meditation',
                      imageFile: null,
                      tutorialSteps: [
                        { step: 1, title: '', description: '', imageFile: null },
                        { step: 2, title: '', description: '', imageFile: null },
                        { step: 3, title: '', description: '', imageFile: null }
                      ]
                    });
                  }}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                {/* Basic Information */}
                <div className="tutorial-section">
                  <h4>Basic Information</h4>
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter meditation title"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter meditation description"
                      className="form-textarea"
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        value={editData.duration}
                        onChange={(e) => setEditData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 10"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                        className="form-select"
                      >
                        <option value="Meditation">Meditation</option>
                        <option value="Stretching">Stretching</option>
                        <option value="Workout">Workout</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Main Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'imageFile')}
                      className="form-file"
                    />
                  </div>
                </div>

                {/* Tutorial Steps */}
                <div className="tutorial-section">
                  <div className="tutorial-header">
                    <h4>Step-by-Step Tutorial</h4>
                    <button 
                      type="button"
                      onClick={addEditTutorialStep}
                      className="btn-add-step"
                    >
                      + Add Step
                    </button>
                  </div>
                  
                  {editData.tutorialSteps.map((step, index) => (
                    <div key={index} className="tutorial-step">
                      <div className="step-header">
                        <h5>Step {step.step}</h5>
                        {editData.tutorialSteps.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeEditTutorialStep(index)}
                            className="btn-remove-step"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label>Step Title</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleEditTutorialStepChange(index, 'title', e.target.value)}
                          placeholder={`Enter step ${step.step} title`}
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Step Description</label>
                        <textarea
                          value={step.description}
                          onChange={(e) => handleEditTutorialStepChange(index, 'description', e.target.value)}
                          placeholder={`Describe what to do in step ${step.step}`}
                          className="form-textarea"
                          rows="2"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Step Image (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleEditTutorialStepImageChange(index, e.target.files[0])}
                          className="form-file"
                        />
                        {step.imageFile && (
                          <div className="file-preview">
                            <small>Selected: {step.imageFile.name}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMeditation(null);
                    setEditData({
                      title: '',
                      description: '',
                      duration: '',
                      category: 'Meditation',
                      imageFile: null,
                      tutorialSteps: [
                        { step: 1, title: '', description: '', imageFile: null },
                        { step: 2, title: '', description: '', imageFile: null },
                        { step: 3, title: '', description: '', imageFile: null }
                      ]
                    });
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateMeditation}
                  className="btn-upload"
                  disabled={!editData.title || !editData.description}
                >
                  Update Meditation Tutorial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

AdminMeditation.displayName = 'AdminMeditation';

export default AdminMeditation;

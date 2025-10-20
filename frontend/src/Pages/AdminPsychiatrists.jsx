// AdminPsychiatrists Page - Psychiatrist Management
// Following Clean Code Principles

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES } from '../constants/adminConstants';
import { getStorageUrl } from '../config/api.js';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminPsychiatrists.css';

const AdminPsychiatrists = memo(() => {
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPsychiatrist, setEditingPsychiatrist] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [psychiatristToDelete, setPsychiatristToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    consultation_fee: '',
    is_active: true,
    image_file: null
  });
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Fetch psychiatrists data
  const fetchPsychiatrists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN_PSYCHIATRISTS, {
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
      setPsychiatrists(data);
      setSuccess('Psychiatrists data loaded successfully');
      
    } catch (error) {
      console.error('Error fetching psychiatrists:', error);
      setError(error.message || 'Failed to fetch psychiatrists data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      phone: '',
      email: '',
      address: '',
      description: '',
      consultation_fee: '',
      is_active: true,
      image_file: null
    });
    setEditingPsychiatrist(null);
  };

  // Open modal for adding new psychiatrist
  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing psychiatrist
  const handleEdit = (psychiatrist) => {
    setFormData({
      name: psychiatrist.name || '',
      specialization: psychiatrist.specialization || '',
      phone: psychiatrist.phone || '',
      email: psychiatrist.email || '',
      address: psychiatrist.address || '',
      description: psychiatrist.description || '',
      consultation_fee: psychiatrist.consultation_fee || '',
      is_active: psychiatrist.is_active,
      image_file: null
    });
    setEditingPsychiatrist(psychiatrist);
    setShowModal(true);
  };

  // Submit form (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setActionLoading(true);
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const submitData = new FormData();
      // Required and text fields
      submitData.append('name', formData.name.trim());
      if (formData.specialization) submitData.append('specialization', formData.specialization);
      if (formData.phone) submitData.append('phone', formData.phone);
      if (formData.email) submitData.append('email', formData.email);
      if (formData.address) submitData.append('address', formData.address);
      if (formData.description) submitData.append('description', formData.description);
      // Numeric optional - only append if provided
      if (formData.consultation_fee !== '' && formData.consultation_fee !== null && formData.consultation_fee !== undefined) {
        submitData.append('consultation_fee', String(formData.consultation_fee));
      }
      // Boolean must be 1/0 for Laravel boolean validation
      submitData.append('is_active', formData.is_active ? 1 : 0);
      // File
      if (formData.image_file) {
        submitData.append('image_file', formData.image_file);
      }

      const url = editingPsychiatrist 
        ? `${API_ENDPOINTS.ADMIN_PSYCHIATRISTS}/${editingPsychiatrist.id}`
        : API_ENDPOINTS.ADMIN_PSYCHIATRISTS;
      
      const method = editingPsychiatrist ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
        body: submitData
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

      const data = await response.json();
      setSuccess(editingPsychiatrist ? 'Psychiatrist updated successfully' : 'Psychiatrist added successfully');
      setShowModal(false);
      resetForm();
      fetchPsychiatrists();
      clearMessages();
      
    } catch (error) {
      console.error('Error saving psychiatrist:', error);
      setError(error.message || 'Failed to save psychiatrist');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete psychiatrist
  const handleDelete = async (id) => {
    

    try {
      setActionLoading(true);
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const response = await fetch(`${API_ENDPOINTS.ADMIN_PSYCHIATRISTS}/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchPsychiatrists();
      clearMessages();
      
    } catch (error) {
      console.error('Error deleting psychiatrist:', error);
      setError(error.message || 'Failed to delete psychiatrist');
    } finally {
      setActionLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchPsychiatrists();
  }, [fetchPsychiatrists]);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Psychiatrists...</h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-psychiatrists-page">
      {(success || error) && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      left: "0px",
      zIndex: 9999,
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
            <h1 className="admin-page-title">Psychiatrist Management</h1>
            <p className="admin-page-subtitle">Manage psychiatrist contact details and information</p>
          </div>
          <button onClick={handleAdd} className="add-psychiatrist-btn">
            + Add Psychiatrist
          </button>
        </div>

        {/* Psychiatrists Grid */}
        <div className="psychiatrists-grid">
          {psychiatrists.length > 0 ? (
            psychiatrists.map((psychiatrist) => (
              <div key={psychiatrist.id} className="psychiatrist-card">
                <div className="psychiatrist-image">
                  <img 
                    src={psychiatrist.image_url ? getStorageUrl(psychiatrist.image_url) : `https://i.pravatar.cc/150?img=${psychiatrist.id}`}
                    alt={psychiatrist.name}
                    onError={(e) => {
                      e.target.src = `https://i.pravatar.cc/150?img=${psychiatrist.id}`;
                    }}
                  />
                  <div className={`status-indicator ${psychiatrist.is_active ? 'active' : 'inactive'}`}>
                    {psychiatrist.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="psychiatrist-info">
                  <h3>{psychiatrist.name}</h3>
                  {psychiatrist.specialization && (
                    <p className="specialization">{psychiatrist.specialization}</p>
                  )}
                  {psychiatrist.description && (
                    <p className="description">{psychiatrist.description}</p>
                  )}
                  
                  <div className="contact-info">
                    {psychiatrist.email && (
                      <div className="contact-item">
                        <span className="icon">📧</span>
                        <span>{psychiatrist.email}</span>
                      </div>
                    )}
                    {psychiatrist.phone && (
                      <div className="contact-item">
                        <span className="icon">📞</span>
                        <span>{psychiatrist.phone}</span>
                      </div>
                    )}
                    {psychiatrist.address && (
                      <div className="contact-item">
                        <span className="icon">📍</span>
                        <span>{psychiatrist.address}</span>
                      </div>
                    )}
                    {psychiatrist.consultation_fee && (
                      <div className="contact-item">
                        <span className="icon">💰</span>
                        <span>₱{parseFloat(psychiatrist.consultation_fee).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="psychiatrist-actions">
                  <button 
                    onClick={() => handleEdit(psychiatrist)}
                    className="edit-btn"
                    disabled={actionLoading}
                  >
                    Edit
                  </button>
                  <button 
onClick={() => {
  setPsychiatristToDelete(psychiatrist);
  setShowDeleteConfirm(true);
}}
                    className="delete-btn"
                    disabled={actionLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-psychiatrists">
              <div className="no-psychiatrists-icon">👨‍⚕️</div>
              <h3>No Psychiatrists Added</h3>
              <p>Start by adding psychiatrist contact details to help users connect with mental health professionals.</p>
              <button onClick={handleAdd} className="add-first-btn">
                Add First Psychiatrist
              </button>
            </div>
          )}
        </div>
        {showDeleteConfirm && psychiatristToDelete && (
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
      zIndex: 9999
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
        Are you sure you want to delete <b>{psychiatristToDelete.name}</b>? This action cannot be undone.
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
            await handleDelete(psychiatristToDelete.id, psychiatristToDelete.name);
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingPsychiatrist ? 'Edit Psychiatrist' : 'Add New Psychiatrist'}</h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="psychiatrist-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="Clinical Psychologist"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="doctor@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, City, Province"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Brief description of expertise and experience..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="consultation_fee">Consultation Fee (₱)</label>
                    <input
                      type="number"
                      id="consultation_fee"
                      name="consultation_fee"
                      value={formData.consultation_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="1500.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="image_file">Profile Image</label>
                    <input
                      type="file"
                      id="image_file"
                      name="image_file"
                      onChange={handleInputChange}
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Active (visible to users)
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="cancel-btn"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Saving...' : (editingPsychiatrist ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

AdminPsychiatrists.displayName = 'AdminPsychiatrists';

export default AdminPsychiatrists;

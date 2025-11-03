// AdminUsers Page - User Management
// Following Clean Code Principles

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES, MESSAGES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminUsers.css';

const AdminUsers = memo(() => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [userToDelete, setUserToDelete] = useState(null);


  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch(API_ENDPOINTS.USERS, {
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
      setUsers(data);
      setSuccess('Users loaded successfully');
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Delete user
  const handleDeleteUser = useCallback(async (userId, userName) => {
  

    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setSuccess(`User "${userName}" deleted successfully`);
      clearMessages();
      
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Failed to delete user');
    }
  }, [clearMessages]);

  // Toggle user status
  const handleToggleStatus = useCallback(async (userId, currentStatus) => {
    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_active: !currentStatus }
            : user
        )
      );
      setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      clearMessages();
      
    } catch (error) {
      console.error('Error updating user status:', error);
      setError(error.message || 'Failed to update user status');
    }
  }, [clearMessages]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user =>
  ((user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
   (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()))
);

  // Initialize data
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getInitial = (str) => (str && str.length > 0 ? str.charAt(0) : "?");

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Users...</h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-users-page">
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
            <h1 className="admin-page-title">User Management</h1>
            <p className="admin-page-subtitle">Manage all users in the system</p>
          </div>
        </div>


        <div className="admin-users-card">
        {/* Users Table Card */}
<div className="admin-table-card">
  {/* Filters and Search */}
  <div className="admin-filters">
    <div className="admin-search-box">
      <input
        type="text"
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="admin-search-input"
      />
    </div>
    
    <div className="admin-filter-group">
      <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        className="admin-filter-select"
      >
        <option value="all">All Roles</option>
        <option value="user">Users</option>
        <option value="admin">Admins</option>
      </select>
      
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

  {/* Table Header */}
  <div className="admin-table-header">
    <h3>Users ({filteredUsers.length})</h3>
    <button 
      onClick={fetchUsers}
      className="admin-refresh-btn"
    >
      Refresh
    </button>
  </div>
  
  {/* Table */}
  <div className="admin-table">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>
              <div className="user-name-cell">
                <div className="user-avatar">{getInitial(user.name)}</div>
                {user.name}
              </div>
            </td>
            <td>{user.email}</td>
            <td>
              <span className={`role-badge role-${user.role}`}>
                {user.role}
              </span>
            </td>
            <td>
              <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>{new Date(user.created_at).toLocaleDateString()}</td>
            <td>
              <div className="action-buttons">
                <button
                  onClick={() => handleToggleStatus(user.id, user.is_active)}
                  className={`action-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                  title={user.is_active ? 'Deactivate User' : 'Activate User'}
                >
                  {user.is_active ? '⏸️' : '▶️'}
                </button>
                <button
                  onClick={() => {
                    setUserToDelete(user);
                    setShowDeleteConfirm(true);
                  }}
                  className="action-btn delete"
                  title="Delete User"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>


            {showDeleteConfirm && userToDelete && (
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
      {/* Close button (X) */}
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

      {/* Header */}
      <h5 style={{ fontWeight: 600, color: "#212121", marginBottom: "12px" }}>
        Delete Notice
      </h5>

      {/* Separator line */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#e0e0e0",
          margin: "12px 0"
        }}
      />

      {/* Content */}
      <p style={{ color: "#555", marginBottom: "20px"  }}>
      Are you sure you want to delete this user?
        <b>{userToDelete.name}</b> ({userToDelete.email}) will be permanently removed.
      </p>

      {/* Action Buttons */}
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
            await handleDeleteUser(userToDelete.id, userToDelete.name);
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


            
            {filteredUsers.length === 0 && (
              <div className="admin-empty-state">
                <p>No users found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

AdminUsers.displayName = 'AdminUsers';

export default AdminUsers;

// Refactored AdminDashboard Component
// Following Clean Code Principles by Robert C. Martin

import React, { memo, useMemo } from 'react';
import '../styles/AdminDashboard.css';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { STATS_LABELS, NAVIGATION_BUTTONS, MESSAGES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';


const AdminDashboard = memo(() => {
  const {
    stats,
    loading,
    error,
    success,
   
    clearMessages
  } = useAdminDashboard();

  // Memoized stats data for performance
  const statsData = useMemo(() => [
    { value: stats.total_users, label: STATS_LABELS.TOTAL_USERS, type: 'users' },
    { value: stats.active_users, label: STATS_LABELS.ACTIVE_USERS, type: 'active-users' },
    { value: stats.total_posts, label: STATS_LABELS.TOTAL_POSTS, type: 'posts' },
    { value: stats.total_challenges, label: STATS_LABELS.TOTAL_CHALLENGES, type: 'challenges' },
  ], [stats]);

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3 className="loading-text">{MESSAGES.LOADING}</h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-dashboard">
        {/* Message Display */}
{(success || error) && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      left: "20px",
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
      color: "#fff",
      transition: "all 0.4s ease",
      opacity: 1,
      animation: "fadeInOut 5s forwards"
    }}
  >
    <span style={{ fontWeight: 600 }}>{success || error}</span>

    <span
      onClick={clearMessages}
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

    <style>
      {`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-20px); }
          10% { opacity: 1; transform: translateX(0); }
          90% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-20px); }
        }
      `}
    </style>
  </div>
)}




      {/* Header */}
        <div className="admin-header">
          <div className="admin-header-content">
            <h1 className="admin-title">Dashboard Overview</h1>
            <p className="admin-subtitle">Welcome to your admin control panel</p>
          </div>
      </div>
      </div>
    </ErrorBoundary>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;

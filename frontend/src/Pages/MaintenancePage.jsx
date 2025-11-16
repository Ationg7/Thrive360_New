import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../AuthContext';
import './MaintenancePage.css';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [siteName, setSiteName] = useState('Thrive360');
  
  // Get current pathname and normalize it (remove trailing slash, lowercase)
  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  
  // NEVER render on admin pages - this is a safety check
  // Admin routes that should NEVER show maintenance page
  const adminRoutes = [
    '/admin-login',
    '/admin-dashboard',
    '/admin/users',
    '/admin/posts',
    '/admin/challenges',
    '/admin/meditation',
    '/admin/blogs',
    '/admin/analytics',
    '/admin/reports',
    '/admin/psychiatrists',
    '/admin/settings',
    '/admin/events',
    '/admin/password-reset',
    '/admin/profile-covers',
  ];
  
  // Check if current path is exactly an admin route or starts with /admin/
  const isAdminPage = adminRoutes.includes(currentPath) || currentPath.startsWith('/admin/');
  
  // If this is an admin page, don't render anything - return null immediately
  if (isAdminPage) {
    console.log('🚫 MaintenancePage: Blocked from rendering on admin page:', currentPath);
    return null;
  }

  useEffect(() => {
    // Check if user is admin - admins should still have access
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      // Admin user - allow access to admin routes
      return;
    }

    // Fetch site name
    const fetchSiteName = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ADMIN_SETTINGS);
        if (response.ok) {
          const data = await response.json();
          if (data.site_name) {
            setSiteName(data.site_name);
          }
        }
      } catch (err) {
        console.error('Error fetching site name:', err);
      }
    };
    fetchSiteName();
  }, []);

  return (
    <div className="maintenance-page">
      <div className="maintenance-container">
        <div className="maintenance-icon">🔧</div>
        <h1>Maintenance Mode</h1>
        <p className="maintenance-message">
          {siteName} is currently undergoing maintenance.
        </p>
        <p className="maintenance-submessage">
          We'll be back shortly. Thank you for your patience.
        </p>
        <div className="maintenance-actions">
          <button 
            onClick={() => window.location.reload()} 
            className="refresh-btn"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;


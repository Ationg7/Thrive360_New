import React, { memo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, NAVIGATION_BUTTONS } from '../constants/adminConstants';
import { useNotificationBadges } from '../hooks/useNotificationBadges';
import { Button, Modal } from 'react-bootstrap';
import './AdminNavbar.css';

const AdminNavbar = memo(() => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { badges } = useNotificationBadges();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (route) => navigate(route);

  const getAdminName = () => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        return JSON.parse(adminUser).name || 'Admin';
      } catch {
        return 'Admin';
      }
    }
    return 'Admin';
  };

  const performLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSettings = () => {
    navigate(ROUTES.SETTINGS);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        {/* Logo */}
        <div className="admin-navbar-brand">
          <h2>Thrive360 Admin</h2>
        </div>

        {/* Navigation Links */}
        <div className="admin-navbar-links">
          {NAVIGATION_BUTTONS.map(({ id, label, route }) => {
            const badgeCount = badges[id] || 0;
            return (
              <button key={id} className="admin-nav-link" onClick={() => handleNavigation(route)}>
                {label}
                {badgeCount > 0 && <span className="nav-badge">{badgeCount}</span>}
              </button>
            );
          })}
        </div>

        {/* Profile Section */}
        <div className="admin-navbar-profile" ref={dropdownRef}>
          <button className="admin-profile-btn" onClick={toggleDropdown}>
            <div className="admin-profile-avatar">{getAdminName().charAt(0).toUpperCase()}</div>
            <span className="admin-profile-name">{getAdminName()}</span>
            <div className="admin-profile-dots">⋮</div>
          </button>

          {isDropdownOpen && (
            <div className="admin-profile-dropdown">
              <div className="admin-profile-info">
                <div className="admin-profile-avatar-large">{getAdminName().charAt(0).toUpperCase()}</div>
                <div className="admin-profile-details">
                  <div className="admin-profile-name-large">{getAdminName()}</div>
                  <div className="admin-profile-role">Administrator</div>
                </div>
              </div>
              <div className="admin-profile-divider"></div>
              <button className="admin-dropdown-item" onClick={handleSettings}>
                ⚙️ Settings
              </button>
              <button
                className="admin-dropdown-item admin-dropdown-logout"
                onClick={() => setShowLogoutConfirm(true)}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutConfirm} onHide={() => setShowLogoutConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          Are you sure you want to log out <b>{getAdminName()}</b>?
        </Modal.Body>
        <Modal.Footer className="justify-content-center" style={{ gap: '10px' }}>
          <Button
            variant="success"
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              width: '150px',
              minWidth: '120px',
              backgroundColor: '#e6f4ea',
              color: '#2e7d32',
              border: '1px solid #c8e6c9',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={performLogout}
            style={{ width: '150px', minWidth: '120px' }}
          >
            Log out
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
});

AdminNavbar.displayName = 'AdminNavbar';
export default AdminNavbar;

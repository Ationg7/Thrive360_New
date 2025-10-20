import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminSettings.css';

const AdminSettings = memo(() => {
  const [settings, setSettings] = useState({
    siteName: 'Thrive360',
    siteDescription: 'Your wellness companion for a healthier lifestyle',
    maintenanceMode: false,
    allowRegistrations: true,
    maxFileSize: 10, // MB
    emailNotifications: true,
    autoBackup: true,
    theme: 'light',
    timezone: 'UTC',
    language: 'en'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      // For now, we'll use default settings since we don't have a backend endpoint
      // In a real app, you would fetch from API_ENDPOINTS.SETTINGS
      console.log('Loading settings...');
      
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleInputChange = useCallback((field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      // In a real app, you would save to API_ENDPOINTS.SETTINGS
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  }, [settings, navigate]);

  const handleResetSettings = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        siteName: 'Thrive360',
        siteDescription: 'Your wellness companion for a healthier lifestyle',
        maintenanceMode: false,
        allowRegistrations: true,
        maxFileSize: 10,
        emailNotifications: true,
        autoBackup: true,
        theme: 'light',
        timezone: 'UTC',
        language: 'en'
      });
      setSuccess('Settings reset to default values');
      setTimeout(() => setSuccess(''), 3000);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  if (loading && !settings.siteName) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3 className="loading-text">Loading Settings...</h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-settings">
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


        <div className="settings-header">
          <h1>System Settings</h1>
          <p>Configure your Thrive360 admin panel settings</p>
        </div>

        <div className="settings-container">
          {/* General Settings */}
          <div className="settings-section">
            <h2>General Settings</h2>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="setting-input"
                />
              </div>
              
              <div className="setting-item">
                <label>Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  className="setting-textarea"
                  rows="3"
                />
              </div>
              
              <div className="setting-item">
                <label>Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="setting-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div className="setting-item">
                <label>Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="setting-select"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="settings-section">
            <h2>System Settings</h2>
            <div className="settings-grid">
              <div className="setting-item setting-toggle">
                <label>Maintenance Mode</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    id="maintenanceMode"
                  />
                  <label htmlFor="maintenanceMode" className="toggle-label"></label>
                </div>
                <small>Enable to put the site in maintenance mode</small>
              </div>
              
              <div className="setting-item setting-toggle">
                <label>Allow User Registrations</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistrations}
                    onChange={(e) => handleInputChange('allowRegistrations', e.target.checked)}
                    id="allowRegistrations"
                  />
                  <label htmlFor="allowRegistrations" className="toggle-label"></label>
                </div>
                <small>Allow new users to register</small>
              </div>
              
              <div className="setting-item">
                <label>Max File Upload Size (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                  className="setting-input"
                  min="1"
                  max="100"
                />
              </div>
              
              <div className="setting-item">
                <label>Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="setting-select"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h2>Notification Settings</h2>
            <div className="settings-grid">
              <div className="setting-item setting-toggle">
                <label>Email Notifications</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    id="emailNotifications"
                  />
                  <label htmlFor="emailNotifications" className="toggle-label"></label>
                </div>
                <small>Send email notifications for important events</small>
              </div>
              
              <div className="setting-item setting-toggle">
                <label>Auto Backup</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                    id="autoBackup"
                  />
                  <label htmlFor="autoBackup" className="toggle-label"></label>
                </div>
                <small>Automatically backup data daily</small>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button 
              onClick={handleResetSettings}
              className="btn-reset"
              disabled={loading}
            >
              Reset to Default
            </button>
            <button 
              onClick={handleSaveSettings}
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

AdminSettings.displayName = 'AdminSettings';

export default AdminSettings;

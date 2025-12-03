import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminSettings.css';

const AdminSettings = memo(() => {
  const [settings, setSettings] = useState({
    siteName: 'Thrive360',
    siteDescription: 'Thrive every day with Thrive360—your journey to wellness, growth, and balance…',
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    autoBackup: true,
  });
  
  // Use ref to always access latest settings state
  const settingsRef = useRef(settings);
  
  // Keep ref in sync with state
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, {
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
      console.log('Loaded settings from server:', data);
      
      // Helper function to parse boolean values correctly
      const parseBoolean = (value) => {
        // Handle actual boolean values
        if (typeof value === 'boolean') {
          return value;
        }
        // Handle string values
        if (typeof value === 'string') {
          const normalized = value.toLowerCase().trim();
          return normalized === 'true' || normalized === '1';
        }
        // Handle numeric values
        if (typeof value === 'number') {
          return value === 1;
        }
        // Default to false for null, undefined, etc.
        return false;
      };
      
      // Properly convert boolean values - handle both boolean true/false and string 'true'/'false'
      const newSettings = {
        siteName: data.site_name || 'Thrive360',
        siteDescription: data.site_description || 'Your wellness companion for a healthier lifestyle',
        maintenanceMode: parseBoolean(data.maintenance_mode),
        allowRegistrations: parseBoolean(data.allow_registration),
        emailNotifications: parseBoolean(data.email_notifications),
        autoBackup: parseBoolean(data.auto_backup),
      };
      
      console.log('Parsed settings:', newSettings);
      console.log('Raw maintenance_mode from server:', data.maintenance_mode, 'Type:', typeof data.maintenance_mode, 'Parsed:', newSettings.maintenanceMode);
      setSettings(newSettings);
      // Immediately update ref when settings are loaded
      settingsRef.current = newSettings;
      
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleInputChange = useCallback((field, value) => {
    console.log(`Updating ${field} to:`, value, typeof value);
    setSettings(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log('Updated settings:', updated);
      // Immediately update ref to ensure it's always current
      settingsRef.current = updated;
      return updated;
    });
  }, []);

  const handlePasswordInputChange = useCallback((field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleChangePassword = useCallback(async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation) {
        setError('All password fields are required.');
        setSaving(false);
        return;
      }

      if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
        setError('New password and confirmation do not match.');
        setSaving(false);
        return;
      }

      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch(API_ENDPOINTS.USER_CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
          new_password_confirmation: passwordForm.new_password_confirmation,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const backendMessage =
          data?.message ||
          (data?.errors && Object.values(data.errors)[0]?.[0]) ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(backendMessage);
      }

      setSuccess(data.message || 'Password changed successfully.');
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setShowChangePassword(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  }, [passwordForm, navigate]);

  const handleSaveSettings = useCallback(async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      // Use ref to get latest settings state
      const currentSettings = settingsRef.current;

      const payload = {
        site_name: currentSettings.siteName,
        site_description: currentSettings.siteDescription,
        maintenance_mode: Boolean(currentSettings.maintenanceMode),
        allow_registration: Boolean(currentSettings.allowRegistrations),
        email_notifications: Boolean(currentSettings.emailNotifications),
        auto_backup: Boolean(currentSettings.autoBackup),
      };

      console.log('Saving settings:', payload);
      console.log('Current settings ref:', settingsRef.current);
      console.log('Maintenance mode being sent:', payload.maintenance_mode, 'Type:', typeof payload.maintenance_mode);

      const response = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log('Save response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
          navigate(ROUTES.ADMIN_LOGIN);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('Save failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Settings saved, full response:', data);
      console.log('Response settings object:', data.settings);
      console.log('Maintenance mode in response:', data.settings?.maintenance_mode, 'Type:', typeof data.settings?.maintenance_mode);
      
      // Helper function to parse boolean values correctly
      const parseBoolean = (value) => {
        // Handle actual boolean values
        if (typeof value === 'boolean') {
          return value;
        }
        // Handle string values
        if (typeof value === 'string') {
          const normalized = value.toLowerCase().trim();
          return normalized === 'true' || normalized === '1';
        }
        // Handle numeric values
        if (typeof value === 'number') {
          return value === 1;
        }
        // Default to false for null, undefined, etc.
        return false;
      };
      
      // Update settings from response
      if (data.settings) {
        const updatedSettings = {
          siteName: data.settings.site_name || settingsRef.current.siteName,
          siteDescription: data.settings.site_description || settingsRef.current.siteDescription,
          maintenanceMode: parseBoolean(data.settings.maintenance_mode),
          allowRegistrations: parseBoolean(data.settings.allow_registration),
          emailNotifications: parseBoolean(data.settings.email_notifications),
          autoBackup: parseBoolean(data.settings.auto_backup),
        };
        console.log('Updating settings from response:', updatedSettings);
        console.log('Raw maintenance_mode value:', data.settings.maintenance_mode, 'Type:', typeof data.settings.maintenance_mode);
        setSettings(updatedSettings);
        // Immediately update ref
        settingsRef.current = updatedSettings;
      } else {
        console.error('No settings in response:', data);
      }
      
      setSuccess('✅ Settings saved successfully.');
      setTimeout(() => setSuccess(''), 5000);
      setSaving(false);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.message || 'Failed to save settings');
      setTimeout(() => setError(''), 5000);
      setSaving(false);
    }
  }, [navigate]);

  const handleResetSettings = useCallback(async () => {
    setShowResetConfirm(true);
  }, []);

  const confirmResetSettings = useCallback(async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      setShowResetConfirm(false);

      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN_SETTINGS_RESET, {
        method: 'POST',
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update settings with response data
      if (data.settings) {
        setSettings({
          siteName: data.settings.site_name || 'Thrive360',
          siteDescription: data.settings.site_description || 'Your wellness companion for a healthier lifestyle',
          maintenanceMode: data.settings.maintenance_mode === true || data.settings.maintenance_mode === 'true',
          allowRegistrations: data.settings.allow_registration === true || data.settings.allow_registration === 'true',
          emailNotifications: data.settings.email_notifications === true || data.settings.email_notifications === 'true',
          autoBackup: data.settings.auto_backup === true || data.settings.auto_backup === 'true',
        });
      }
      
      setSuccess('✅ Settings have been reset to default.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError(error.message || 'Failed to reset settings');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  }, [navigate]);

  if (loading && !settings.siteName) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Settings...</h3>
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
                    checked={!!settings.maintenanceMode}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      console.log('Toggle clicked, new value:', newValue);
                      handleInputChange('maintenanceMode', newValue);
                    }}
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
                    checked={!!settings.allowRegistrations}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      console.log('Allow Registrations toggle clicked, new value:', newValue);
                      handleInputChange('allowRegistrations', newValue);
                    }}
                    id="allowRegistrations"
                  />
                  <label htmlFor="allowRegistrations" className="toggle-label"></label>
                </div>
                <small>Allow new users to register</small>
              </div>
             
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h2>Notification Settings</h2>
            <div className="settings-grid">
              <div className="setting-item setting-toggle">
                <label>Notifications</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={!!settings.emailNotifications}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      console.log('Notifications toggle clicked, new value:', newValue);
                      handleInputChange('emailNotifications', newValue);
                    }}
                    id="emailNotifications"
                  />
                  <label htmlFor="emailNotifications" className="toggle-label"></label>
                </div>
                <small>Send notifications for important events</small>
              </div>
              
              
            </div>
          </div>

          {/* Action Buttons & Change Password */}
          <div className="settings-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={handleResetSettings}
              className="btn-reset"
              disabled={saving || loading}
            >
              Reset to Default
            </button>
            <button 
              onClick={handleSaveSettings}
              className="btn-save"
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <span className="spinner" style={{ display: 'inline-block', marginRight: '8px', width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                  Saving...
                </>
              ) : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              className="btn-reset"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
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
                width: "400px",
                maxWidth: "92%",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                position: "relative"
              }}
            >
              <button
                onClick={() => setShowResetConfirm(false)}
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
                Reset Settings
              </h5>

              <div style={{ height: "1px", backgroundColor: "#e0e0e0", margin: "12px 0" }} />

              <p style={{ color: "#555", marginBottom: "20px" }}>
                Are you sure you want to reset all settings to default values? This action cannot be undone.
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
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
                  onClick={confirmResetSettings}
                  disabled={saving}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "24px",
                    background: "#ff9800",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? 'Resetting...' : 'Reset'}
                </button>
              </div>
            </div>
          </div>
        )}

       
        {/* CHANGE PASSWORD MODAL */}
        {showChangePassword && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
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
                width: "400px",
                maxWidth: "92%",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                position: "relative"
              }}
            >
              <button
                onClick={() => setShowChangePassword(false)}
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

              <h5 style={{ fontWeight: 600, marginBottom: "12px" }}>Change Password</h5>

              {/* CURRENT PASSWORD */}
              <div style={{ marginBottom: "15px", position: "relative" }}>
                <label>Current Password</label>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) => handlePasswordInputChange("current_password", e.target.value)}
                  style={{width: "100%", paddingRight: "40px" , 
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #28a745", }}
                />

                {/* 👇 YOUR NEW ICON BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "35px",
                    fontSize: "14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {showCurrentPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* NEW PASSWORD */}
              <div style={{ marginBottom: "15px", position: "relative" }}>
                <label>New Password</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) => handlePasswordInputChange("new_password", e.target.value)}
                  style={{ width: "100%", paddingRight: "40px" , 
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #28a745",}}
                />

                {/* 👇 ICON BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "35px",
                    fontSize: "14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <div style={{ marginBottom: "15px", position: "relative" }}>
                <label>Confirm New Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => handlePasswordInputChange("new_password_confirmation", e.target.value)}
                  style={{ width: "100%", paddingRight: "40px" , 
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #28a745", }}
                />

                {/* 👇 ICON BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "35px",
                    fontSize: "14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <button
                onClick={handleChangePassword}
                className="btn-save"
                disabled={saving}
                style={{ width: "100%", marginTop: "10px" }}
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});


AdminSettings.displayName = 'AdminSettings';

export default AdminSettings;

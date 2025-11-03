import React, { useState, useEffect } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { Save, Shield, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import Avatar from '../Components/Avatar';
import '../App.css';
import './AdminSettings.css'; // ✅ uses the same CSS toggle styles as admin

const Settings = () => {
  const { user, isLoggedIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const BASE_URL = 'http://127.0.0.1:8000';

  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({ ...prev }));
    }
  }, [user]);

  if (!isLoggedIn) {
    return (
      <Card className="settings-card text-center">
        <Card.Body>
          <h3>Please log in to access settings</h3>
          <p>You need to be logged in to view and modify your settings.</p>
        </Card.Body>
      </Card>
    );
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (profileData.newPassword !== profileData.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (profileData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: profileData.currentPassword,
          new_password: profileData.newPassword,
          new_password_confirmation: profileData.confirmPassword
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorText = result?.message || 'Failed to change password';
        setMessage({ type: 'error', text: errorText });
        return;
      }
      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-settings">
      {/* Settings Header */}
      <div className="settings-header mb-4">
        <h1>Settings</h1>
        <p>Manage your profile, password, and notifications</p>
      </div>

  {/* Profile Section */}
<div className="profile-section  d-flex flex-column align-items-center text-center">
  <Avatar
    email={user?.email}
    name={user?.name}
    size={120}
    customAvatar={user?.avatar_url}
  />
  <p className="mt-3 fw-bold">{user?.name}</p>
  <p className="text-muted">{user?.email}</p>
</div>

      {/* Change Password */}
      <Card className="settings-card mt-4">
        <h5>Change Password</h5>
        {message && (
          <div className={message.type === 'success' ? 'text-success' : 'text-danger'}>
            {message.text}
          </div>
        )}
        <Form onSubmit={handleChangePassword}>
          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                className="setting-input"
                value={profileData.currentPassword}
                onChange={e =>
                  setProfileData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))
                }
                placeholder="Enter current password"
              />
              <Button
                variant="link"
                className="position-absolute end-0 top-50 translate-middle-y"
                onClick={() => setShowPassword(!showPassword)}
                style={{ border: 'none', padding: '0.375rem' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              className="setting-input"
              value={profileData.newPassword}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))
              }
              placeholder="Enter new password"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                className="setting-input"
                value={profileData.confirmPassword}
                onChange={e =>
                  setProfileData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))
                }
                placeholder="Confirm new password"
              />
              <Button
                variant="link"
                className="position-absolute end-0 top-50 translate-middle-y"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ border: 'none', padding: '0.375rem' }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </Form.Group>

          <Button type="submit" className="btn-reset" disabled={submitting}>
            <Shield size={18} className="me-2" />
            {submitting ? 'Changing...' : 'Change Password'}
          </Button>
        </Form>
      </Card>

      
      {/* ✅ Modal Section */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)} // click outside closes modal
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()} // prevent closing when clicking inside
          >
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              <X size={22} />
            </button>
            <h4>Edit Profile</h4>
            <p>This is an example modal with clickable background.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

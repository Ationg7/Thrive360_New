import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import './AdminProfileCovers.css';

const ChangePhoto = ({ closeModal, toImageUrl }) => {
  const { user, updateUser } = useAuth();
  const [covers, setCovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCovers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch available covers from public endpoint (no auth needed)
      const res = await fetch('http://127.0.0.1:8000/api/admin/profile-covers');
      if (!res.ok) throw new Error('Failed to load covers');
      const data = await res.json();
      setCovers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load covers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCovers(); }, [fetchCovers]);

  const handleSelectCover = async (cover) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to change your profile cover');
      }

      const coverUrl = toImageUrl(cover.url || cover.path);
      
      const res = await fetch('http://127.0.0.1:8000/api/user/profile-cover', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile_cover_url: coverUrl })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed to set profile cover');
      }

      const data = await res.json();
      
      // Update user in context with the URL from backend response
      const updatedCoverUrl = data.profile_cover_url || coverUrl;
      if (updateUser && user) {
        updateUser({ ...user, profile_cover_url: updatedCoverUrl });
      }
      
      // Remove generic localStorage key - use user-specific data instead
      // localStorage key was causing shared covers across users
      
      // Dispatch event for Profile page to update
      window.dispatchEvent(new CustomEvent('profile-cover-updated', { detail: { url: updatedCoverUrl } }));
      
      setSuccess('Profile cover updated successfully!');
      setTimeout(() => {
        if (closeModal) closeModal();
      }, 1000);
    } catch (e) {
      setError(e.message || 'Failed to update profile cover');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '600px', width: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 style={{ margin: 0 }}>Choose Profile Cover</h4>
        {closeModal && (
          <button
            onClick={closeModal}
            style={{
              fontSize: "24px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#555",
              padding: 0,
              width: '30px',
              height: '30px'
            }}
          >
            ×
          </button>
        )}
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {loading ? (
        <div className="text-center py-4">Loading covers…</div>
      ) : (
        <Row xs={2} sm={3} md={3} className="g-3">
          {covers.length ? covers.map((c) => {
            const imgUrl = toImageUrl(c.url || c.path);
            const isSelected = user?.profile_cover_url === imgUrl;
            return (
              <Col key={c.id}>
                <Card 
                  className={`cover-card ${isSelected ? 'border-primary shadow-sm' : ''}`} 
                  onClick={() => !saving && handleSelectCover(c)}
                  style={{ cursor: saving ? 'not-allowed' : 'pointer', overflow: 'hidden', opacity: saving ? 0.6 : 1 }}
                >
                  <Card.Img variant="top" src={imgUrl} style={{ height: '120px', objectFit: 'cover' }} />
                  <Card.Body className="p-2 text-center">
                    {isSelected && (
                      <small className="text-primary fw-bold">Current</small>
                    )}
                    {!isSelected && !saving && (
                      <small className="text-muted">Click to select</small>
                    )}
                    {saving && (
                      <small className="text-muted">Saving...</small>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          }) : (
            <Col xs={12}>
              <div className="text-center text-muted py-4">No covers available yet</div>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default ChangePhoto;
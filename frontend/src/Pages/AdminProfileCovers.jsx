import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { Plus, Trash2 } from 'lucide-react';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/adminConstants';
import './AdminProfileCovers.css';

const AdminProfileCovers = () => {
  const [covers, setCovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeCover, setActiveCover] = useState(null);

 const toImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;            // Full URL already
  if (img.startsWith('/storage')) return `http://127.0.0.1:8000${img}`; // Prepend domain only
  return `http://127.0.0.1:8000/storage/${img}`;     // Raw path
};


  const fetchCovers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const res = await fetch(API_ENDPOINTS.PROFILE_COVERS, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load covers');
      const data = await res.json();
      setCovers(Array.isArray(data) ? data : []);
      if (data.length && !activeCover) {
        setActiveCover(toImageUrl(data[0].url || data[0].path));
      }
    } catch (e) {
      setError(e.message || 'Failed to load covers');
    } finally {
      setLoading(false);
    }
  }, [activeCover]);

  useEffect(() => { fetchCovers(); }, [fetchCovers]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const formData = new FormData();
      formData.append('cover', selectedFile);

      const res = await fetch(API_ENDPOINTS.PROFILE_COVERS, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Upload failed');
      }

      setSuccess('Cover uploaded successfully');
      setShowModal(false);
      setSelectedFile(null);
      fetchCovers();
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (cover) => {
    if (!window.confirm('Delete this cover?')) return;
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const res = await fetch(`${API_ENDPOINTS.PROFILE_COVERS}/${cover.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setSuccess('Cover deleted');
      if (activeCover === toImageUrl(cover.url || cover.path)) setActiveCover(null);
      fetchCovers();
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  };

  return (
    <Container fluid className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Profile Covers</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={18} className="me-1" />
          Upload Cover
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {loading ? (
        <div className="text-center py-4">Loading covers…</div>
      ) : (
        <Row xs={2} sm={3} md={4} lg={5} className="g-3">
          {covers.length ? covers.map((c) => {
            const imgUrl = toImageUrl(c.url || c.path);
            return (
              <Col key={c.id}>
                <Card 
                  className={`cover-card ${activeCover === imgUrl ? 'border-primary shadow-sm' : ''}`} 
                  onClick={() => setActiveCover(imgUrl)}
                  style={{ cursor: 'pointer', overflow: 'hidden' }}
                >
                  <Card.Img variant="top" src={imgUrl} style={{ height: '120px', objectFit: 'cover' }} />
                  <Card.Body className="p-2 d-flex justify-content-between align-items-center">
                    <small className="text-truncate" style={{ maxWidth: '70%' }}>
                      {c.url || c.path}
                    </small>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c)}>
                      <Trash2 size={14} />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          }) : (
            <Col>
              <div className="text-center text-muted">No covers uploaded yet</div>
            </Col>
          )}
        </Row>
      )}

      {/* Upload Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setSelectedFile(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>Upload New Cover</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Cover Image *</Form.Label>
            <Form.Control 
              type="file" 
              accept="image/*" 
              onChange={e => setSelectedFile(e.target.files[0])} 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminProfileCovers;

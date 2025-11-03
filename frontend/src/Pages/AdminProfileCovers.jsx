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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [coverToDelete, setCoverToDelete] = useState(null);


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
         <div className="covers-scroll-container">
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
                    <Button 
  variant="outline-danger" 
  size="sm" 
  onClick={() => {
    setCoverToDelete(c);
    setShowDeleteConfirm(true);
  }}
>
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
        </div>
      )}
{showDeleteConfirm && coverToDelete && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style={{ background: "rgba(0,0,0,0.35)", zIndex: 9999 }}
  >
    <div
      className="rounded-4 shadow-lg p-4"
      style={{ background: "#fff", width: "380px", maxWidth: "92%" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h5 className="fw-bold mb-2 text-dark" style={{ margin: 0 }}>
          Delete Notice
        </h5>
        <button
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            fontSize: "20px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#555"
          }}
        >
          ×
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "12px 0" }} />

      <p className="text-muted mb-4">
      Are you sure you want to delete this cover? It will be permanently removed and cannot be undone.
      </p>

      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn fw-bold px-4 py-2 rounded-pill"
          style={{
            padding: "8px 20px",
            borderRadius: "24px",
            background: "#e8f5e9",
            border: "1px solid #c8e6c9",
            color: "#2e7d32",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          Cancel
        </button>
        <button
          className="btn fw-bold px-4 py-2 rounded-pill"
          style={{
            padding: "8px 20px",
            borderRadius: "24px",
            background: "#d32f2f",
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={async () => {
            await handleDelete(coverToDelete);
            setShowDeleteConfirm(false);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
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

import React, { useEffect, useState, useCallback } from 'react';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/adminConstants';
import './AdminProfileCovers.css';

const AdminProfileCovers = () => {
  const [covers, setCovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const toImageUrl = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `http://127.0.0.1:8000/storage/${img}`;
  };

  const fetchCovers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const res = await fetch(API_ENDPOINTS.PROFILE_COVERS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load covers');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setCovers(list);
      if (!previewUrl && list.length > 0) {
        const firstUrl = toImageUrl(list[0].url || list[0].path);
        setPreviewUrl(firstUrl);
      }
    } catch (e) {
      setError(e.message || 'Failed to load covers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCovers(); }, [fetchCovers]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const formData = new FormData();
      formData.append('cover', file);
      const res = await fetch(API_ENDPOINTS.PROFILE_COVERS, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Upload failed');
      }
      const body = await res.json().catch(() => ({}));
      const uploadedUrl = toImageUrl(body?.url || body?.path);
      // Optimistically prepend uploaded cover
      if (uploadedUrl) {
        setCovers(prev => [{ url: uploadedUrl, path: body?.path || uploadedUrl }, ...prev]);
        setPreviewUrl(uploadedUrl);
      }
      setSuccess('Cover uploaded');
      // Background refresh to keep in sync (no UI block)
      fetchCovers();
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="admin-covers-page">
      <div className="container mt-4">
        <div className="covers-header d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="m-0 covers-title">Profile Covers</h2>
            <p className="m-0 text-muted covers-subtitle">Upload and manage default profile header images</p>
          </div>
          <label className={`btn btn-success mb-0 upload-btn ${uploading ? 'disabled' : ''}`}>
            {uploading ? 'Uploading…' : 'Upload Cover'}
            <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
        </div>
        {previewUrl && (
          <div className="cover-preview mb-3">
            <img className="cover-preview-image" src={previewUrl} alt="Selected cover preview" />
          </div>
        )}
        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
        {success && <div className="alert alert-success py-2 mb-3">{success}</div>}
        {loading ? (
          <div className="covers-loading">Loading…</div>
        ) : (
          <div className="row g-3 covers-grid">
            {covers.map((c, idx) => (
              <div className="col-6 col-md-4 col-lg-3" key={idx}>
                <div className={`cover-card position-relative ${previewUrl === toImageUrl(c.url || c.path) ? 'active' : ''}`} onClick={() => setPreviewUrl(toImageUrl(c.url || c.path))}>
                  <img className="cover-image" src={toImageUrl(c.url || c.path)} alt="cover" />
                  <button
                    type="button"
                    className="btn btn-sm btn-light position-absolute"
                    style={{ top: 8, right: 8 }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!window.confirm('Delete this cover?')) return;
                      try {
                        const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
                        const res = await fetch(`${API_ENDPOINTS.PROFILE_COVERS}/${c.id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!res.ok) throw new Error('Delete failed');
                        setCovers(prev => prev.filter(x => x.id !== c.id));
                        if (previewUrl === toImageUrl(c.url || c.path)) {
                          setPreviewUrl(null);
                        }
                      } catch (err) {
                        setError(err.message || 'Delete failed');
                      }
                    }}
                    title="Delete cover"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {covers.length === 0 && (
              <div className="text-muted">No covers uploaded yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfileCovers;

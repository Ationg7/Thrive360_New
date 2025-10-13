import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { X, Check } from "lucide-react";

const ChangePhoto = ({ closeModal }) => {
  const [/* user not needed for cover */, /* setUser */] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [covers, setCovers] = useState([]);
  const [selectedCover, setSelectedCover] = useState(null);

  const toImageUrl = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `http://127.0.0.1:8000${img.startsWith('/storage') ? '' : '/storage/'}${img.replace(/^\/?storage\//, '')}`;
  };

  useEffect(() => {
    // Preselect from saved cover if present
    const saved = localStorage.getItem('profileCoverUrl');
    if (saved && !selectedCover) setSelectedCover(saved);

    // Load admin profile covers
    (async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/admin/profile-covers');
        if (res.ok) {
          const data = await res.json();
          setCovers(Array.isArray(data) ? data : []);
          if (!saved && !selectedCover && Array.isArray(data) && data.length > 0) {
            const first = toImageUrl(data[0].url || data[0].path);
            setSelectedCover(first);
          }
        }
      } catch (e) {
        // ignore silently
      }
    })();
  }, [selectedCover]);

  const handleCoverSelect = (coverUrl) => {
    setSelectedCover(coverUrl);
  };

  // Avatar actions removed; ChangePhoto now only manages profile cover

  const handleDone = async () => {
    try {
      if (selectedCover) {
        const token = localStorage.getItem('authToken');
        await fetch('http://127.0.0.1:8000/api/user/profile-cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ profile_cover_url: selectedCover })
        }).catch(() => {});
        // Persist the selected cover locally for immediate UX and reloads
        localStorage.setItem('profileCoverUrl', selectedCover);
        const event = new CustomEvent('profile-cover-updated', { detail: { url: selectedCover } });
        window.dispatchEvent(event);
      }
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => closeModal(), 300);
  };

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
        style={{
          backgroundColor: "transparent",
          zIndex: 1050,
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.3s ease",
          padding: "10px",
        }}
      >
        <Card
          className="shadow-sm border-0 p-4"
          style={{
            width: "100%",
            maxWidth: "500px",
            maxHeight: "90vh",
            borderRadius: "16px",
            overflowY: "auto",
            position: "relative",
            transform: fadeOut ? "scale(0.95)" : "scale(1)",
            opacity: fadeOut ? 0 : 1,
            transition: "all 0.3s ease",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0">Change Cover Photo</h5>
            <Button variant="light" className="rounded-circle p-0" style={{ width: "35px", height: "35px" }} onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Current Avatar removed: this modal is for cover selection only */}

          {/* Admin Profile Covers */}
          <div className="mb-4 p-3 border rounded-4 bg-light">
            <h5 className="fw-semibold text-center mb-3">Choose a Profile Cover</h5>
            <Row className="g-3 justify-content-center">
              {(covers || []).map((c, idx) => {
                const url = toImageUrl(c.url || c.path);
                const active = selectedCover === url;
                return (
                  <Col xs={6} sm={4} md={4} key={idx} className="d-flex justify-content-center">
                    <div
                      onClick={() => handleCoverSelect(url)}
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        cursor: uploading ? "not-allowed" : "pointer",
                        borderRadius: "8px",
                        border: active ? "3px solid #28a745" : "1px solid #dee2e6",
                        position: "relative",
                        transition: "all 0.2s",
                        width: "100%",
                        height: "80px",
                        overflow: "hidden"
                      }}
                    >
                      <img src={url} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {active && (
                        <div className="position-absolute top-0 end-0 bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "18px", height: "18px" }}>
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Avatar Options removed */}

          {/* Done Button */}
          <div className="text-end">
            <Button
              variant="success"
              onClick={handleDone}
              disabled={uploading}
              style={{ width: "30%",  height: "20%"}}
            >
              Done
            </Button>
          </div>

        </Card>
      </div>

      {/* Notifications */}
      {showNotification && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            zIndex: 9999,
            minWidth: "250px",
            maxWidth: "400px",
            transition: "opacity 0.3s ease",
          }}
          className={`alert ${showNotification === "success" ? "alert-success" : "alert-danger"}`}
        >
          {showNotification === "success" ? "Success!" : errorMessage || "Something went wrong."}
        </div>
      )}
    </>
  );
};

export default ChangePhoto;

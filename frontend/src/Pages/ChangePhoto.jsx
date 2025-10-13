import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { X, Check } from "lucide-react";
import { useAuth } from "../AuthContext";
import Avatar from "../Components/Avatar";

const ChangePhoto = ({ closeModal }) => {
  const { user, updateUser } = useAuth();
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const avatarOptions = [
    { id: 1, url: "https://ui-avatars.com/api/?name=Avatar+1&background=4CAF50&color=fff&size=100" },
    { id: 2, url: "https://ui-avatars.com/api/?name=Avatar+2&background=2196F3&color=fff&size=100" },
    { id: 3, url: "https://ui-avatars.com/api/?name=Avatar+3&background=FF9800&color=fff&size=100" },
    { id: 4, url: "https://ui-avatars.com/api/?name=Avatar+4&background=9C27B0&color=fff&size=100" },
    { id: 5, url: "https://ui-avatars.com/api/?name=Avatar+5&background=F44336&color=fff&size=100" },
    { id: 6, url: "https://ui-avatars.com/api/?name=Avatar+6&background=00BCD4&color=fff&size=100" },
  ];

  useEffect(() => {
    if (user?.avatar_url) setCurrentAvatar(user.avatar_url);
  }, [user]);

  const handleAvatarSelect = async (avatarUrl) => {
    if (uploading) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://127.0.0.1:8000/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar_url: avatarUrl }),
      });

      if (response.ok) {
        setCurrentAvatar(avatarUrl);
        updateUser({ ...user, avatar_url: avatarUrl });
        setShowNotification("success");
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Failed to update avatar");
        setShowNotification("error");
      }
    } catch {
      setErrorMessage("An error occurred while updating avatar");
      setShowNotification("error");
    } finally {
      setUploading(false);
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const handleRemoveAvatar = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://127.0.0.1:8000/api/user/remove-avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCurrentAvatar(null);
        updateUser({ ...user, avatar_url: null });
        setShowNotification("success");
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Failed to remove avatar");
        setShowNotification("error");
      }
    } catch {
      setErrorMessage("An error occurred while removing avatar");
      setShowNotification("error");
    } finally {
      setUploading(false);
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const handleDone = () => {
    handleClose();
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
            <h5 className="m-0">Change Photo</h5>
            <Button variant="light" className="rounded-circle p-0" style={{ width: "35px", height: "35px" }} onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>

        {/* Current Avatar */}
<div className="text-center mb-4">
  <div style={{ position: "relative", display: "inline-block" }}>
    <Avatar email={user?.email} size={100} customAvatar={currentAvatar} />
    {currentAvatar && (
      <Button
        variant="light"
        className="position-absolute top-0 end-0 rounded-circle border"
        style={{
          width: "28px",
          height: "28px",
          padding: 0,
          backgroundColor: "rgba(255,255,255,0.9)",
          transform: "translate(25%, -25%)", // slightly outside the top-right corner
        }}
        onClick={handleRemoveAvatar}
        disabled={uploading}
      >
        <X size={16} />
      </Button>
    )}
  </div>
  <p className="text-muted mt-2">{currentAvatar ? "Custom avatar" : "Default avatar"}</p>
</div>

          {/* Avatar Options */}
          <div className="mb-4 p-3 border rounded-4 bg-light">
            <h5 className="fw-semibold text-center mb-3">Choose from Predefined Avatars</h5>
            <Row className="g-3 justify-content-center">
              {avatarOptions.map((avatar) => (
                <Col xs={4} sm={4} md={4} key={avatar.id} className="d-flex justify-content-center">
                  <div
                    onClick={() => handleAvatarSelect(avatar.url)}
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      cursor: uploading ? "not-allowed" : "pointer",
                      borderRadius: "50%",
                      border: currentAvatar === avatar.url ? "3px solid #28a745" : "1px solid #dee2e6",
                      padding: "5px",
                      position: "relative",
                      transition: "all 0.2s",
                      width: "80px",
                      height: "80px",
                    }}
                  >
                    <img src={avatar.url} alt="" className="img-fluid rounded-circle" style={{ width: "65px", height: "65px", objectFit: "cover" }} />
                    {currentAvatar === avatar.url && (
                      <div className="position-absolute top-0 end-0 bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "18px", height: "18px" }}>
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Done Button */}
          <div className="text-end">
  <Button
    variant="success"
    onClick={handleDone}
    disabled={uploading}
    style={{ width: "30%",  height: "20%"}} // full width of parent
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
            padding: "14px 20px",
            borderRadius: "0 6px 6px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#20201F",
            borderLeft: showNotification === "success" ? "4px solid green" : "4px solid red",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          <span>{showNotification === "success" ? "Profile photo updated successfully!" : errorMessage}</span>
          <span style={{ cursor: "pointer", color: "rgb(138,180,248)" }} onClick={() => setShowNotification(null)}>
            X
          </span>
        </div>
      )}
    </>
  );
};

export default ChangePhoto;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { API_ENDPOINTS } from "../config/api";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("🔐 Admin login attempt for:", email);

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Login response status:", response.status);

      const data = await response.json();
      console.log("📦 Login response data:", data);

      if (response.ok) {
        // Check if user exists and is admin
        if (data.user && data.user.role === "admin") {
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("adminUser", JSON.stringify(data.user));
          setShowSuccess(true); // Show success modal
        } else {
          setError(data.message || "Access denied. Admin privileges required.");
        }
      } else {
        // Handle different error cases
        if (response.status === 401) {
          setError(data.message || "Invalid email or password");
        } else if (response.status === 403) {
          setError(data.message || "Admin access required. This account does not have admin privileges.");
        } else {
          setError(data.message || data.error || `Login failed (${response.status})`);
        }
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Network error: " + (err.message || "Unable to connect to server. Please check if the backend is running."));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigate("/admin-dashboard"); // Redirect after closing modal
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "#333", marginBottom: "10px" }}>Thrive360</h2>
          <h4 style={{ color: "#666" }}>Admin Login</h4>
        </div>

        {error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "20px",
              border: "1px solid #f5c6cb",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>
              Email Address
            </label>
            <input
              type="email"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
              }}
              placeholder="admin@thrive360.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>
              Password
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
              }}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In to Admin"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "#666", marginBottom: "10px" }}>
            Need to create an admin account?{" "}
            <a href="/admin-register" style={{ color: "#667eea", textDecoration: "none", fontWeight: "bold" }}>
              Register here
            </a>
          </p>
          <a href="/" style={{ color: "#666", textDecoration: "none" }}>
            ← Back to Main Site
          </a>
        </div>
      </div>

      {/* Success Modal */}
      <Modal show={showSuccess} onHide={handleCloseSuccess} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          Welcome back, <b>{email}</b>!
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button
            variant="success"
            onClick={handleCloseSuccess}
            style={{ width: "150px", minWidth: "120px" }}
          >
            Go to Dashboard
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminLogin;

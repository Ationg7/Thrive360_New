import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { API_ENDPOINTS } from "../config/api";

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "", secretCode: "", general: "" });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({ name: "", email: "", password: "", secretCode: "", general: "" });
    setLoading(true);

    // Normalize email
    const emailValue = (email || "").trim().toLowerCase();

    // Validate fields
    if (!name.trim()) {
      setErrors({ name: "Name is required", email: "", password: "", secretCode: "", general: "" });
      setLoading(false);
      return;
    }

    if (!emailValue) {
      setErrors({ name: "", email: "Email is required", password: "", secretCode: "", general: "" });
      setLoading(false);
      return;
    }

    if (!password) {
      setErrors({ name: "", email: "", password: "Password is required", secretCode: "", general: "" });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrors({ name: "", email: "", password: "Password must be at least 8 characters", secretCode: "", general: "" });
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setErrors({ name: "", email: "", password: "Passwords do not match", secretCode: "", general: "" });
      setLoading(false);
      return;
    }

    if (!secretCode.trim()) {
      setErrors({ name: "", email: "", password: "", secretCode: "Admin secret code is required", general: "" });
      setLoading(false);
      return;
    }

    console.log("🔐 Admin registration attempt for:", emailValue);

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: emailValue,
          password,
          password_confirmation: passwordConfirm,
          secret_code: secretCode.trim(),
          role: "admin",
        }),
      });

      console.log("📡 Register response status:", response.status);

      const data = await response.json();
      console.log("📦 Register response data:", data);

      if (response.ok) {
        // Check if user was created as admin
        if (data.user && data.user.role === "admin") {
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("adminUser", JSON.stringify(data.user));
          setShowSuccess(true); // Show success modal
        } else {
          setErrors({ name: "", email: "", password: "", general: data.message || "Admin registration failed" });
        }
      } else {
        // Handle different error cases
        const errs = { name: "", email: "", password: "", secretCode: "", general: "" };

        if (data.errors) {
          if (data.errors.name) errs.name = Array.isArray(data.errors.name) ? data.errors.name.join(" ") : data.errors.name;
          if (data.errors.email) errs.email = Array.isArray(data.errors.email) ? data.errors.email.join(" ") : data.errors.email;
          if (data.errors.password) errs.password = Array.isArray(data.errors.password) ? data.errors.password.join(" ") : data.errors.password;
          if (data.errors.secret_code) errs.secretCode = Array.isArray(data.errors.secret_code) ? data.errors.secret_code.join(" ") : data.errors.secret_code;
        }

        if (!errs.general) {
          errs.general = data.message || data.error || `Registration failed (${response.status})`;
        }

        setErrors(errs);
      }
    } catch (err) {
      console.error("Admin register error:", err);
      setErrors({
        name: "",
        email: "",
        password: "",
        general: "Network error: " + (err.message || "Unable to connect to server. Please check if the backend is running."),
      });
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
          maxWidth: "450px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "#333", marginBottom: "10px" }}>Thrive360</h2>
          <h4 style={{ color: "#666" }}>Admin Registration</h4>
        </div>

        {errors.general && (
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
            {errors.general}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Name Field */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500" }}>
              Full Name
              {errors.name && <span style={{ color: "#dc3545", fontSize: "0.85rem", marginLeft: "10px" }}>⚠ {errors.name}</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px",
                boxSizing: "border-box",
                borderColor: errors.name ? "#dc3545" : "#ddd",
              }}
            />
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500" }}>
              Email
              {errors.email && <span style={{ color: "#dc3545", fontSize: "0.85rem", marginLeft: "10px" }}>⚠ {errors.email}</span>}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px",
                boxSizing: "border-box",
                borderColor: errors.email ? "#dc3545" : "#ddd",
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500" }}>
              Password (min 8 characters)
              {errors.password && <span style={{ color: "#dc3545", fontSize: "0.85rem", marginLeft: "10px" }}>⚠ {errors.password}</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px",
                boxSizing: "border-box",
                borderColor: errors.password ? "#dc3545" : "#ddd",
              }}
            />
          </div>

          {/* Password Confirmation Field */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500" }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm password"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Secret Code Field */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500" }}>
              Admin Secret Code
              {errors.secretCode && <span style={{ color: "#dc3545", fontSize: "0.85rem", marginLeft: "10px" }}>⚠ {errors.secretCode}</span>}
            </label>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter admin secret code"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px",
                boxSizing: "border-box",
                borderColor: errors.secretCode ? "#dc3545" : "#ddd",
              }}
            />
            <small style={{ color: "#999", display: "block", marginTop: "5px" }}>
              Ask your system administrator for the secret code
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#ccc" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s",
            }}
          >
            {loading ? "Creating Admin..." : "Create Admin Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          Already have an account?{" "}
          <Link to="/admin-login" style={{ color: "#667eea", textDecoration: "none", fontWeight: "bold" }}>
            Login here
          </Link>
        </p>
      </div>

      {/* Success Modal */}
      <Modal show={showSuccess} onHide={handleCloseSuccess} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registration Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>✅ Admin account created successfully for <strong>{email}</strong>!</p>
          <p>You will be redirected to the admin dashboard.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCloseSuccess}>
            Go to Dashboard
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminRegister;

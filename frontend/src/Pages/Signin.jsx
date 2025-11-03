import { Image } from "react-bootstrap";
import logo from "../assets/Images/logo.png";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      const requestData = { email, password };
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        setSuccess(true);
        setTimeout(() => navigate("/Home"), 2000);
      } else {
        // Map error to a single message beside email
        const msg = (data.message || data.error || "").toLowerCase();
        if (msg.includes("email")) setError("Email not found");
        else if (msg.includes("password")) setError("Password is incorrect");
        else setError("Email or password is incorrect");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  return (
    <div className="container">
      <div className="signup-container">
        <div className="signup-card">
          <div className="logo-container">
            <Image src={logo} alt="Logo" className="form-logo" />
          </div>
          <h1 className="title">Thrive360</h1>
          <h2 className="subtitle">Sign in</h2>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="form-group">
              <label className="label-with-tooltip">
                Email
                {error && <span className="tooltip-error-inline">⚠ {error}</span>}
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </div>

            <Link to="/ForgotPassword" className="forgot-password">
              Forgot Password?
            </Link>

            <button type="submit" className="register-btn" style={{ marginTop: "20px" }}>
              Sign in
            </button>
          </form>

          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/SignUp" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-centers">
          <div className="circle-borders"></div>
          <div className="circle-backg"></div>
          <img
            src="https://www.groupiso.com/wp-content/uploads/2023/02/woman-laughing-on-phone.png"
            className="img-hero"
            alt="Hero"
          />
        </div>
      </div>

       {success && (
        <div className="snackbar">
          Successfully Sign In with {email}!
        </div>
      )}



      <style>{`
        .password-container {
          position: relative;
        }

        .eye-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
        }

        .label-with-tooltip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .tooltip-error-inline {
          color: #dc3545;
          font-size: 0.85rem;
          margin-left: 10px;
        }

        .snackbar {
          visibility: visible;
          min-width: 280px;
          background-color: white;
          color: black;
          text-align: center;
          border-radius: 8px;
          padding: 14px 24px;
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          font-weight: 500;
          opacity: 0;
          transform: translateY(-20px);
          animation: slideIn 0.3s forwards, fadeOut 0.3s 1.7s forwards;
        }

        @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(-20px); } }
        @media (max-width: 768px) {
         .snackbar {
    top: auto !important;
    bottom: 20px !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    width: 90% !important;
    max-width: 320px !important;
    font-size: 0.8rem;
    padding: 12px 18px;
  }
}

/* Animations */
@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

`}</style>


    </div>
  );
};

export default SignIn;

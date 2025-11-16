import logo from '../assets/Images/logo.png';
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS } from '../config/api';


const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);
  const [registrationDisabled, setRegistrationDisabled] = useState(false);
  const navigate = useNavigate();

  // Check if registration is allowed
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ADMIN_SETTINGS);
        if (response.ok) {
          const data = await response.json();
          // Handle both boolean and string values
          const isRegistrationDisabled = data.allow_registration === false || data.allow_registration === 'false';
          if (isRegistrationDisabled) {
            setRegistrationDisabled(true);
          }
        }
      } catch (err) {
        console.error('Error checking registration status:', err);
      }
    };
    checkRegistrationStatus();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess(false);

    if (password !== confirmPassword) {
      setError({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      const requestData = { email, password, password_confirmation: confirmPassword };
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/SignIn"), 2000);
      } else {
        if (data.errors) {
          const errs = {};
          for (const key in data.errors) {
            errs[key] = data.errors[key][0];
          }
          setError(errs);
        } else {
          setError({ general: data.message || "Something went wrong" });
          // If registration is disabled, update state
          if (data.message && data.message.includes('disabled')) {
            setRegistrationDisabled(true);
          }
        }
      }
    } catch (err) {
      setError({ general: "Network error: " + err.message });
    }
  };

  return (
    <div className="container">
      <div className="signup-container">
        <div className="signup-card">
          {/* Logo & Title */}
          <div className="logo-containers">
            <h6 className="Signup-text">Sign up</h6>
            <img src={logo} alt="Logo" className="small-logo" />
          </div>

          <h2 className="titles">Create an account</h2>

          {registrationDisabled && (
            <div style={{
              padding: '16px',
              marginBottom: '20px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              color: '#856404',
              textAlign: 'center'
            }}>
              <strong>⚠️ Registration Disabled</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                New registrations are currently disabled by the administrator.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="label-with-tooltip">
                Email
                {error.email && <span className="tooltip-error-inline">⚠ {error.email}</span>}
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

            {/* Password Field */}
            <div className="form-group">
              <label className="label-with-tooltip">
                Password
                {error.password && <span className="tooltip-error-inline">⚠ {error.password}</span>}
              </label>
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

            {/* Confirm Password Field */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="label-with-tooltip">
                Confirm Password
                {error.confirmPassword && <span className="tooltip-error-inline">⚠ {error.confirmPassword}</span>}
              </label>
              <div className="input-wrapper password-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>

              {/* Floating general error */}
              {error.general && (
                <div
                  className="tooltip-error-floating"
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: '-22px',
                    fontSize: '0.85rem',
                    color: '#dc3545',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ⚠ {error.general}
                </div>
              )}
            </div>

            {/* Register Button */}
            <button 
              className="register-btn" 
              type="submit" 
              style={{ marginTop: "20px" }}
              disabled={registrationDisabled}
            >
              Register
            </button>
          </form>

          {/* SignIn Link */}
          <p className="signup-text">
            Already have an account?{" "}
            <Link to="/SignIn" className="signup-link">
              Sign in
            </Link>
          </p>
        </div>

        {/* Side image & circles */}
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

      {/* Green Snackbar */}
      {success && (
        <div className="snackbar">
          Successfully registered with {email}!
        </div>
      )}

      <style>{`
        .tooltip-error-inline {
          color: #dc3545;
          font-size: 0.85rem;
          margin-left: 6px;
        }
.tooltip-error-floating {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 4px; /* small space below input */
  position: absolute;
  left: 0;
  bottom: -20px; /* adjust as needed */
  white-space: nowrap;
  margin-left: 60px; /* slight indent */
  margin-top: 50px; /* small space below input */
}


        .label-with-tooltip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

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

export default SignUp;

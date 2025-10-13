import { Image } from "react-bootstrap";
import logo from "../assets/Images/logo.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Reset password states
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetStage, setResetStage] = useState(false);

  // OTP states
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const firstOtpRef = useRef(null);

  // Eye toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Snackbar visibility
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Handle requesting password reset code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError({});
    setSuccessMessage("");

    if (!email) {
      setError({ email: "Please enter your email" });
      return;
    }

    try {
      // Request a password reset code
      const response = await fetch("http://127.0.0.1:8000/api/password-reset/request-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Password reset request sent to admin! You will receive the code shortly.");
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
        
        // Start checking for the code
        checkForCode();
      } else {
        setError({ 
          email: data.error || "Failed to send reset request. Please try again." 
        });
      }
    } catch (error) {
      console.error("Error requesting reset code:", error);
      setError({ 
        email: "Error sending reset request. Please try again." 
      });
    }
  };

  // Check for available code
  const checkForCode = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/password-reset/check-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.has_pending_request && data.code) {
        // Auto-fill the code if available
        const codeArray = data.code.split('');
        setOtp(codeArray);
        setShowOtp(true);
        setSuccessMessage("Reset code received! Please enter the code provided by admin.");
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
      } else {
        // Keep checking every 5 seconds
        setTimeout(checkForCode, 5000);
      }
    } catch (error) {
      console.error("Error checking for code:", error);
      // Keep checking even if there's an error
      setTimeout(checkForCode, 5000);
    }
  };

  // Focus first OTP box when modal opens
  useEffect(() => {
    if (showOtp && firstOtpRef.current) {
      firstOtpRef.current.focus();
    }
  }, [showOtp]);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput && nextInput.focus();
      }
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async () => {
    if (otp.join("").length < 6) {
      setError({ otp: "Please enter the full 6-digit code" });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/password-reset/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: otp.join("")
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtp(false);
        setResetStage(true);
        setSuccessMessage("Code verified! You can now reset your password.");
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 2000);
      } else {
        setError({ otp: data.error || "Invalid or expired code" });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setError({ otp: "Error verifying code. Please try again." });
    }
  };

  // Handle password reset
  const handleReset = async (e) => {
    e.preventDefault();
    setError({});
    setSuccessMessage("");

    if (!password || !confirm) {
      setError({ general: "Please fill in all fields" });
      return;
    }
    if (password !== confirm) {
      setError({ confirm: "Passwords do not match" });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/password-reset/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: otp.join(""),
          password: password,
          password_confirmation: confirm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Password successfully reset! Redirecting to login...");
        setShowSnackbar(true);
        setTimeout(() => navigate("/SignIn"), 2000);
      } else {
        console.error("Password reset error:", data);
        setError({ general: data.error || data.message || "Failed to reset password" });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError({ general: "Error resetting password. Please try again." });
    }
  };

  return (
    <div className="container">
      <div className="signup-container">
        <div className="signup-card">

          {/* Back arrow only on first page */}
          {!resetStage && (
            <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
          )}

          <div className="logo-container">
            <Image src={logo} alt="Logo" className="form-logo" />
          </div>
          <h1 className="title">Thrive360</h1>

          {/* ---------- Email Stage ---------- */}
          {!resetStage ? (
            <>
              <p className="description">
                Enter your email address to request a password reset code from admin.
              </p>

              <form className="forgot-form" onSubmit={handleRequestCode}>
                <div className="form-group">
                  <label className="label-with-tooltip">
                    Email Address
                    {error.email && (
                      <span className="tooltip-error-inline">⚠ {error.email}</span>
                    )}
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. user@domain.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button className="register-btn" type="submit" style={{ marginTop: "20px" }}>
                  Request Reset Code
                </button>
              </form>

              <p className="signup-text" style={{ marginTop: "20px" }}>
                Don’t have an account?{" "}
                <Link to="/SignUp" className="signup-link">Sign up</Link>
              </p>
            </>
          ) : (
            <>
              {/* ---------- Reset Password Stage ---------- */}
              <p className="description">Create your new password below.</p>

              <form className="forgot-form" onSubmit={handleReset}>
                <div className="form-group password-container">
                  <label className="label-with-tooltip">
                    New Password
                    {error.password && <span className="tooltip-error-inline">⚠ {error.password}</span>}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="form-group password-container">
                  <label className="label-with-tooltip">
                    Confirm Password
                    {error.confirm && <span className="tooltip-error-inline">⚠ {error.confirm}</span>}
                  </label>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className="input-field"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                {error.general && <div className="tooltip-error-floating">⚠ {error.general}</div>}

                <button className="register-btn" type="submit" style={{ marginTop: "20px" }}>
                  Reset Password
                </button>
              </form>
            </>
          )}
        </div>

        {/* Side image */}
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

      {/* ---------- Floating OTP ---------- */}
      {showOtp && (
        <div className="otp-overlay">
          <div className="otp-container">
            <span className="otp-close" onClick={() => setShowOtp(false)}>×</span>
            <h3>Enter Verification Code</h3>
            <p>Enter the 6-digit code provided by admin</p>

<div className="otp-inputs">
  {otp.map((digit, index) => (
    <input
      key={index}
      id={`otp-${index}`}
      type="text"
      maxLength="1"
      className="otp-box"
      ref={index === 0 ? firstOtpRef : null}
      value={digit}
      onChange={(e) => handleOtpChange(index, e.target.value)}
    />
  ))}
</div>

{/* Centered error */}
{error.otp && <div className="tooltip-error-otp-center">⚠ {error.otp}</div>}

<div className="otp-actions">
  <div className="otp-left">
    <p className="resend-link" onClick={() => alert("Code resent!")}>Resend Code</p>
  </div>
  <button className="otp-done-btn" onClick={handleOtpSubmit}>Done</button>
</div>

          </div>
        </div>
      )}

      {/* ---------- Snackbar ---------- */}
      {showSnackbar && (
        <div className="snackbar">{successMessage}</div>
      )}

      <style>{`
      /* Centered OTP error */
/* Centered OTP error */
.tooltip-error-otp-center {
  color: #dc3545;
  font-size: 0.85rem;
  margin-bottom: 10px;
  text-align: center; /* center the text */
  width: 100%;
}


        .back-arrow { font-size: 18px; cursor: pointer; align-self: flex-start; margin-bottom: 10px; }
        .tooltip-error-inline { color: #dc3545; font-size: 0.85rem; margin-left: 6px; }
        .tooltip-error-floating { color: #dc3545; font-size: 0.85rem; position: absolute; left: 0; bottom: -20px; white-space: nowrap; margin-left: 60px; }
        .label-with-tooltip { display: flex; align-items: center; gap: 6px; font-weight: 500; }
        .password-container { position: relative; }
        .eye-icon { position: absolute; right: 10px; top: 52px; transform: translateY(-50%); cursor: pointer; }
        .snackbar { visibility: visible; min-width: 280px; background-color: white; color: black; text-align: center; border-radius: 8px; padding: 14px 24px; position: fixed; top: 20px; right: 20px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-weight: 500; opacity: 0; transform: translateY(-20px); animation: slideIn 0.3s forwards, fadeOut 0.3s 1.7s forwards; }
        @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(-20px); } }

        /* Floating OTP */
        .otp-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.45); display:flex; justify-content:center; align-items:center; z-index:9999; backdrop-filter:blur(3px); }
       .otp-container {
        background:#fff;
       padding:30px 40px;
         border-radius:16px;
  text-align:center;
  box-shadow:0 8px 25px rgba(0,0,0,0.2);
  max-width:420px;       /* bigger container */
  width:90%;
  position: relative;
  font-family: 'Poppins', sans-serif; /* set Poppins */
  display: flex;
  flex-direction: column;
}
        .otp-close { position: absolute; top: 12px; right: 16px; font-size: 26px; font-weight: 300; cursor: pointer; }
       .otp-inputs {
  display:flex;
  justify-content:center;
  gap:12px;
  margin:20px 0;
}

.otp-box { width:45px; height:50px; font-size:1.3rem; text-align:center; border:2px solid #dcdcdc; border-radius:10px; outline:none; }
.otp-box:focus { border-color:#28a745; box-shadow:0 0 6px #28a74560; }
.otp-actions { display:flex; justify-content:space-between; align-items:flex-end; margin-top:10px; }
.otp-left { display:flex; flex-direction: column; align-items:flex-start; }
.tooltip-error-otp { color: #dc3545; font-size: 0.85rem; margin-bottom: 4px; }
.resend-link { color:#28a745; font-weight:500; cursor:pointer; font-size:0.9rem; }
.resend-link:hover { text-decoration:underline; }
.otp-done-btn {
  padding:9px 28px;
  background:linear-gradient(135deg,#28a745,#34ce57);
  color:#fff;
  border:none;
  border-radius:8px;
  font-weight:600;
  cursor:pointer;
  justify-content: flex-end;
}
      `}</style>
    </div>
  );
};

export default ForgotPassword;



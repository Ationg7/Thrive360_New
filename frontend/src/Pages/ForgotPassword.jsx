import { Image } from "react-bootstrap";
import logo from "../assets/Images/logo.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showResendNotif, setShowResendNotif] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetStage, setResetStage] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const firstOtpRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError({});
    setSuccessMessage("");

    if (!email) {
      setError({ email: "Please enter your email" });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET_REQUEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Password reset request sent! Waiting for admin approval.");
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
        checkForCode();
      } else {
        setError({ email: data.error || "Failed to send reset request." });
      }
    } catch (err) {
      console.error(err);
      setError({ email: "Error sending reset request." });
    }
  };

  const checkForCode = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET_CHECK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.has_pending_request && data.code) {
        setOtp(data.code.split(""));
        setShowOtp(true);
        setSuccessMessage("Reset code received! Enter it below.");
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
      } else {
        setTimeout(checkForCode, 5000);
      }
    } catch (err) {
      console.error(err);
      setTimeout(checkForCode, 5000);
    }
  };

  useEffect(() => {
    if (showOtp && firstOtpRef.current) firstOtpRef.current.focus();
  }, [showOtp]);

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.join("").length < 6) {
      setError({ otp: "Please enter the full 6-digit code" });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET_VERIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp.join("") }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtp(false);
        setTimeout(() => setResetStage(true), 250);
        setSuccessMessage("Code verified! Reset your password.");
        setShowSnackbar(true);
      } else {
        setError({ otp: data.error || "Invalid or expired code" });
      }
    } catch (err) {
      console.error(err);
      setError({ otp: "Error verifying code." });
    }
  };

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
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET_RESET, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: otp.join(""),
          password,
          password_confirmation: confirm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Password reset successful! Redirecting...");
        setShowSnackbar(true);
        setTimeout(() => navigate("/SignIn"), 2000);
      } else {
        setError({ general: data.error || data.message || "Failed to reset password" });
      }
    } catch (err) {
      console.error(err);
      setError({ general: "Error resetting password." });
    }
  };

  return (
    <div className="container">
      <div className="signup-container">
        <div className="signup-card">
          {!resetStage && <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />}
          <div className="logo-container">
            <Image src={logo} alt="Logo" className="form-logo" />
          </div>
          <h1 className="title">Thrive360</h1>

          {/* Email Stage */}
          {!resetStage ? (
            <>
              <p className="description">Enter your email to request a reset code.</p>
              <form onSubmit={handleRequestCode}>
                <div className="form-group">
                  <label className="label-with-tooltip">
                    Email Address
                    {error.email && <span className="tooltip-error-inline">⚠ {error.email}</span>}
                  </label>
                  <input
                    type="email"
                    placeholder="user@domain.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button className="register-btn" type="submit">Request Reset Code</button>
              </form>
              <p className="signup-text">
                Don’t have an account? <Link to="/SignUp" className="signup-link">Sign up</Link>
              </p>
            </>
          ) : (
            <>
              {/* Reset Password Stage */}
              <p className="description">Create your new password below.</p>
              <form onSubmit={handleReset}>
                <div className="form-group password-container">
                  <label>New Password {error.password && <span className="tooltip-error-inline">⚠ {error.password}</span>}</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="form-group password-container">
                  <label>Confirm Password {error.confirm && <span className="tooltip-error-inline">⚠ {error.confirm}</span>}</label>
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="input-field"
                    placeholder="Re-enter new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {error.general && <div className="tooltip-error-floating">⚠ {error.general}</div>}
                <button className="register-btn" type="submit">Reset Password</button>
              </form>
            </>
          )}
        </div>

        <div className="text-centers">
          <div className="circle-borders"></div>
          <div className="circle-backg"></div>
          <img src="https://www.groupiso.com/wp-content/uploads/2023/02/woman-laughing-on-phone.png" className="img-hero" alt="Hero" />
        </div>
      </div>

      {/* OTP Overlay */}
      {showOtp && (
        <div className="otp-overlay">
          <div className="otp-container">
            <span className="otp-close" onClick={() => setShowOtp(false)}>×</span>
            <h3>Enter Verification Code</h3>
            <p>Enter the 6-digit code from admin</p>
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
            {error.otp && <div className="tooltip-error-otp-center">⚠ {error.otp}</div>}
            <div className="otp-actions">
              <p className="resend-link" onClick={() => setShowResendNotif(true)}>Resend Code</p>
              <button className="otp-done-btn" onClick={handleOtpSubmit}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {showSnackbar && <div className="snackbar">{successMessage}</div>}

      {/* Resend Notification */}
      {showResendNotif && (
        <div className="resend-popup-overlay">
          <div className="resend-popup">
            <button className="resend-close" onClick={() => setShowResendNotif(false)}>×</button>
            <h4>Code Resent</h4>
            <p>A new verification code has been sent to your email.</p>
            <div className="resend-actions">
              <button className="resend-ok" onClick={() => setShowResendNotif(false)}>OK</button>
              <button className="resend-cancel" onClick={() => setShowResendNotif(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .eye-icon { position: absolute; margin-top:13px ; transform: translateY(-50%); right: 12px; cursor: pointer; }
        .password-container { position: relative; }
        .tooltip-error-inline { color: #dc3545; font-size: 0.85rem; margin-left: 6px; }
        .tooltip-error-floating { color: #dc3545; font-size: 0.85rem; position: absolute; left: 0; bottom: -20px; margin-left: 60px; }
        .snackbar { position: fixed; top: 20px; right: 20px; background: #fff; padding: 14px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; font-weight: 500; animation: slideIn 0.3s forwards, fadeOut 0.3s 1.7s forwards; }
        .otp-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.45); display:flex; justify-content:center; align-items:center; z-index:10000; backdrop-filter:blur(3px); }
        .otp-container { background:#fff; padding:30px 40px; border-radius:16px; text-align:center; max-width:420px; width:90%; position: relative; display:flex; flex-direction:column; font-family: 'Poppins', sans-serif; }
        .otp-close { position:absolute; top:12px; right:16px; font-size:26px; cursor:pointer; }
        .otp-inputs { display:flex; justify-content:center; gap:12px; margin:20px 0; }
        .otp-box { width:45px; height:50px; font-size:1.3rem; text-align:center; border:2px solid #dcdcdc; border-radius:10px; outline:none; }
        .otp-box:focus { border-color:#28a745; box-shadow:0 0 6px #28a74560; }
        /* Resend notification popup */ .resend-popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; z-index: 10000; animation: fadeIn 0.3s ease; } .resend-popup { background: #fff; border-radius: 14px; padding: 25px 35px; width: 90%; max-width: 360px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.2); position: relative; animation: scaleUp 0.3s ease; font-family: "Poppins", sans-serif; } .resend-popup h4 { margin-bottom: 8px; color: #28a745; font-weight: 600; } .resend-popup p { font-size: 0.9rem; color: #333; margin-bottom: 16px; } .resend-close { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 20px; color: #666; cursor: pointer; transition: color 0.2s ease; } .resend-close:hover { color: #000; } .resend-actions { display: flex; justify-content: center; gap: 12px; } .resend-ok, .resend-cancel { padding: 8px 20px; border-radius: 6px; border: none; font-weight: 500; cursor: pointer; transition: 0.3s ease; } .resend-ok { background: linear-gradient(135deg,#28a745,#34ce57); color: white; } .resend-cancel { background: #e0e0e0; color: #333; } .resend-ok:hover { background: linear-gradient(135deg,#34ce57,#28a745); } .resend-cancel:hover { background: #d6d6d6; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .otp-actions { display:flex; justify-content:space-between; align-items:flex-end; margin-top:10px; }
        .resend-link { color:#28a745; font-weight:500; cursor:pointer; font-size:0.9rem; }
        .otp-done-btn { padding:9px 28px; background:linear-gradient(135deg,#28a745,#34ce57); color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer; }
        @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(-20px); } }
         @media (max-width: 992px) {

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
     .otp-inputs {
    gap: 8px; /* reduce gap to fit smaller screens */
  }
  .otp-box {
    width: 38px;  /* slightly smaller */
    height: 45px;
    font-size: 1.1rem; /* smaller text */
  }
     /* Make the resend popup centered and mobile-friendly */
  .resend-popup {
    width: 90% !important;
    max-width: 350px;
    padding: 20px !important;
      }
    }
      `}</style>
    </div>
  );
};

export default ForgotPassword;

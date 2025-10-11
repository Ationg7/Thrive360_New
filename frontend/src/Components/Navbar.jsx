import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";
import { Bell, User, Settings, LogOut } from "lucide-react";
import Notifications from "./Notifications";
import "../App.css"; // make sure your admin CSS is included

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
    const email = localStorage.getItem("userEmail");
    setUserEmail(email || "");
  }, [location]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update unread count from Notifications
  const handleUnreadUpdate = (count) => setUnreadCount(count);

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  const openLogoutConfirm = () => {
    setShowConfirm(true);
    setIsProfileOpen(false);
  };

  const performLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setShowConfirm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    navigate("/signin");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary sticky-top">
        <div className="container-fluid">
          <img
            src="https://cdn-icons-png.flaticon.com/128/11289/11289042.png"
            width="70"
            height="70"
            alt="Thrive360 Logo"
          />
          <span className="ms-2 fw-bold text-white">Thrive360</span>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/home" className={isActive("/home")}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/freedomwall" className={isActive("/freedomwall")}>
                  Freedom Wall
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/wellnessblog" className={isActive("/wellnessblog")}>
                  Wellness Blog
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/meditation" className={isActive("/meditation")}>
                  Meditation
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/challenges" className={isActive("/challenges")}>
                  Challenges
                </Link>
              </li>
            </ul>

            {isLoggedIn ? (
              <div className="d-flex align-items-center gap-3 position-relative">
                {/* 🔔 Notification Bell */}
              {/* 🔔 Notification Bell */}
<div className="position-relative">
  <button
    className="btn p-2 rounded-circle"
    style={{
      background: "transparent",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(0,128,0,0.1)"; // light green hover
      e.currentTarget.style.borderRadius = "50%";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.borderRadius = "50%";
    }}
    onClick={() => setShowNotifications(!showNotifications)}
  >
    <Bell size={26} color="#000000" /> {/* Bigger black bell */}
    {unreadCount > 0 && (
      <span
        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        style={{
          fontSize: "0.55rem",
          width: "14px",
          height: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {unreadCount}
      </span>
    )}
  </button>

  {/* Dropdown Notifications */}
  {showNotifications && (
    <div
      className="position-absolute end-0 mt-2 shadow rounded"
      style={{
        background: "#fff",
        width: "280px",
        minHeight: "250px",
        maxHeight: "350px",
        zIndex: 10000,
        padding: "10px",
        border: "none",
        overflowY: "auto",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      }}
    >
      <Notifications onUnreadUpdate={handleUnreadUpdate} />
    </div>
  )}
</div>



                {/* Profile Dropdown */}
                <div className="user-navbar-profile" ref={dropdownRef}>
                  <button
                    className="user-profile-btn"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <Avatar email={userEmail} size={40} />
                   
                    <div className="user-profile-dots">⋮</div>
                    </button>

                {isProfileOpen && (
  <div className="user-profile-dropdown">
    <div className="user-profile-info">
      <Avatar email={userEmail} size={45} />
      <div className="user-profile-details">
        <div className="user-profile-name-large">{userEmail}</div>
        <div className="user-profile-role">User</div>
      </div>
    </div>
    <div className="user-profile-divider"></div>

    <button
      className="user-dropdown-item"
      onClick={() => {
        navigate("/profile");
        setIsProfileOpen(false);
      }}
    >
      <User size={18} color="#333" />
      <span>Profile</span>
    </button>

    <button
      className="user-dropdown-item"
      onClick={() => {
        navigate("/settings");
        setIsProfileOpen(false);
      }}
    >
      <Settings size={18} color="#333" />
      <span>Settings</span>
    </button>

    <button
      className="user-dropdown-item user-dropdown-logout"
      onClick={openLogoutConfirm}
    >
      <LogOut size={18} color="#333" />
      <span>Logout</span>
    </button>
  </div>
)}

                </div>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/signin">
                  <button className="btn btn-outline-success" type="button">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="btn btn-success" type="button">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation */}
      {showConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.35)", zIndex: 9999 }}
        >
          <div
            className="rounded-4 shadow-lg p-4"
            style={{ background: "#fff", width: "380px", maxWidth: "92%" }}
          >
            <h5 className="fw-bold mb-2 text-dark">
              Are you sure you want to log out?
            </h5>
            <p className="text-muted mb-4 align-items">
               <b>{userEmail}</b>?
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn fw-bold px-4 py-2 rounded-pill"
                style={{
                  background: "#e8f5e9",
                  color: "#2e7d32",
                  border: "1px solid #c8e6c9",
                }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn fw-bold px-4 py-2 rounded-pill"
                style={{ background: "#2e7d32", color: "#fff", border: "none" }}
                onClick={performLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NavigationBar;



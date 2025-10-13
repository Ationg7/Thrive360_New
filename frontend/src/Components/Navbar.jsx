import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";
import { Bell, User, Settings, LogOut } from "lucide-react";
import Notifications from "./Notifications";
import "../App.css";
import { useAuth } from "../AuthContext";
import { Container, Card, Form, Modal, Button, Dropdown } from "react-bootstrap";

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Fetch unread count on mount
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await fetch("http://127.0.0.1:8000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          const unread = list.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };
    fetchUnreadCount();
  }, []);

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
            width="50"
            height="50"
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
                <Link to="/home" className={isActive("/home")}>Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/freedomwall" className={isActive("/freedomwall")}>Freedom Wall</Link>
              </li>
              <li className="nav-item">
                <Link to="/wellnessblog" className={isActive("/wellnessblog")}>Wellness Blog</Link>
              </li>
              <li className="nav-item">
                <Link to="/meditation" className={isActive("/meditation")}>Meditation</Link>
              </li>
              <li className="nav-item">
                <Link to="/challenges" className={isActive("/challenges")}>Challenges</Link>
              </li>
            </ul>

            {isLoggedIn ? (
              <div className="d-flex align-items-center gap-3 position-relative">

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
                         borderRadius: "50%", 
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,128,0,0.1)";
                      e.currentTarget.style.borderRadius = "50%";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderRadius = "50%";
                    }}
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell size={26} color="#000000" />
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
                      <Notifications onUnreadUpdate={setUnreadCount} />
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="user-navbar-profile" ref={dropdownRef}>
                  <button
                    className="user-profile-btn"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <Avatar
                      email={user?.email || ""}
                      name={user?.name || "Anonymous"}
                      className="avatar"
                      size={40}
                    />
                    <div className="user-profile-dots">⋮</div>
                  </button>

                  {isProfileOpen && (
                    <div className="user-profile-dropdown">
                      <div className="user-profile-info">
                        <Avatar email={user?.email || ""} name={user?.name || "Anonymous"} className="avatar" size={40} />
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
                  <button className="btn btn-outline-success" type="button">Login</button>
                </Link>
                <Link to="/signup">
                  <button className="btn btn-success" type="button">Register</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation */}
      {showConfirm && (
  <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
    <Modal.Header closeButton>
      <Modal.Title>Confirm Logout</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
      Are you sure you want to log out <b>{userEmail}</b>?
    </Modal.Body>
    <Modal.Footer className="justify-content-center" style={{ gap: '10px' }}>
      <Button
        variant="success"
        onClick={() => setShowConfirm(false)}
        style={{ width: '150px', minWidth: '120px', backgroundColor: '#e6f4ea', color: '#2e7d32', border: '1px solid #c8e6c9' }}
      >
        Cancel
      </Button>
      <Button
        variant="success"
        onClick={performLogout}
        style={{ width: '150px', minWidth: '120px' }}
      >
        Log out
      </Button>
    </Modal.Footer>
  </Modal>
)}

    </>
  );
}

export default NavigationBar;

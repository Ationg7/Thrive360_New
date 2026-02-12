import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";
import { Bell, User, Settings, LogOut } from "lucide-react";
import Notifications from "./Notifications";
import "../App.css";
import { useAuth } from "../AuthContext";
import { API_ENDPOINTS } from "../config/api";
import { Modal, Button } from "react-bootstrap";

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [userEmail, setUserEmail] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef(null);

  const profileRef = useRef(null);
const notifRef = useRef(null);
const menuRef = useRef(null);
// Close profile + notifications + mobile menu on outside click
useEffect(() => {
  const handleClick = (e) => {
    // Close profile dropdown
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setIsProfileOpen(false);
    }

    // Close notifications
    if (notifRef.current && !notifRef.current.contains(e.target)) {
      setShowNotifications(false);
    }

    // Close mobile collapse menu
    const menu = document.getElementById("navbarSupportedContent");
    const toggler = document.querySelector(".navbar-toggler");

    if (
      menu &&
      menu.classList.contains("show") &&
      !menu.contains(e.target) &&
      !toggler.contains(e.target)
    ) {
      toggler.click();
    }
  };

  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, []);


 



  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
    const email = localStorage.getItem("userEmail");
    setUserEmail(email || "");
  }, [location]);
 const closeMenu = () => {
  const menu = document.getElementById("navbarSupportedContent");
  const toggler = document.querySelector(".navbar-toggler");

  if (menu && menu.classList.contains("show")) {
    toggler.click(); // triggers Bootstrap collapse toggle
  }
};

  // Fetch unread notifications
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
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
    // Call AuthContext logout to clear all auth state
    logout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setShowConfirm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // Force page refresh to update UI immediately
    navigate("/signin");
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary sticky-top">
        <div className="container-fluid p-0">
          <div className="d-flex align-items-center ms-2">
             <Link
      to="/home"
      className="d-flex align-items-center ms-2"
      style={{ textDecoration: "none" }}
    >
            <img
              src="https://cdn-icons-png.flaticon.com/128/11289/11289042.png"
              width="45"
              height="45"
              alt="Thrive360 Logo"
            />
            <span 
  className="ms-2 fw-bold" 
  style={{ color: "#198754" }}  // Bootstrap “success” green
>Thrive360</span>
            </Link>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible menu */}
          <div className="collapse navbar-collapse" id="navbarSupportedContent"ref={menuRef}>
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/home" className={isActive("/home")} onClick={closeMenu}
>Home</Link>
              </li>
              
              <li className="nav-item">
                <Link to="/freedomwall" className={isActive("/freedomwall")} onClick={closeMenu}
>Freedom Wall</Link>
              </li>
              <li className="nav-item">
                <Link to="/wellnessblog" className={isActive("/wellnessblog")} onClick={closeMenu}
>Wellness Blog</Link>
              </li>
              <li className="nav-item">
                <Link to="/meditation" className={isActive("/meditation")} onClick={closeMenu}
>Meditation</Link>
              </li>
              <li className="nav-item">
                <Link to="/challenges" className={isActive("/challenges")} onClick={closeMenu}
>Challenges</Link>
              </li>
            </ul>

            {!isLoggedIn && (
              <div className="d-flex login-register-mobile">
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

        {/* Desktop + Mobile Profile & Notification */}
        {isLoggedIn && (
          <div className="d-flex align-items-center gap-2 mobile-fixed-buttons">

            {/* Notification */}
            <div className="position-relative" ref={notifRef}>
              <button
                className="btn p-2 rounded-circle bell-btn"
                style={{ background: "transparent", border: "none" }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={26} color="#000000" />

                {/* Unread badge above the bell */}
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: 'red',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="notification-dropdown"
                  
                >
                  <Notifications onUnreadUpdate={setUnreadCount} />
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="user-navbar-profile" ref={profileRef}>
              <button
                className="user-profile-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <Avatar email={user?.email || ""} name={user?.name || "Anonymous"} className="avatar" size={40} />
                
               
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
        )}
      </nav>

      {/* Logout Confirmation */}
    <Modal
  show={showConfirm}
  onHide={() => setShowConfirm(false)}
  centered
  dialogClassName="responsive-logout-modal"
>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Logout</Modal.Title>
  </Modal.Header>
  <Modal.Body className="text-center">
    Are you sure you want to log out <b>{userEmail}</b>?
  </Modal.Body>
  <Modal.Footer
    className="justify-content-center gap-2"
    style={{
      flexWrap: "wrap",
      gap: "10px",
      padding: "10px 15px",
    }}
  >
    <Button
      variant="success"
      onClick={() => setShowConfirm(false)}
      style={{
        flex: "1 1 120px",
        minWidth: "120px",
        maxWidth: "90%",
        backgroundColor: "#e6f4ea",
        color: "#2e7d32",
        border: "1px solid #c8e6c9",
      }}
    >
      Cancel
    </Button>
    <Button
      variant="success"
      onClick={performLogout}
      style={{
        flex: "1 1 120px",
        minWidth: "120px",
        maxWidth: "90%",
      }}
    >
      Log out
    </Button>
  </Modal.Footer>
</Modal>

     <style>{`
     /* Desktop - keep original size */
     /* Bell Hover Circle Effect – Works on all screens */
.bell-btn {
  position: relative;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s ease, transform 0.1s ease;
}

.bell-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.bell-btn:active {
  transform: scale(0.92);
  background: rgba(0, 0, 0, 0.12);
}

.notification-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  width: 280px;
  max-height: 350px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border-radius: 12px;
  padding: 10px;
  overflow-y: auto;
  z-index: 10000;
  transition: all 0.3s ease;
}
 @media (max-width: 576px) {
    .responsive-logout-modal .modal-dialog {
      max-width: 90%; /* smaller width on mobile */
      margin: 1.75rem auto; /* centered vertically and horizontally */
    }
    .responsive-logout-modal .modal-body {
      font-size: 0.95rem; /* slightly smaller text */
      padding: 1rem;
    }
  }
/* Mobile only */
@media (max-width: 992px) {
  .notification-dropdown {
    width: 220px;       /* smaller width on mobile */
    max-height: 250px;  /* smaller height on mobile */
    right: 5px;         /* prevent going off screen */
    top: 35px;          /* adjust from bell icon */
    padding: 8px;
  }
}
/* Desktop - leave unchanged */
.user-profile-dropdown {
  position: absolute;
  top: 50px;
  margin-right: 20px;
  width: 280px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border-radius: 12px;
  right: 0;
  z-index: 10000;
  transition: all 0.3s ease;
}

/* Mobile only */
@media (max-width: 992px) {
html, body {
  overflow-x: hidden !important;
  width: 100% !important;
}

  .user-profile-dropdown {
    width: 220px;       /* smaller width */
      right: 10px;  /* keep inside screen */
    top: 50px;          /* adjust from avatar */
   
  }

  /* Optional: make dropdown items smaller */
  .user-dropdown-item {
    font-size: 0.9rem;
    padding: 6px 10px;
  }

  .user-profile-details .user-profile-name-large {
    font-size: 0.95rem;
  }

  .user-profile-details .user-profile-role {
    font-size: 0.8rem;
  }
    

  @media (max-width: 992px) {
  .custom-mobile-dropdown-item {
    width: 100%;
    display: block;
    padding: 10px 15px;
    background: transparent;
    border-radius: 6px;
    border-bottom: none !important;
  }

  .custom-mobile-dropdown-item:hover {
    background: rgba(0, 0, 0, 0.08) !important;
  }

  .custom-mobile-separator {
    height: 1px;
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    margin: 6px 0;
  }
    /* Logo and brand */
    nav.navbar .container-fluid > .d-flex.align-items-center.ms-2 {
      margin-left: -20px !important;
      padding-left: 0 !important;
    }
    nav.navbar .container-fluid > .d-flex.align-items-center.ms-2 img {
      width: 42px !important;
      height: 42px !important;
    }
    nav.navbar .container-fluid > .d-flex.align-items-center.ms-2 span {
      font-size: 1.1rem !important;
    }

    /* Collapsed menu */
    .navbar-collapse {
    position: absolute !important;
    top: 60px !important;
    right: 0 !important;
    width: auto !important;
    max-width: 250px;
    background: #f4fdf6;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 6px 20px rgba(0, 128, 0, 0.2);
    z-index: 1040 !important;
    margin-right: 10px !important;
  }
  .navbar-collapse .navbar-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    width: 100%;
  }
  .navbar-collapse .nav-item a {
    width: 100%;
    text-align: center;
    font-size: 1.1rem;
    border-radius: 8px;
    background: #e6f9f0;
    color: #198754 !important;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
   
    padding: 0 8px;
  }
  .navbar-collapse .nav-item:last-child a {
    border-bottom: none;
  }
  .navbar-collapse .nav-item a:hover {
    background: #d0f0e0;
    color: #145c32 !important;
  }

  /* Login/Register buttons */
  .login-register-mobile {
    justify-content: center;
    gap: 5px;
    width: 100%;
    margin-top: 10px;
  }
  .login-register-mobile .btn {
    font-size: 0.95rem;
    padding: 6px 14px;
    min-width: 90px;
    max-width: 120px;
    height: 40px;
  }


    /* Login/Register buttons */
    .login-register-mobile {
      justify-content: center;
      gap: 5px;
      width: 100%;
      margin-top: 10px;
    }
    .login-register-mobile .btn {
      font-size: 0.95rem;
      padding: 6px 14px;
      min-width: 90px;
      max-width: 120px;
      height: 40px;
    }

    /* Mobile fixed buttons: bell, profile, toggle */
    .mobile-fixed-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  z-index: 1050;
  margin-right: 10px;
}


    /* Bell button */
    .mobile-fixed-buttons .bell-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      background: transparent;
      border: none;
      transition: background 0.2s ease;
      
      
    }
    .mobile-fixed-buttons .bell-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    /* Profile button (avatar + dots) */
    .user-navbar-profile .user-profile-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      width: 60px;
      height: 60px;
      margin: 0;
      padding: 4px 6px;
      border-radius: 50px;
      background: transparent;
      border: none;
      cursor: pointer;
      position: relative;
      margin-right: 25px;
    }
    .user-navbar-profile .user-profile-btn:hover {
      background: rgba(25, 135, 84, 0.1);
    }
    .user-profile-dots {
      font-size: 18px;
      color: #333;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
    }
    
       .notification-dropdown {
    width: 220px;       /* smaller width */
    max-height: 250px;  /* smaller height */
    right: 5px;         /* prevent off-screen */
    top: 35px;          /* adjust from bell icon */
    padding: 8px;
    margin-top: 15px !important;
  }
     .dropdown-item {
  border-bottom: none !important;
}


    /* Navbar toggle */
    .navbar-toggler {
      border: none !important;
      background: transparent !important;
      padding: 4px 6px !important;
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      z-index: 1051;
      right: 10px !important;
    }
    .navbar-toggler:focus {
      box-shadow: none !important;
    }
  }
`}</style>

    </>
  );
}

export default NavigationBar;

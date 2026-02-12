import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

import Navbar from "./Components/Navbar";
import Navbars from "./Components/Navbars";
import AdminNavbar from "./Components/AdminNavbar";
import Footer from "./Components/Footer";
import FloatingPsychologists from "./Components/FloatingPsychologists";

import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import SignIn from "./Pages/Signin";
import SignUp from "./Pages/Signup";
import ForgotPassword from "./Pages/ForgotPassword";
import FreedomWall from "./Pages/FreedomWall";
import Meditation from "./Pages/Meditation";
import Challenges from "./Pages/Challenges";
import ChallengesCategories from "./Pages/ChallengesCategories";
import Landing from "./Pages/Landing";
import WellnessBlog from "./Pages/WellnessBlog";
import GuideDetail from "./Pages/GuideDetail";
import BlogDetail from "./Pages/BlogDetail";
import Dashboard from "./Components/Dashboard";
import AdminLogin from "./Pages/AdminLogin";
import AdminRegister from "./Pages/AdminRegister";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminUsers from "./Pages/AdminUsers";
import AdminPosts from "./Pages/AdminPosts";
import AdminChallenges from "./Pages/AdminChallenges";
import AdminAnalytics from "./Pages/AdminAnalytics";
import AdminReports from "./Pages/AdminReports";
import AdminPsychiatrists from "./Pages/AdminPsychiatrists";
import AdminMeditation from "./Pages/AdminMeditation";
import AdminBlogs from "./Pages/AdminBlogs";
import AdminSettings from "./Pages/AdminSettings";
import AdminEvents from "./Pages/AdminEvents";
import AdminPasswordReset from "./Pages/AdminPasswordReset";
import AdminProfileCovers from "./Pages/AdminProfileCovers";
import Settings from "./Pages/Settings";
import ChangePhoto from "./Pages/ChangePhoto";
import MaintenancePage from "./Pages/MaintenancePage";
import TermsAndConditions from "./Pages/TermsAndConditions";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsOfService from "./Pages/TermsOfService";
import About from "./Pages/About";
import { useFcmRegistration } from "./hooks/useFcm";
import { AuthProvider, useAuth } from "./AuthContext";
import { ChallengesProvider } from "./Pages/Challenges";
import { API_ENDPOINTS } from "./config/api";

function Layout() {
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  const publicRoutes = ["/", "/signin", "/signup", "/forgotpassword"];
  const adminRoutes = [
    "/admin-login",
    "/admin-dashboard",
    "/admin/users",
    "/admin/posts",
    "/admin/challenges",
    "/admin/meditation",
    "/admin/blogs",
    "/admin/analytics",
    "/admin/reports",
    "/admin/psychiatrists",
    "/admin/settings",
    "/admin/events",
    "/admin/password-reset",
    "/admin/profile-covers",
  ];
  const noNavbarRoutes = ["/dashboard"];
  const noFooterRoutes = [
    "/dashboard",
    "/admin-login",
    "/admin-dashboard",
    "/admin/users",
    "/admin/posts",
    "/admin/challenges",
    "/admin/meditation",
    "/admin/blogs",
    "/admin/analytics",
    "/admin/reports",
    "/admin/psychiatrists",
    "/admin/settings",
    "/admin/events",
    "/admin/password-reset",
    "/admin/profile-covers",
  ];

  // Normalize pathname - remove trailing slashes and convert to lowercase
  const pathname = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const isPublicPage = publicRoutes.includes(pathname);
  const isNoNavbarPage = noNavbarRoutes.includes(pathname);
  const isNoFooterPage = noFooterRoutes.includes(pathname);
  const isAdminPage = adminRoutes.includes(pathname);

  const floatingAllowedRoutes = [
    "/home",
    "/profile",
    "/meditation",
    "/challenges",
    "/wellnessblog",
    "/freedomwall",
  ];

  // Register FCM push notifications when user is logged in
  useFcmRegistration(isLoggedIn);

  // Check maintenance mode
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ADMIN_SETTINGS);
        if (response.ok) {
          const data = await response.json();
          console.log('🔧 Maintenance mode check - Full response:', data);
          console.log('🔧 Maintenance mode value:', data.maintenance_mode, 'Type:', typeof data.maintenance_mode);
          
          // Parse boolean value correctly
          let isMaintenanceMode = false;
          if (typeof data.maintenance_mode === 'boolean') {
            isMaintenanceMode = data.maintenance_mode;
          } else if (typeof data.maintenance_mode === 'string') {
            const normalized = data.maintenance_mode.toLowerCase().trim();
            isMaintenanceMode = normalized === 'true' || normalized === '1';
          } else if (typeof data.maintenance_mode === 'number') {
            isMaintenanceMode = data.maintenance_mode === 1;
          }
          
          console.log('🔧 Parsed maintenance mode:', isMaintenanceMode);
          
          // Always set the maintenance mode state (admins can still see it's enabled)
          // The rendering logic will decide whether to show the maintenance page
          setMaintenanceMode(isMaintenanceMode);
          
          if (isMaintenanceMode) {
            console.log('✅ Maintenance mode is ON - Users should see maintenance page');
          } else {
            console.log('❌ Maintenance mode is OFF - Normal access');
          }
        } else {
          console.error('❌ Failed to fetch maintenance mode status:', response.status);
          // On error, assume maintenance mode is off
          setMaintenanceMode(false);
        }
      } catch (err) {
        console.error('❌ Error checking maintenance mode:', err);
        // On error, assume maintenance mode is off
        setMaintenanceMode(false);
      } finally {
        setCheckingMaintenance(false);
      }
    };
    
    // Check immediately on mount
    checkMaintenanceMode();
    
    // Check periodically (every 5 seconds) to detect when admin turns maintenance mode on/off
    const interval = setInterval(checkMaintenanceMode, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const adminToken = localStorage.getItem('adminToken');
  const isAdmin = adminToken !== null;

  // Admin pages should not be blocked by the checkingMaintenance loading screen
  // Allow admin pages to load immediately so admins can manage settings
  if (checkingMaintenance && !isAdminPage) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Debug logging
  const shouldShowMaintenance = maintenanceMode && !isAdminPage && !isPublicPage;
  console.log('🔍 Route check:', {
    pathname,
    'original pathname': location.pathname,
    maintenanceMode,
    isAdmin,
    isAdminPage,
    isPublicPage,
    shouldShowMaintenance,
    'adminRoutes includes pathname?': adminRoutes.includes(pathname),
    'adminRoutes': adminRoutes
  });

  // Admin pages are ALWAYS accessible, even during maintenance mode
  // This allows admins to manage settings and turn off maintenance mode
  // Skip all maintenance checks for admin pages
  if (isAdminPage) {
    console.log('✅ Admin page detected - always accessible, even during maintenance');
    // Continue to render admin pages normally - no maintenance page blocking
    // Return early to skip all maintenance mode checks
  }
  // Public pages (signin, signup, etc.) are also always accessible during maintenance
  else if (isPublicPage) {
    console.log('ℹ️ Public page - always accessible during maintenance');
  }
  // If maintenance mode is active and it's a user page (not admin, not public):
  // Show maintenance page to ALL users (including admins)
  else if (maintenanceMode) {
    console.log('🚧 SHOWING MAINTENANCE PAGE');
    console.log('   - maintenanceMode:', maintenanceMode);
    console.log('   - isAdmin:', isAdmin, '(admins also see maintenance page on user pages)');
    console.log('   - isAdminPage:', isAdminPage);
    console.log('   - isPublicPage:', isPublicPage);
    return <MaintenancePage />;
  }

  return (
    <div 
      className={isAdminPage ? 'admin-page-no-overlay' : ''}
      style={isAdminPage ? { 
        pointerEvents: 'auto', 
        opacity: 1,
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate' /* Create new stacking context */
      } : {}}
    >
       <div className="page-container">
      {/* Navbars */}
      {isAdminPage && pathname !== "/admin-login" && <AdminNavbar />}
      {!isNoNavbarPage && !isAdminPage && (isPublicPage ? <Navbars /> : <Navbar />)}
          <div className="content-wrap">
      {/* Page content */}
      <Outlet />
</div>
      {/* Footer */}
      {!isNoFooterPage && <Footer />}

      {/* FloatingPsychologists only for users on certain routes */}
      {isLoggedIn &&
        floatingAllowedRoutes.some((path) => pathname.startsWith(path)) && (
          <FloatingPsychologists />
        )}
    </div>
    </div>
  );
}


// ---------- Router ----------
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <Layout />
      </AuthProvider>
    ),
    children: [
      { path: "/", element: <Landing /> },
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      { path: "forgotpassword", element: <ForgotPassword /> },
      { path: "home", element: <Home /> },
      { path: "freedomwall", element: <FreedomWall /> },
      { path: "meditation", element: <Meditation /> },
      { path: "wellnessblog", element: <WellnessBlog /> },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <Settings /> },
      { path: "change-photo", element: <ChangePhoto /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "guide-detail", element: <GuideDetail /> },
      { path: "blogdetail", element: <BlogDetail /> },
      { path: "terms", element: <TermsAndConditions /> },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "services", element: <TermsOfService /> },
      { path: "about", element: <About /> },

      // ---------- Challenges Routes Wrapped in Provider ----------
      {
        path: "challenges",
        element: (
          <ChallengesProvider>
            <Outlet />
          </ChallengesProvider>
        ),
        children: [
          { path: "", element: <Challenges /> },
          { path: "categories", element: <ChallengesCategories /> },
        ],
      },

      // ---------- Admin Routes ----------
      { path: "admin-login", element: <AdminLogin /> },
      { path: "admin-register", element: <AdminRegister /> },
      { path: "admin-dashboard", element: <AdminDashboard /> },
      { path: "admin/users", element: <AdminUsers /> },
      { path: "admin/posts", element: <AdminPosts /> },
      { path: "admin/challenges", element: <AdminChallenges /> },
      { path: "admin/meditation", element: <AdminMeditation /> },
      { path: "admin/blogs", element: <AdminBlogs /> },
      { path: "admin/analytics", element: <AdminAnalytics /> },
      { path: "admin/reports", element: <AdminReports /> },
      { path: "admin/psychiatrists", element: <AdminPsychiatrists /> },
      { path: "admin/settings", element: <AdminSettings /> },
      { path: "admin/events", element: <AdminEvents /> },
      { path: "admin/password-reset", element: <AdminPasswordReset /> },
      { path: "admin/profile-covers", element: <AdminProfileCovers /> },

    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

// ---------- App ----------
function App() {
  return <RouterProvider router={router} />;
}

export default App;

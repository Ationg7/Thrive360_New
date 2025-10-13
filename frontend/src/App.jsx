import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
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


import { AuthProvider, useAuth } from "./AuthContext";
import { ChallengesProvider } from "./Pages/Challenges";
function Layout() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

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

  const pathname = location.pathname.toLowerCase();
  const isPublicPage = publicRoutes.includes(pathname);
  const isAdminPage = adminRoutes.includes(pathname);
  const isNoNavbarPage = noNavbarRoutes.includes(pathname);
  const isNoFooterPage = noFooterRoutes.includes(pathname);

  const floatingAllowedRoutes = [
    "/home",
    "/profile",
    "/meditation",
    "/challenges",
    "/wellnessblog",
    "/freedomwall",
  ];

  return (
    <>
      {/* Navbars */}
      {isAdminPage && pathname !== "/admin-login" && <AdminNavbar />}
      {!isNoNavbarPage && !isAdminPage && (isPublicPage ? <Navbars /> : <Navbar />)}
         
      {/* Page content */}
      <Outlet />

      {/* Footer */}
      {!isNoFooterPage && <Footer />}

      {/* FloatingPsychologists only for users on certain routes */}
      {isLoggedIn &&
        floatingAllowedRoutes.some((path) => pathname.startsWith(path)) && (
          <FloatingPsychologists />
        )}
    </>
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

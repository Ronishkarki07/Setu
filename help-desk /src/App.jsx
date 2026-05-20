import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import LandingPage from "./pages/LandingPage";

// 🔥 import your real pages
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Settings from "./pages/Settings";
import Announcements from "./pages/Announcements";

// --- Admin Pages ---
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminPermissions from "./pages/admin/AdminPermissions";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute";

// --- Department Head Portal ---
import SetupAccount from "./pages/dept/SetupAccount";
import DeptLogin from "./pages/dept/DeptLogin";
import DeptDashboard from "./pages/dept/DeptDashboard";
import DeptTickets from "./pages/dept/DeptTickets";
import DeptTicketDetail from "./pages/dept/DeptTicketDetail";
import DeptProtectedRoute from "./pages/dept/DeptProtectedRoute";

/* ---------------- PROTECTED ROUTE ---------------- */
function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("token"); // simple auth check

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ---------------- NOT FOUND ---------------- */
function NotFound() {
  return (
    <h1 style={{ textAlign: "center", marginTop: "50px" }}>
      404 - Page Not Found ❌
    </h1>
  );
}

/* ---------------- APP ---------------- */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/tickets" 
          element={
            <AdminProtectedRoute>
              <AdminTickets />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/departments" 
          element={
            <AdminProtectedRoute>
              <AdminDepartments />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/permissions" 
          element={
            <AdminProtectedRoute>
              <AdminPermissions />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/announcements" 
          element={
            <AdminProtectedRoute>
              <AdminAnnouncements />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/support" 
          element={
            <AdminProtectedRoute>
              <AdminSupport />
            </AdminProtectedRoute>
          } 
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* DEPARTMENT HEAD PORTAL ROUTES */}
        <Route path="/setup-head" element={<SetupAccount />} />
        <Route path="/dept/login" element={<DeptLogin />} />
        <Route
          path="/dept/dashboard"
          element={
            <DeptProtectedRoute>
              <DeptDashboard />
            </DeptProtectedRoute>
          }
        />
        <Route
          path="/dept/tickets"
          element={
            <DeptProtectedRoute>
              <DeptTickets />
            </DeptProtectedRoute>
          }
        />
        <Route
          path="/dept/tickets/:id"
          element={
            <DeptProtectedRoute>
              <DeptTicketDetail />
            </DeptProtectedRoute>
          }
        />

        {/* DEFAULT REDIRECT */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
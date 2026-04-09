import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";

// 🔥 import your real pages
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets"; // your tickets + submit page

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

        {/* AUTH ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

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

        {/* DEFAULT REDIRECT */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
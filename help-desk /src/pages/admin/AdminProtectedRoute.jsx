import { Navigate } from "react-router-dom";

/**
 * AdminProtectedRoute component
 * Checks if a token exists and if the user has an admin role.
 * For now, we'll check if the 'adminToken' exists in localStorage.
 */
export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  const adminData = localStorage.getItem("adminData");

  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const admin = JSON.parse(adminData);
    if (admin.role !== 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

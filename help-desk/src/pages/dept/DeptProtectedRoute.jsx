import { Navigate } from "react-router-dom";

export default function DeptProtectedRoute({ children }) {
  const token = localStorage.getItem("deptToken");
  if (!token) return <Navigate to="/dept/login" replace />;
  return children;
}

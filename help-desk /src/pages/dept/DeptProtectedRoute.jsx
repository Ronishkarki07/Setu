import { Navigate } from "react-router-dom";

export default function DeptProtectedRoute({ children }) {
  const token = localStorage.getItem("deptToken");
  const deptHeadStr = localStorage.getItem("deptHead");

  if (!token || !deptHeadStr) {
    return <Navigate to="/dept/login" replace />;
  }

  try {
    const deptHead = JSON.parse(deptHeadStr);
    if (deptHead.role !== 'department_head') {
      return <Navigate to="/dept/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/dept/login" replace />;
  }

  return children;
}


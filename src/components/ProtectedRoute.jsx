import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function RoleProtectedRoute({ children, allowed = [] }) {
  const { token, user, initializing } = useContext(AuthContext);

  if (initializing) return null;
  if (!token) return <Navigate to="/admin/login" replace />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (allowed.length && !allowed.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

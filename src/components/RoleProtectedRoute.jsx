// src/components/RoleProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * props:
 * - children
 * - allowed: array of roles allowed, e.g. ["admin"]
 *
 * Behavior:
 * - if no token -> redirect to /admin/login (or /siswa/login?) — we use generic /admin/login fallback
 * - if user exists and role not allowed -> redirect to home "/"
 */
export default function RoleProtectedRoute({ children, allowed = [] }) {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!token) {
    // no token -> redirect to login (choose generic admin login)
    return <Navigate to="/admin/login" replace />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowed.length > 0 && !allowed.includes(user.role)) {
    // role not allowed, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
}

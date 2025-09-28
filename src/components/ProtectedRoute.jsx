// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);

  // Jika tidak ada token, redirect ke login siswa
  if (!token) {
    return <Navigate to="/siswa/login" replace />;
  }

  return children;
}

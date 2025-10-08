// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RoleAwareNavbar from "./components/RoleAwareNavbar";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import StudentLogin from "./pages/public/studentLogin";
import StudentDashboard from "./pages/public/studentDashboard";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import GuruLogin from "./pages/guru/GuruLogin";
import GuruDashboard from "./pages/guru/GuruDashboard";

import SiswaForm from "./pages/admin/Siswa/SiswaForm";
import SiswaList from "./pages/admin/Siswa/SiswaList";

import GuruForm from "./pages/admin/Guru/GuruForm";
import GuruList from "./pages/admin/Guru/GuruList";
import AssignWali from "./pages/admin/WaliKelas/AssignWali";

import GuruEdit from "./pages/admin/Guru/GuruEdit";
import MapelList from "./pages/admin/Mapel/MapelList";
import KelasMapelManager from "./pages/admin/Mapel/KelasMapelManager";
import MapelDashboard from "./pages/admin/Mapel/MapelDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
       

        <main className="w-full">
          <Routes>
            {/* Home */}
            <Route
              path="/"
              element={
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded shadow">
                    <h1 className="text-2xl font-semibold mb-2">Selamat datang di LMS</h1>
                    <p className="text-sm text-gray-600">
                      Pilih login sesuai peran:
                      <span className="ml-1">
                        <Link to="/siswa/login" className="text-blue-600">Siswa</Link>
                      </span>
                      {" • "}
                      <span>
                        <Link to="/admin/login" className="text-blue-600">Admin</Link>
                      </span>
                      {" • "}
                      <span>
                        <Link to="/guru/login" className="text-blue-600">Guru</Link>
                      </span>
                    </p>
                  </div>
                </div>
              }
            />

            {/* Public / Auth */}
            <Route path="/siswa/login" element={<StudentLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/guru/login" element={<GuruLogin />} />

            {/* Student protected */}
            <Route
              path="/siswa/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin protected */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Admin: create siswa (form) */}
            <Route
              path="/admin/siswa/create"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <SiswaForm />
                </RoleProtectedRoute>
              }
            />

            {/* Admin: list siswa */}
            <Route
              path="/admin/siswa"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <SiswaList />
                </RoleProtectedRoute>
              }
            />
             {/* Admin: list siswa */}
            <Route
              path="/admin/guru"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <GuruList />
                </RoleProtectedRoute>
              }
            />
            {/* Admin: list siswa */}
            <Route
              path="/admin/guru/create"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <GuruForm />
                </RoleProtectedRoute>
              }
            />

             {/* Admin: list siswa */}
            <Route
              path="/admin/guru/wali-kelas/assign"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <AssignWali />
                </RoleProtectedRoute>
              }
            />

            {/* Admin: list siswa */}
            <Route
              path="admin/guru/edit/:id"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <GuruEdit  />
                </RoleProtectedRoute>
              }
            />

            <Route path="/admin/mapel" element={
  <RoleProtectedRoute allowed={["admin"]}>
    <MapelDashboard />
  </RoleProtectedRoute>
} />
<Route path="/admin/kelas-mapel" element={
  <RoleProtectedRoute allowed={["admin"]}>
    <KelasMapelManager />
  </RoleProtectedRoute>
} />
<Route path="/admin/create-mapel" element={
  <RoleProtectedRoute allowed={["admin"]}>
    <MapelList />
  </RoleProtectedRoute>
} />

            {/* Guru protected */}
            <Route
              path="/guru"
              element={
                <RoleProtectedRoute allowed={["guru"]}>
                  <GuruDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Fallback: you can add 404 route here if desired */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

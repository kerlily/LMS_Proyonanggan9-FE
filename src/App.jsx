// src/App.jsx
import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { User, School } from "lucide-react"; // Importing icons from lucide-react
import MuridImage from "./assets/murid.png"; // Importing student image
import GuruImage from "./assets/guru.png"; // Importing teacher image
import DashboardImage from "./assets/dashboard.jpg"; // Importing dashboard image

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import StudentLogin from "./pages/public/studentLogin";
import StudentDashboard from "./pages/public/studentDashboard";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import GuruDashboard from "./pages/guru/GuruDashboard";

import SiswaForm from "./pages/admin/Siswa/SiswaForm";
import SiswaList from "./pages/admin/Siswa/SiswaList";
import SiswaEdit from "./pages/admin/Siswa/SiswaEdit";
import SiswaDetail from "./pages/admin/Siswa/SiswaDetail";

import GuruForm from "./pages/admin/Guru/GuruForm";
import GuruList from "./pages/admin/Guru/GuruList";
import AssignWali from "./pages/admin/WaliKelas/AssignWali";
import TahunAjaranIndex from "./pages/admin/TahunAjaran/TahunAjaranIndex";

import GuruEdit from "./pages/admin/Guru/GuruEdit";
import MapelList from "./pages/admin/Mapel/MapelList";
import KelasMapelManager from "./pages/admin/Mapel/KelasMapelManager";
import MapelDashboard from "./pages/admin/Mapel/MapelDashboard";

import AdminForm from "./pages/admin/Admin/AdminForm";
import AdminList from "./pages/admin/Admin/AdminList";
import AdminResetPassword from "./pages/admin/Admin/AdminResetPassword";

import NilaiAkhir from "./pages/guru/nilai/NilaiAkhir";


import DashboardLog from "./pages/admin/log/DashboardLog";
import NilaiDetailDashboard from "./pages/guru/hitung_nilai/NilaiDetailDashboard";

export default function App() {
  const location = useLocation();
  // routes or prefixes that should render without the centered max width wrapper
  const fullWidthPrefixes = ["/siswa/login", "/admin", "/guru"];
  // use prefix matching so all /admin routes (like /admin/siswa) become full-width
  const isFull = fullWidthPrefixes.some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
      <main className={`w-full ${isFull ? "" : "max-w-4xl"}`}>
        <Routes>
            {/* Home */}
            <Route
              path="/"
              element={
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Selamat Datang di LMS SD Negeri Proyonanggan 9 Batang
                  </h1>
                  {/* Mobile View: Single card with dashboard.jpg */}
                  <div className="flex sm:hidden bg-white rounded-lg shadow-lg p-6 flex-col items-center">
                    <img
                      src={DashboardImage}
                      alt="LMS Sekolah Dasar"
                      className="w-full max-w-xs rounded-lg shadow-md mb-4"
                    />
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                      <p className="text-sm text-gray-600">Pilih salah satu untuk melanjutkan:</p>
                      <Link
                        to="/siswa/login"
                        className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                      >
                        <User className="w-5 h-5" />
                        Login Murid
                      </Link>
                     
                      <Link
                        to="/admin/login"
                        className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                      >
                        <School className="w-5 h-5" />
                        Login Guru
                      </Link>
                    </div>
                  </div>
                  {/* Desktop View: Two cards with murid.jpg and guru.jpg */}
                  <div className="hidden sm:grid sm:grid-cols-2 gap-6">
                    {/* Student Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                      <img
                        src={MuridImage}
                        alt="Login Murid"
                        className="w-full max-w-xs rounded-lg shadow-md mb-4"
                      />
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Murid
                      </h2>
                      <Link
                        to="/siswa/login"
                        className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 w-full max-w-xs"
                      >
                        <User className="w-5 h-5" />
                        Login Murid
                      </Link>
                    </div>
                    {/* Teacher Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                      <img
                        src={GuruImage}
                        alt="Login Guru"
                        className="w-full max-w-xs rounded-lg shadow-md mb-4"
                      />
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Guru
                      </h2>
                      <Link
                        to="/admin/login"
                        className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 w-full max-w-xs"
                      >
                        <School className="w-5 h-5" />
                        Login Guru
                      </Link>
                    </div>
                  </div>
                </div>
              }
            />

            {/* Public / Auth */}
            <Route path="/siswa/login" element={<StudentLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

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
            <Route
              path="/admin/siswa/edit/:id"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <SiswaEdit />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/siswa/:id"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <SiswaDetail />
                </RoleProtectedRoute>
              }
            />
            {/* Admin: list guru */}
            <Route
              path="/admin/guru"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <GuruList />
                </RoleProtectedRoute>
              }
            />
            {/* Admin: create guru */}
            <Route
              path="/admin/guru/create"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <GuruForm />
                </RoleProtectedRoute>
              }
            />

            {/* Admin: assign wali kelas */}
            <Route
              path="/admin/guru/wali-kelas/assign"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <AssignWali />
                </RoleProtectedRoute>
              }
            />

            {/* Admin: edit guru */}
            <Route
              path="/admin/guru/edit/:id"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <GuruEdit />
                </RoleProtectedRoute>
              }
            />

            {/* Admin: list admin */}
            <Route
              path="/admin/admins"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <AdminList />
                </RoleProtectedRoute>
              }
            />

            {/* Admin: create admin */}
            <Route
              path="/admin/admins/create"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <AdminForm />
                </RoleProtectedRoute>
              }
            />

            {/* Admin: reset password */}
            <Route
              path="/admin/admins/reset-password/:id"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <AdminResetPassword />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/mapel"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <MapelDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/kelas-mapel"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <KelasMapelManager />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/create-mapel"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <MapelList />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/tahun-ajaran"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <TahunAjaranIndex />
                </RoleProtectedRoute>
              }
            />
             <Route
              path="/admin/logs"
              element={
                <RoleProtectedRoute allowed={["admin"]}>
                  <DashboardLog />
                </RoleProtectedRoute>
              }
            />

            {/* Guru protected */}
            <Route
              path="/guru"
              element={
                <RoleProtectedRoute allowed={["guru"]}>
                  <GuruDashboard />
                </RoleProtectedRoute>
              }
            />
            {/* Guru protected */}
            <Route
              path="/guru/nilai"
              element={
                <RoleProtectedRoute allowed={["guru"]}>
                  <NilaiAkhir />
                </RoleProtectedRoute>
              }
            />
            
             <Route
              path="/guru/nilai-detail"
              element={
                <RoleProtectedRoute allowed={["guru"]}>
                  <NilaiDetailDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Fallback: you can add 404 route here if desired */}
          </Routes>
        </main>
      </div>
  );
}
// src/components/RoleAwareNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Ambil user dari localStorage. Format userInfo sesuai apa yang disimpan oleh backend.
 */
function getUser() {
  const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function RoleAwareNavbar() {
  const user = getUser();
  const role = user?.role ?? user?.roles ?? null;

  return (
    <header className="bg-white border-b">
      <div className="max-w-full mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-blue-600">LMS SD</Link>

          <nav className="flex items-center gap-4 text-sm">
            {/* Guest */}
            {!user && (
              <>
                <Link to="/siswa/login" className="text-gray-700 hover:text-blue-600">Login Siswa</Link>
                <Link to="/admin/login" className="text-gray-700 hover:text-blue-600">Login Admin</Link>
                <Link to="/guru/login" className="text-gray-700 hover:text-blue-600">Login Guru</Link>
              </>
            )}

            {/* Admin */}
            {user && role === "admin" && (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">Dashboard Admin</Link>
                <Link to="/admin/siswa" className="text-gray-700 hover:text-blue-600">Siswa</Link>
                <Link to="/admin/guru" className="text-gray-700 hover:text-blue-600">Guru</Link>
                <Link to="/admin/mapel" className="text-gray-700 hover:text-blue-600">Mapel</Link>
              </>
            )}

            {/* Guru */}
            {user && role === "guru" && (
              <>
                <Link to="/guru" className="text-gray-700 hover:text-blue-600">Dashboard Guru</Link>
                <Link to="/guru/siswa" className="text-gray-700 hover:text-blue-600">Siswa</Link>
                <Link to="/guru/nilai" className="text-gray-700 hover:text-blue-600">Input Nilai</Link>
              </>
            )}

            {/* Siswa */}
            {user && role === "siswa" && (
              <>
                <Link to="/siswa/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard Siswa</Link>
              </>
            )}

            {/* Common: profile & logout when logged in */}
            {user && (
              <>
                <span className="text-gray-400">|</span>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userInfo");
                    localStorage.removeItem("user");
                    // force reload to re-evaluate role and routes
                    window.location.href = "/";
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

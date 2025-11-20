// src/components/layout/SiswaLayout.jsx
import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Award, User, LogOut, Menu, X, Key } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import api from "../../_api";
import * as SiswaService from "../../_services/siswa";

export default function SiswaLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const menu = [
    { icon: Home, label: "Dashboard", to: "/siswa/dashboard" },
    { icon: BookOpen, label: "Mata Pelajaran", to: "/siswa/mapel" },
    { icon: Award, label: "Nilai Saya", to: "/siswa/nilai" },
  ];

  const { logout, setUser, setToken } = useContext(AuthContext);

 const handleLogout = async () => {
    // close menus
    setProfileOpen(false);
    setMobileMenuOpen(false)

    // Preferred: use centralized logout if available
    if (typeof logout === "function") {
      try {
        await logout(); // AuthProvider should clear state + storage
        navigate("/siswa/login");
        return;
      } catch (err) {
        console.warn("AuthContext.logout failed (fallback):", err);
      }
    }

    // Fallback force-clear to avoid intermediate states causing remounts/spam
    try {
      // reset context state if setters exposed
      if (typeof setToken === "function") setToken(null);
      if (typeof setUser === "function") setUser(null);
    } catch (e) {
      // ignore
    }

    try {
      localStorage.clear(); // blunt but effective fallback
    } catch (e) {
      console.warn("localStorage.clear failed:", e);
    }

    // remove axios auth header if present
    try {
      if (api?.defaults?.headers?.common) {
        delete api.defaults.headers.common["Authorization"];
      }
    } catch (e) {
      console.warn("Failed to remove axios Authorization header:", e);
    }

    // navigate immediately to login to avoid remount loops
    navigate("/siswa/login");

    // best-effort backend logout (don't await to avoid blocking UI)
    if (SiswaService && typeof SiswaService.logoutSiswa === "function") {
      SiswaService.logoutSiswa().catch(() => {});
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Portal Siswa</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Learning Management System</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              {menu.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Profile Dropdown - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.nama ? user.nama.charAt(0).toUpperCase() : "S"}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{user?.nama ?? "Siswa"}</div>
                  <div className="text-xs text-gray-500">
                    {user?.kelas ? `Kelas ${user.kelas}` : "Siswa"}
                  </div>
                </div>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20 py-1">
                    <Link
                      to="/siswa/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profil Saya
                    </Link>
                    <Link
                      to="/siswa/profile/password"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Key className="w-4 h-4" />
                      Ubah Password
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {menu.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      active
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <hr className="my-2" />
              <Link
                to="/siswa/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                <User className="w-5 h-5" />
                Profil Saya
              </Link>
              <Link
                to="/siswa/profile/password"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                <Key className="w-5 h-5" />
                Ubah Password
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
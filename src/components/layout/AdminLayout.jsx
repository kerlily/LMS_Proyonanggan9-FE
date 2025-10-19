// src/components/layout/AdminLayout.jsx
import React, { useState, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Key,
  Calendar,
} from "lucide-react";
import { logout as serviceLogout } from "../../_services/auth";
import ProfileModal from "../ProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // user state - will update when localStorage changes
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Listen to localStorage changes to update user state
  useEffect(() => {
    const handleStorageChange = () => {
      const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen to custom event for same-tab updates
    window.addEventListener('userInfoUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userInfoUpdated', handleStorageChange);
    };
  }, []);

  const menu = [
    { icon: Home, label: "Overview", to: "/admin" },
    { icon: Users, label: "Siswa", to: "/admin/siswa" },
    { icon: GraduationCap, label: "Guru", to: "/admin/guru" },
    { icon: BookOpen, label: "Mapel", to: "/admin/mapel" },
    { icon: Calendar, label: "Tahun Ajaran", to: "/admin/tahun-ajaran" },
  ];

  const handleLogout = useCallback(async () => {
    try {
      await serviceLogout();
    } catch {
      // ignore errors from serviceLogout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  }, [navigate]);

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const openProfileModal = () => {
    setProfileModalOpen(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const openPasswordModal = () => {
    setPasswordModalOpen(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleProfileSaved = () => {
    // Reload user data from localStorage
    const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : null);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('userInfoUpdated'));
  };

  // Get display name and initial
  const displayName = user?.nama ?? user?.name ?? "Admin";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
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
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
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
                onClick={() => setProfileDropdownOpen((p) => !p)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {userInitial}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{displayName}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20 py-1">
                    <button
                      onClick={(e) => { e.preventDefault(); openProfileModal(); }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      Edit Profil
                    </button>

                    <button
                      onClick={(e) => { e.preventDefault(); openPasswordModal(); }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Key className="w-4 h-4" />
                      Ubah Password
                    </button>

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
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
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
                      active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              <hr className="my-2" />

              <button
                onClick={() => { setMobileMenuOpen(false); openProfileModal(); }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full text-left"
              >
                <User className="w-5 h-5" />
                Edit Profil
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); openPasswordModal(); }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full text-left"
              >
                <Key className="w-5 h-5" />
                Ubah Password
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Profile modal instances */}
      <ProfileModal
        isOpen={profileModalOpen}
        onRequestClose={() => setProfileModalOpen(false)}
        initialUser={user}
        onSaved={handleProfileSaved}
      />

      <ChangePasswordModal 
        isOpen={passwordModalOpen} 
        onRequestClose={() => setPasswordModalOpen(false)} 
      />
    </div>
  );
}
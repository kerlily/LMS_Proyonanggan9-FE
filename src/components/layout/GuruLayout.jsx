// src/components/layout/GuruLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, User, LogOut, Menu, X, Key } from "lucide-react";
import { logout as serviceLogout } from "../../_services/auth";
import ProfileModal from "../ProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";

export default function GuruLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // User state - will update when localStorage changes
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
    window.addEventListener('userInfoUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userInfoUpdated', handleStorageChange);
    };
  }, []);

  const menu = [
    { icon: Home, label: "Dashboard", to: "/guru" },
    { icon: ClipboardList, label: "Nilai", to: "/guru/nilai" },
  ];

  const handleLogout = async () => {
    try {
      await serviceLogout();
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/guru/login");
  };

  const isActive = (path) => {
    if (path === "/guru") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const openProfileModal = () => {
    setProfileModalOpen(true);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const openPasswordModal = () => {
    setPasswordModalOpen(true);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const handleProfileSaved = () => {
    // Reload user data from localStorage
    const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : null);
    
    // Dispatch custom event
    window.dispatchEvent(new Event('userInfoUpdated'));
  };

  // FIXED: Get display name, initial, and photo URL dengan pattern yang sama
  const displayName = user?.nama ?? user?.name ?? "Guru";
  const userInitial = displayName.charAt(0).toUpperCase();
  
  // Build photo URL dengan pattern yang work
  const avatarPhotoUrl = user?.photo_url ?? 
    user?.guru?.photo_url ?? 
    (user?.guru?.photo ? 
      (user.guru.photo.startsWith("http") ? 
        user.guru.photo : 
        `${window.location.origin}/storage/${user.guru.photo}`
      ) : 
      (user?.photo ? 
        (user.photo.startsWith("http") ? 
          user.photo : 
          `${window.location.origin}/storage/${user.photo}`
        ) : null
      )
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Portal Guru</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Learning Management System</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {menu.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
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
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                {avatarPhotoUrl ? (
                  <img 
                    src={avatarPhotoUrl} 
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback jika gambar gagal load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm ${avatarPhotoUrl ? 'hidden' : ''}`}
                >
                  {userInitial}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{displayName}</div>
                  <div className="text-xs text-gray-500">Guru</div>
                </div>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onRequestClose={() => setProfileModalOpen(false)}
        initialUser={user}
        onSaved={handleProfileSaved}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={passwordModalOpen} 
        onRequestClose={() => setPasswordModalOpen(false)} 
      />
    </div>
  );
}
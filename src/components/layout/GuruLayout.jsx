// src/components/layout/GuruLayout.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, User, LogOut, Menu, X, Key } from "lucide-react";
import { logout as serviceLogout } from "../../_services/auth";
import ProfileModal from "../ProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";

export default function GuruLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // FIXED: Use controlled state update to prevent infinite loop
  const [userState, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Error parsing user info:", e);
      return null;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const updateInProgressRef = useRef(false);

  // FIXED: Listen to localStorage changes with proper guards
  useEffect(() => {
    const handleStorageChange = () => {
      // Prevent re-entry
      if (updateInProgressRef.current) return;
      
      try {
        updateInProgressRef.current = true;
        const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
        const newUser = raw ? JSON.parse(raw) : null;
        
        // Only update if actually different
        setUserState(prevUser => {
          const prevStr = JSON.stringify(prevUser);
          const newStr = JSON.stringify(newUser);
          return prevStr !== newStr ? newUser : prevUser;
        });
      } catch (e) {
        console.error("Error updating user:", e);
      } finally {
        updateInProgressRef.current = false;
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userInfoUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userInfoUpdated', handleStorageChange);
    };
  }, []); // Empty deps - only setup once

  const menu = [
    { icon: Home, label: "Dashboard", to: "/guru" },
    { icon: ClipboardList, label: "Nilai", to: "/guru/nilai" },
    { icon: ClipboardList, label: "Nilai Detail", to: "/guru/nilai-detail" },
  ];

  const handleLogout = useCallback(async () => {
    try {
      await serviceLogout();
    } catch (err) {
      console.warn("Logout service error:", err);
    }
    
    // Clear all tokens
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");
    
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const isActive = (path) => {
    if (path === "/guru") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const openProfileModal = useCallback(() => {
    setProfileModalOpen(true);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, []);

  const openPasswordModal = useCallback(() => {
    setPasswordModalOpen(true);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, []);

  const handleProfileSaved = useCallback(() => {
    try {
      const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
      const newUser = raw ? JSON.parse(raw) : null;
      
      setUserState(prevUser => {
        const prevStr = JSON.stringify(prevUser);
        const newStr = JSON.stringify(newUser);
        return prevStr !== newStr ? newUser : prevUser;
      });
      
      // Dispatch custom event
      window.dispatchEvent(new Event('userInfoUpdated'));
    } catch (e) {
      console.error("Error in handleProfileSaved:", e);
    }
  }, []);

  // Memoize display values
  const displayName = userState?.nama ?? userState?.name ?? "Guru";
  const userInitial = displayName.charAt(0).toUpperCase();
  
  const buildPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    
    const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
    return `${baseUrl}/storage/${photoPath}`;
  };

  const avatarPhotoUrl = userState?.photo_url ?? 
    userState?.guru?.photo_url ?? 
    buildPhotoUrl(userState?.guru?.photo) ?? 
    buildPhotoUrl(userState?.photo) ?? 
    null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Portal Guru</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Learning Management System</p>
              </div>
            </div>

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
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <ProfileModal
        isOpen={profileModalOpen}
        onRequestClose={() => setProfileModalOpen(false)}
        initialUser={userState}
        onSaved={handleProfileSaved}
      />

      <ChangePasswordModal 
        isOpen={passwordModalOpen} 
        onRequestClose={() => setPasswordModalOpen(false)} 
      />
    </div>
  );
}
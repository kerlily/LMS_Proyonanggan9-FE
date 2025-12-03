// src/components/layout/AdminLayout.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Logs,
  Calendar,
  BookImage,
  Newspaper,
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react";
import { logout as serviceLogout } from "../../_services/auth";
import ProfileModal from "../ProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);

  // Use ref to store user data to avoid triggering re-renders
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
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log("Storage change detected:", e);
      if (updateInProgressRef.current) return; 
      
      try {
        updateInProgressRef.current = true;
        const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
        const newUser = raw ? JSON.parse(raw) : null;
        
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
  }, []);

  // Menu structure dengan dropdown untuk desktop
  const menuItems = [
    { icon: Home, label: "Overview", to: "/admin" },
    { 
      label: "Manajemen User", 
      icon: Users,
      items: [
        { icon: Users, label: "Siswa", to: "/admin/siswa" },
        { icon: GraduationCap, label: "Guru", to: "/admin/guru" },
        { icon: User, label: "Admin", to: "/admin/admins" },
      ]
    },
    { 
      label: "Akademik", 
      icon: BookOpen,
      items: [
        { icon: BookOpen, label: "Mapel", to: "/admin/mapel" },
        { icon: Calendar, label: "Tahun Ajaran", to: "/admin/tahun-ajaran" },
      ]
    },
    { 
      label: "Konten", 
      icon: Newspaper,
      items: [
        { icon: Newspaper, label: "Berita", to: "/admin/berita" },
        { icon: BookImage, label: "Galeri", to: "/admin/gallery" },
      ]
    },
    { icon: Logs, label: "Logs", to: "/admin/logs" },
  ];

  const handleLogout = useCallback(async () => {
    try {
      await serviceLogout();
    } catch (err) {
      console.warn("Logout service error:", err);
    }
    
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");
    
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isDropdownActive = (items) => {
    return items.some(item => isActive(item.to));
  };

  const openProfileModal = useCallback(() => {
    setProfileModalOpen(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileOpenDropdown(null);
  }, []);

  const openPasswordModal = useCallback(() => {
    setPasswordModalOpen(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileOpenDropdown(null);
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
      
      window.dispatchEvent(new Event('userInfoUpdated'));
    } catch (e) {
      console.error("Error in handleProfileSaved:", e);
    }
  }, []);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const toggleMobileDropdown = (dropdownName) => {
    setMobileOpenDropdown(mobileOpenDropdown === dropdownName ? null : dropdownName);
  };

  const handleMobileMenuItemClick = (item) => {
    if (item.items) {
      toggleMobileDropdown(item.label);
    } else {
      setMobileMenuOpen(false);
      setMobileOpenDropdown(null);
    }
  };

  const displayName = userState?.nama ?? userState?.name ?? "Admin";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-indigo-900/95 backdrop-blur-xl border-b border-indigo-700 shadow-lg' 
          : 'bg-indigo-900 backdrop-blur-lg border-b border-indigo-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-indigo-200 hidden sm:block">Learning Management System</p>
              </div>
            </div>

            {/* Desktop Navigation dengan Dropdown */}
            <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                if (item.items) {
                  // Dropdown menu item
                  const isActiveDropdown = isDropdownActive(item.items);
                  return (
                    <div key={item.label} className="relative">
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                          isActiveDropdown
                            ? "text-white bg-indigo-700/50 shadow-sm border border-indigo-600/50"
                            : "text-indigo-100 hover:text-white hover:bg-indigo-700/30"
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-transform duration-200 ${
                          isActiveDropdown ? "scale-110" : "group-hover:scale-110"
                        }`} />
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {openDropdown === item.label && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-indigo-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-700 z-30 py-2">
                          {item.items.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const active = isActive(subItem.to);
                            return (
                              <Link
                                key={subItem.to}
                                to={subItem.to}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                                  active
                                    ? "text-white bg-indigo-700/50"
                                    : "text-indigo-100 hover:bg-indigo-700/30 hover:text-white"
                                }`}
                              >
                                <SubIcon className="w-4 h-4" />
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // Regular menu item
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        active
                          ? "text-white bg-indigo-700/50 shadow-sm border border-indigo-600/50"
                          : "text-indigo-100 hover:text-white hover:bg-indigo-700/30"
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform duration-200 ${
                        active ? "scale-110" : "group-hover:scale-110"
                      }`} />
                      {item.label}
                      {active && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                      )}
                    </Link>
                  );
                }
              })}
            </div>

            {/* Profile Section */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setProfileDropdownOpen((p) => !p)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-700/50 transition-all duration-200 group border border-transparent hover:border-indigo-600/50"
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-indigo-400 ring-offset-2 ring-offset-indigo-900">
                  {userInitial}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{displayName}</div>
                  <div className="text-xs text-indigo-200 flex items-center gap-1">Administrator</div>
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-indigo-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-700 z-20 py-2 transform origin-top-right transition-all duration-200">
                    <div className="px-4 py-3 border-b border-indigo-700/50">
                      <div className="text-sm font-semibold text-white">{displayName}</div>
                      <div className="text-xs text-indigo-200">Administrator</div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={openProfileModal}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-100 hover:bg-indigo-700/50 transition-colors duration-150"
                      >
                        <User className="w-4 h-4" />
                        Edit Profil
                      </button>
                      <button
                        onClick={openPasswordModal}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-100 hover:bg-indigo-700/50 transition-colors duration-150"
                      >
                        <Key className="w-4 h-4" />
                        Ubah Password
                      </button>
                    </div>
                    <div className="border-t border-indigo-700/50 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 transition-colors duration-150 rounded-lg mx-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2.5 rounded-xl hover:bg-indigo-700/50 transition-all duration-200 border border-transparent hover:border-indigo-600/50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu dengan Dropdown Sama seperti Desktop */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-indigo-700 bg-indigo-900/95 backdrop-blur-xl" ref={mobileMenuRef}>
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                if (item.items) {
                  // Mobile dropdown menu item
                  const isActiveDropdown = isDropdownActive(item.items);
                  const isOpen = mobileOpenDropdown === item.label;
                  
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => handleMobileMenuItemClick(item)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActiveDropdown
                            ? "bg-indigo-700 text-white shadow-sm border border-indigo-600/50"
                            : "text-indigo-100 hover:bg-indigo-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-90' : ''
                        }`} />
                      </button>

                      {isOpen && (
                        <div className="ml-4 mt-1 space-y-1 pl-3 border-l border-indigo-700/50">
                          {item.items.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const active = isActive(subItem.to);
                            return (
                              <Link
                                key={subItem.to}
                                to={subItem.to}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileOpenDropdown(null);
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                                  active
                                    ? "bg-indigo-700/50 text-white"
                                    : "text-indigo-100 hover:bg-indigo-700/30"
                                }`}
                              >
                                <SubIcon className="w-4 h-4" />
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // Regular mobile menu item
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileOpenDropdown(null);
                      }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-indigo-700 text-white shadow-sm border border-indigo-600/50"
                          : "text-indigo-100 hover:bg-indigo-700/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                }
              })}

              <hr className="my-2 border-indigo-700/50" />

              {/* Profile Section for Mobile */}
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-2">
                  Akun
                </div>
                
                <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userInitial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{displayName}</div>
                    <div className="text-xs text-indigo-200">Administrator</div>
                  </div>
                </div>
                
                <button
                  onClick={openProfileModal}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-100 hover:bg-indigo-700/50 transition-colors duration-150 text-left"
                >
                  <User className="w-5 h-5" />
                  Edit Profil
                </button>
                <button
                  onClick={openPasswordModal}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-100 hover:bg-indigo-700/50 transition-colors duration-150 text-left"
                >
                  <Key className="w-5 h-5" />
                  Ubah Password
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 transition-colors duration-150 text-left mt-1"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

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
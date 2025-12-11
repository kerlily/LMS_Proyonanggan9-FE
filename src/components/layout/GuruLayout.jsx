// src/components/layout/GuruLayout.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, Clipboard, User, LogOut, Menu, X, Key, ChevronDown, BookImage, Newspaper, UserStar, Calendar, HelpCircle } from "lucide-react";
import { logout as serviceLogout } from "../../_services/auth"; 
import ProfileModal from "../ProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";

export default function GuruLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState(null);

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
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

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
      // Untuk desktop dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      
      // Untuk mobile dropdown
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // FIXED: Listen to localStorage changes with proper guards
  useEffect(() => {
    const handleStorageChange = () => {
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

  // Menu structure dengan dropdown
  const menuItems = [
    { icon: Home, label: "Dashboard", to: "/guru" },
    { icon: User, label: "Nilai Siswa", to: "/guru/nilai-siswa" },
    { 
      label: "Manajemen Nilai", 
      icon: ClipboardList,
      items: [
        { icon: ClipboardList, label: "Nilai (Excel)", to: "/guru/nilai" },
        { icon: Clipboard, label: "Pengolahan Nilai", to: "/guru/nilai-detail" },
        { icon: UserStar, label: "Nilai Sikap", to: "/guru/nilai-sikap" },
        { icon: Calendar, label: "Jadwal", to: "/guru/jadwal" },
      ]
    },
    { 
      label: "Konten", 
      icon: Newspaper,
      items: [
        { icon: Newspaper, label: "Berita", to: "/guru/berita" },
        { icon: BookImage, label: "Galeri", to: "/guru/gallery" },
      ]
    },
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

  // FIXED: Improved isActive function dengan exact matching untuk path yang spesifik
  const isActive = (path) => {
    if (path === "/guru") {
      return location.pathname === "/guru";
    }
    
    // Untuk path yang mengandung "nilai", kita perlu exact matching
    const exactPaths = [
      "/guru/nilai",
      "/guru/nilai-detail", 
      "/guru/nilai-sikap",
      "/guru/nilai-siswa"
    ];
    
    if (exactPaths.includes(path)) {
      return location.pathname === path;
    }
    
    // Untuk path lainnya, gunakan startsWith
    return location.pathname.startsWith(path);
  };

  // Check if dropdown contains active item
  const isDropdownActive = (items) => {
    return items.some(item => isActive(item.to));
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
      
      window.dispatchEvent(new Event('userInfoUpdated'));
    } catch (e) {
      console.error("Error in handleProfileSaved:", e);
    }
  }, []);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const toggleMobileDropdown = (dropdownName) => {
    setMobileDropdown(mobileDropdown === dropdownName ? null : dropdownName);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Modern Navbar dengan Warna Biru Tua Keunguan */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-indigo-900/95 backdrop-blur-xl border-b border-indigo-700 shadow-lg' 
          : 'bg-indigo-900 backdrop-blur-lg border-b border-indigo-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Portal Guru
                </h1>
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

                      {/* Tombol Help - DESKTOP */}
                <a
                  href="/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-100 hover:text-white hover:bg-indigo-700/30 transition-all duration-200"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help
                </a>


            </div>


            {/* User Profile Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-700/50 transition-all duration-200 group border border-transparent hover:border-indigo-600/50"
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <div className="relative">
                  {avatarPhotoUrl ? (
                    <img 
                      src={avatarPhotoUrl} 
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-indigo-400 ring-offset-2 ring-offset-indigo-900"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-indigo-400 ring-offset-2 ring-offset-indigo-900 ${avatarPhotoUrl ? 'hidden' : ''}`}
                  >
                    {userInitial}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-900"></div>
                </div>
                
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{displayName}</div>
                  <div className="text-xs text-indigo-200 flex items-center gap-1">
                    <span>Guru</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-indigo-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-700 z-20 py-2 transform origin-top-right transition-all duration-200">
                    <div className="px-4 py-3 border-b border-indigo-700/50">
                      <div className="text-sm font-semibold text-white">{displayName}</div>
                      <div className="text-xs text-indigo-200">Guru</div>
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-indigo-700/50 transition-all duration-200 border border-transparent hover:border-indigo-600/50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu dengan Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-indigo-700 bg-indigo-900/95 backdrop-blur-xl" ref={mobileDropdownRef}>
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                if (item.items) {
                  // Dropdown menu item untuk mobile
                  const isActiveDropdown = isDropdownActive(item.items);
                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() => toggleMobileDropdown(item.label)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActiveDropdown
                            ? "bg-indigo-700 text-white shadow-sm border border-indigo-600/50"
                            : "text-indigo-100 hover:bg-indigo-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          mobileDropdown === item.label ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {mobileDropdown === item.label && (
                        <div className="ml-6 space-y-1 border-l border-indigo-700/50 pl-3">
                          {item.items.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const active = isActive(subItem.to);
                            return (
                              <Link
                                key={subItem.to}
                                to={subItem.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 ${
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
                  // Regular menu item untuk mobile
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-indigo-700 text-white shadow-sm border border-indigo-600/50"
                          : "text-indigo-100 hover:bg-indigo-700/50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
                      {item.label}
                    </Link>
                  );
                }
              })}

               {/* Tombol Help - MOBILE */}
              <a
                href="/help"
                target="_blank"
                rel="noopener noreferrer"
                className="flex md:hidden items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-indigo-100 hover:bg-indigo-700/50"
              >
                <HelpCircle className="w-5 h-5" />
                Help
              </a>
              
              <hr className="my-2 border-indigo-700/50" />
              
              {/* User Profile Section untuk Mobile */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-3 mb-3 px-2 py-2 rounded-xl bg-indigo-800/50">
                  <div className="relative">
                    {avatarPhotoUrl ? (
                      <img 
                        src={avatarPhotoUrl} 
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-indigo-400"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-sm ring-2 ring-indigo-400 ${avatarPhotoUrl ? 'hidden' : ''}`}
                    >
                      {userInitial}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{displayName}</div>
                    <div className="text-xs text-indigo-200">Guru</div>
                  </div>
                </div>
                
                <button
                  onClick={() => { setMobileMenuOpen(false); openProfileModal(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-100 hover:bg-indigo-700/50 w-full text-left transition-colors duration-150"
                >
                  <User className="w-5 h-5" />
                  Edit Profil
                </button>
                
                <button
                  onClick={() => { setMobileMenuOpen(false); openPasswordModal(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-100 hover:bg-indigo-700/50 w-full text-left transition-colors duration-150"
                >
                  <Key className="w-5 h-5" />
                  Ubah Password
                </button>
                
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 w-full text-left transition-colors duration-150 mt-1"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
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
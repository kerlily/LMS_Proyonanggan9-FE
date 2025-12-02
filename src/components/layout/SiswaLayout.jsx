import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Award, Calendar, Key, LogOut, Menu, X, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import ModalGantiPassword from "../siswa/ModalGantiPassword";
import { changePassword, logoutSiswa } from "../../_services/siswa";

export default function SiswaLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const logoutInProgressRef = useRef(false);
  const navigatedRef = useRef(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const menu = [
    { icon: Award, label: "Nilai Saya", to: "/siswa/dashboard" },
    { icon: Calendar, label: "Jadwal", to: "/siswa/jadwal" },
      ];

  const handleChangePassword = async (formData) => {
    try {
      await changePassword(formData);
    } catch (err) {
      console.log("error",err)
    }
  };

  // Safe logout helper: guard against repeated calls and double navigation
  const safeLogout = async () => {
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;
    setLoggingOut(true);

    try {
      // Attempt server-side logout but ignore network errors (we'll still clear local state)
      await logoutSiswa().catch((e) => {
        // swallow network/token errors
        console.warn("logoutSiswa network error (ignored):", e);
      });
    } catch (err) {
      console.warn("logout unexpected error:", err);
    } finally {
      // Clear local auth data no matter what
      try {
        localStorage.removeItem("siswa_token");
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("user");
      } catch (e) {
        console.warn("error clearing localStorage:", e);
      }

      logoutInProgressRef.current = false;
      setLoggingOut(false);

      // Navigate to login only once
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        navigate("/siswa/login");
      }
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);

    const result = await Swal.fire({
      title: "Logout?",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      await safeLogout();
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Memoize display values
  const displayName = user?.nama ?? "Siswa";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userClass = user?.kelas_saat_ini ?? "Siswa";

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
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Portal Siswa
                </h1>
                <p className="text-xs text-indigo-200 hidden sm:block">Learning Management System</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {menu.map((item) => {
                const Icon = item.icon;
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
              })}
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
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-indigo-400 ring-offset-2 ring-offset-indigo-900">
                    {userInitial}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-900"></div>
                </div>
                
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{displayName}</div>
                  <div className="text-xs text-indigo-200 flex items-center gap-1">
                    <span>{userClass}</span>
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
                      <div className="text-xs text-indigo-200">{userClass}</div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setShowPasswordModal(true);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-100 hover:bg-indigo-700/50 transition-colors duration-150"
                      >
                        <Key className="w-4 h-4" />
                        Ganti Password
                      </button>
                    </div>
                    
                    <div className="border-t border-indigo-700/50 pt-2">
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 transition-colors duration-150 rounded-lg mx-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {loggingOut ? 'Logging out...' : 'Logout'}
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
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-indigo-700 bg-indigo-900/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {menu.map((item) => {
                const Icon = item.icon;
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
              })}
              
              <hr className="my-2 border-indigo-700/50" />
              
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-2">
                  Akun
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowPasswordModal(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-100 hover:bg-indigo-700/50 w-full text-left transition-colors duration-150"
                >
                  <Key className="w-5 h-5" />
                  Ganti Password
                </button>
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 w-full text-left transition-colors duration-150 mt-1"
                >
                  <LogOut className="w-5 h-5" />
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Modal Ganti Password */}
      <ModalGantiPassword
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handleChangePassword}
      />
    </div>
  );
}

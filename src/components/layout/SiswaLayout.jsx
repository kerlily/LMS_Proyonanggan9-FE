// src/components/layout/SiswaLayout.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Award, Calendar, Key, LogOut, Menu, X, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import ModalGantiPassword from "../siswa/ModalGantiPassword";
// import { changePassword, logoutSiswa } from "../../_services/siswa"; // HAPUS direct logoutSiswa
import { changePassword } from "../../_services/siswa";
import AuthContext from "../../context/AuthContext";

export default function SiswaLayout({ children }) {
  const { user: ctxUser, logout } = useContext(AuthContext); // <-- gunakan context
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const logoutInProgressRef = useRef(false);
  const navigatedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // gunakan user dari context (lebih konsisten dan predictable daripada parse localStorage)
  const user = ctxUser;
  const displayName = (user?.nama ?? user?.name ?? "Siswa");
  const userInitial = displayName?.charAt(0)?.toUpperCase() ?? "S";
  const userClass = user?.kelas_saat_ini ?? "Siswa";

  const menu = [
    { icon: Award, label: "Nilai Saya", to: "/siswa/dashboard" },
    { icon: Calendar, label: "Jadwal", to: "/siswa/jadwal" },
  ];

  const handleChangePassword = async (formData) => {
    try {
      await changePassword(formData);
    } catch (err) {
      console.log("error", err);
    }
  };

  // safeLogout sekarang memakai AuthContext.logout
  const safeLogout = async () => {
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;
    setLoggingOut(true);

    try {
      // panggil logout dari context yang langsung membersihkan client-side state
      // AuthProvider.logout juga melakukan best-effort server logout setelah clear.
      await logout(); // ini synchronous clear di AuthProvider lalu melakukan server calls tanpa mengubah client state lagi
    } catch (e) {
      console.warn("safeLogout: logout() error (ignored):", e);
      // fallback: bersihkan localStorage secara manual
      try {
        localStorage.removeItem("siswa_token");
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("user");
      } catch (er) {
        console.warn("error clearing localStorage:", er);
      }
    } finally {
      logoutInProgressRef.current = false;
      setLoggingOut(false);

      if (!navigatedRef.current) {
        navigatedRef.current = true;
        navigate("/siswa/login", { replace: true });
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

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="no-print">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-indigo-900/95 backdrop-blur-xl border-b border-indigo-700 shadow-lg' : 'bg-indigo-900 backdrop-blur-lg border-b border-indigo-800'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur opacity-20 transition duration-1000"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Portal Siswa</h1>
                  <p className="text-xs text-indigo-200 hidden sm:block">Learning Management System</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-1">
                {menu.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link key={item.to} to={item.to} className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active ? "text-white bg-indigo-700/50 shadow-sm border border-indigo-600/50" : "text-indigo-100 hover:text-white hover:bg-indigo-700/30"}`}>
                      <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                      {item.label}
                      {active && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
                    </Link>
                  );
                })}
              </div>

              {/* Profile */}
              <div className="hidden md:block relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-700/50 transition-all duration-200 group border border-transparent hover:border-indigo-600/50" aria-haspopup="true" aria-expanded={profileOpen}>
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
                        <button onClick={() => { setProfileOpen(false); setShowPasswordModal(true); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-100 hover:bg-indigo-700/50 transition-colors duration-150">
                          <Key className="w-4 h-4" />
                          Ganti Password
                        </button>
                      </div>

                      <div className="border-t border-indigo-700/50 pt-2">
                        <button onClick={handleLogout} disabled={loggingOut} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 transition-colors duration-150 rounded-lg mx-2">
                          <LogOut className="w-4 h-4" />
                          {loggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 rounded-xl hover:bg-indigo-700/50 transition-all duration-200 border border-transparent hover:border-indigo-600/50" aria-label="Toggle menu">
                {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile menu... (tetap sama, panggil handleLogout untuk mobile) */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-indigo-700 bg-indigo-900/95 backdrop-blur-xl">
              {/* ...content sama seperti sebelumnya (panggil handleLogout) */}
              <div className="px-4 py-3 space-y-1">
                {menu.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.to) ? "bg-indigo-700 text-white shadow-sm border border-indigo-600/50" : "text-indigo-100 hover:bg-indigo-700/50"}`}>
                    <item.icon className={`w-5 h-5 ${isActive(item.to) ? "scale-110" : ""}`} />
                    {item.label}
                  </Link>
                ))}
                <hr className="my-2 border-indigo-700/50" />
                <div className="px-3 py-2">
                  <div className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-2">Akun</div>
                  <button onClick={() => { setMobileMenuOpen(false); setShowPasswordModal(true); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-100 hover:bg-indigo-700/50 w-full text-left transition-colors duration-150">
                    <Key className="w-5 h-5" />
                    Ganti Password
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} disabled={loggingOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 w-full text-left transition-colors duration-150 mt-1">
                    <LogOut className="w-5 h-5" />
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

        <ModalGantiPassword isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} onSuccess={handleChangePassword} />
      </div>
    </div>
  );
}

// src/components/layout/Sidebar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, GraduationCap, BookOpen, LogOut, User, Key } from "lucide-react";
import { logout as serviceLogout } from "../../_services/auth";

export default function Sidebar({ open = true, onClose = () => {} }) {
  const location = useLocation();
  const menu = [
    { icon: Home, label: "Overview", to: "/admin" },
    { icon: Users, label: "Siswa", to: "/admin/siswa" },
    { icon: GraduationCap, label: "Guru", to: "/admin/guru" },
    { icon: BookOpen, label: "Mapel", to: "/admin/mapel" },
  ];

  const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleLogout = async () => {
    try {
      await serviceLogout();
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/admin/login");
  };

  return (
    <>
      {/* overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-opacity ${open ? "opacity-60 pointer-events-auto bg-black" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r transform transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-16 flex items-center px-4 border-b">
          <div className="font-bold text-indigo-600">LMS SD</div>
        </div>

        <nav className="p-4 space-y-1 overflow-auto">
          {menu.map((m) => {
            const active = location.pathname === m.to || (m.to !== "/" && location.pathname.startsWith(m.to));
            const Icon = m.icon;
            return (
              <Link
                key={m.to}
                to={m.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${active ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <Icon className="w-5 h-5" />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="text-xs text-gray-500 mb-2">Admin panel</div>

          {/* Profile card placed at bottom */}
          <div ref={profileRef} className="relative">
            <button onClick={() => setProfileOpen((s) => !s)} className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.nama ? user.nama.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{user?.nama ?? user?.name ?? "Admin"}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email ?? ""}</div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute left-0 bottom-14 w-full bg-white border rounded-md shadow-md py-1">
                <Link to="/admin/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User className="w-4 h-4" />
                  Edit Profil
                </Link>
                <Link to="/admin/profile/password" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Key className="w-4 h-4" />
                  Edit Password
                </Link>
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

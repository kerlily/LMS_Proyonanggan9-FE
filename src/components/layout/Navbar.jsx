// src/components/layout/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ compact = false }) {
  const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const role = user?.role ?? user?.role_name ?? null; // role used to pick links

  // Role-aware nav links (top-right) — adjust labels/paths as needed
  const commonLinks = [
    { label: "Home", to: "/" },
  ];
  const adminLinks = [
    { label: "Dashboard Admin", to: "/admin" },
    { label: "Siswa", to: "/admin/siswa" },
    { label: "Guru", to: "/admin/guru" },
    { label: "Admin", to: "/admin/admins" },
    { label: "Mapel", to: "/admin/mapel" },
    { label: "Tahun Ajaran", to: "/admin/tahun-ajaran" },
    { label: "Logs", to: "/admin/logs" },
  ];
  const guruLinks = [
    { label: "Dashboard Guru", to: "/guru" },
    { label: "Nilai", to: "/guru/nilai" },
    { label: "Profile", to: "/guru/profile" },
    { label: "Nilai-Detail", to: "/guru/nilai-detail" },
  ];
  const siswaLinks = [
    { label: "Dashboard Siswa", to: "/siswa/dashboard" },
    { label: "Profile", to: "/siswa/profile" },
  ];

  const links = role === "admin" ? adminLinks : role === "guru" ? guruLinks : role === "siswa" ? siswaLinks : commonLinks;

  return (
    <header className={`bg-white border-b border-gray-200 ${compact ? "h-14" : "h-16"} sticky top-0 z-30`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4" />

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4 text-sm">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-gray-600 hover:text-indigo-600">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

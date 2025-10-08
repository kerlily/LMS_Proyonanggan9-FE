// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { key: "overview", label: "Overview", to: "/admin" },
  { key: "siswa", label: "Siswa", to: "/admin/siswa" },
  { key: "guru", label: "Guru", to: "/admin/guru" },
  { key: "mapel", label: "Mapel", to: "/admin/mapel" },
  { key: "nilai", label: "Nilai", to: "/admin/nilai" },
];

export default function Sidebar() {
  const loc = useLocation();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="font-bold text-lg">LMS SD</div>
        <div className="text-xs text-gray-500">Admin panel</div>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-auto">
        {NAV.map((n) => {
          const active = loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");
          return (
            <Link
              key={n.key}
              to={n.to}
              className={`block px-3 py-2 rounded-md text-sm ${active ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Sekolah
      </div>
    </div>
  );
}

// src/components/Topbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onToggleSidebar }) {
  const nav = useNavigate();
  const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  return (
    <div className="bg-white border-b p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="md:hidden px-2 py-1 border rounded" onClick={onToggleSidebar}>☰</button>
        <div className="text-sm text-gray-700">Selamat datang, <span className="font-semibold">{user?.nama ?? user?.name ?? "-"}</span></div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => nav("/admin/profile")} className="text-sm text-gray-600 hover:underline">Profile</button>
      </div>
    </div>
  );
}

// src/pages/guru/GuruDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout as serviceLogout } from "../../_services/auth";
import GuruLayout from "../../components/layout/GuruLayout";

export default function GuruDashboard() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const handleLogout = async () => {
    await serviceLogout();  
    navigate("/admin/login");
  };

  return (
    <GuruLayout>
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Guru</h1>
          <div className="text-sm text-gray-600">{user ? `${user.nama ?? user.name ?? user.email}` : ""}</div>
        </div>  
        <div>
          <button onClick={handleLogout} className="px-3 py-1 rounded border text-red-600">Logout</button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold">Kelas & Siswa</h3>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold">Input / Edit Nilai</h3>
        </div>
      </div>
    </div>
    </GuruLayout>
  );
}
 
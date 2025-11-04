// src/pages/guru/GuruDashboard.jsx
import React from "react";
import GuruLayout from "../../components/layout/GuruLayout";

export default function GuruDashboard() {
 
  const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;


  return (
    <GuruLayout>
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Guru</h1>
          <div className="text-sm text-gray-600">{user ? `${user.nama ?? user.name ?? user.email}` : ""}</div>
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
 
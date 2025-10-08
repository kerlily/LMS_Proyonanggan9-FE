// src/pages/admin/AdminDashboard.jsx
import React from "react";
import AdminLayout from "../../components/AdminLayout";
import { StatCard } from "../../components/StatCard";
import Card from "../../components/Card";
import TahunAjaranCard from "../../components/TahunAjaranCard";
import Button from "../../components/Button";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Use a centered inner container to limit content width but allow sidebar to remain full height */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="text-sm text-gray-600">Selamat datang, Admin Sekolah</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/admin/siswa"}>Kelola Siswa</Button>
            <Button variant="outline" onClick={() => window.location.href = "/admin/guru"}>Kelola Guru</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Siswa" value="—" />
          <StatCard label="Total Guru" value="—" />
          <TahunAjaranCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Kelola Siswa">
            <p className="text-sm text-gray-600">Import, tambah, edit, hapus siswa.</p>
            <div className="mt-3">
              <Button variant="primary" onClick={() => window.location.href = "/admin/siswa"}>Buka Kelola Siswa</Button>
            </div>
          </Card>

          <Card title="Kelola Guru">
            <p className="text-sm text-gray-600">Tambah / jadikan wali / reset password.</p>
            <div className="mt-3">
              <Button variant="primary" onClick={() => window.location.href = "/admin/guru"}>Buka Kelola Guru</Button>
            </div>
          </Card>

          <Card title="Kelola Mapel">
            <p className="text-sm text-gray-600">Tambah mapel dan assign ke kelas.</p>
            <div className="mt-3">
              <Button variant="primary" onClick={() => window.location.href = "/admin/mapel"}>Buka Kelola Mapel</Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

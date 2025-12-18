// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  User,
  Newspaper,
  BookImage,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../_api";
import { listSiswa, listGuru } from "../../_services/admin";
import { listMapel } from "../../_services/mapel";
import { listAdmin } from "../../_services/adminUser";

// StatCard, ActionCard and fmt helpers (sama seperti sebelumnya)
function StatCard({ label, value, icon: Icon, color = "indigo", trend }) {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                ↑ {trend}% dari bulan lalu
              </p>
            )}
          </div>
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${colorClasses[color]}`}></div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  buttonText,
  onClick,
  icon: Icon,
  color = "indigo",
}) {
  const colorClasses = {
    indigo:
      "from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-300",
    purple:
      "from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300",
    blue: "from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300",
    green: "from-green-50 to-green-100 border-green-200 hover:border-green-300",
  };

  const buttonColors = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    blue: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`w-full ${buttonColors[color]} text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function fmt(n) {
  if (n === null || n === undefined) return "-";
  return new Intl.NumberFormat().format(n);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSiswa: null,
    totalGuru: null,
    totalMapel: null,
  });
  const [yearInfo, setYearInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // use shared api instance and service wrappers from src/_api and src/_services

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // use service wrappers which attach the shared api (and token interceptor)
        const pSiswa = listSiswa({ per_page: 1 });
        const pGuru = listGuru({ per_page: 1 });
        const pMapel = listMapel({ per_page: 1 });
        const pAdmin = listAdmin({ per_page: 1 });
        const pYear = api.get("/tahun-ajaran/active");

        const [resSiswa, resGuru, resMapel, resYear, resAdmin] =
          await Promise.all([pSiswa, pGuru, pMapel, pYear, pAdmin]);

        if (!mounted) return;

        const totalSiswa =
          resSiswa?.data?.total ??
          (Array.isArray(resSiswa?.data) ? resSiswa.data.length : null);
        const totalGuru =
          resGuru?.data?.total ??
          (Array.isArray(resGuru?.data) ? resGuru.data.length : null);
        const totalMapel =
          resMapel?.data?.total ??
          (Array.isArray(resMapel?.data) ? resMapel.data.length : null);
        const totalAdmin =
          resAdmin?.data?.total ??
          (Array.isArray(resAdmin?.data) ? resAdmin.data.length : null);
        const year = resYear?.data?.data ?? resYear?.data ?? null;

        setStats({ totalSiswa, totalGuru, totalMapel, totalAdmin });
        setYearInfo(year);
      } catch (err) {
        console.error("Error fetching admin dashboard data", err);
        setError(
          err?.response?.data?.message || err.message || "Gagal memuat data"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  const goto = (path) => (window.location.href = path);

  return (
    <AdminLayout>
      {loading ? (
        <div className="p-6 bg-white rounded shadow text-center">
          Memuat data...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded shadow">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              label="Total Siswa"
              value={fmt(stats.totalSiswa)}
              icon={Users}
              color="indigo"
            />
            <StatCard
              label="Total Guru"
              value={fmt(stats.totalGuru)}
              icon={GraduationCap}
              color="purple"
            />
            <StatCard
              label="Total Admin"
              value={fmt(stats.totalAdmin)}
              icon={User}
              color="green"
            />
            <StatCard
              label="Mata Pelajaran"
              value={fmt(stats.totalMapel)}
              icon={BookOpen}
              color="blue"
            />
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                Tahun Ajaran Aktif
              </h3>
              <p className="text-2xl font-bold text-amber-600">
                {yearInfo?.nama ?? "-"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {yearInfo?.semester_aktif
                  ? `Semester: ${yearInfo.semester_aktif.nama}`
                  : "Semester: -"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => goto("/admin/tahun-ajaran")}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Ganti Tahun Ajaran
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Menu Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ActionCard
                title="Kelola Siswa"
                description="Import, tambah, edit, dan hapus data siswa"
                buttonText="Buka Kelola Siswa"
                onClick={() => goto("/admin/siswa")}
                icon={Users}
                color="indigo"
              />
              <ActionCard
                title="Kelola Guru"
                description="Tambah guru baru dan atur wali kelas"
                buttonText="Buka Kelola Guru"
                onClick={() => goto("/admin/guru")}
                icon={GraduationCap}
                color="purple"
              />
              <ActionCard
                title="Kelola Admin"
                description="Tambah dan atur user admin sistem"
                buttonText="Buka Kelola Admin"
                onClick={() => goto("/admin/admins")}
                icon={BookOpen}
                color="blue"
              />
              <ActionCard
                title="Kelola Mapel"
                description="Tambah mata pelajaran dan assign ke kelas"
                buttonText="Buka Kelola Mapel"
                onClick={() => goto("/admin/mapel")}
                icon={BookOpen}
                color="blue"
              />
              <ActionCard
                title="Input Berita"
                description="Mengolah berita sekolah"
                buttonText="Kelola Berita"
                onClick={() => goto("/admin/berita")}
                icon={Newspaper}
                color="blue"
              />
              <ActionCard
                title="Input Gallery"
                description="Mengolah gallery foto sekolah"
                buttonText="Kelola Gallery"
                onClick={() => goto("/admin/gallery")}
                icon={BookImage}
                color="blue"
              />
              <ActionCard
                title="Log Aktivitas"
                description="Lihat riwayat aktivitas pengguna di sistem"
                buttonText="Buka Log Aktivitas"
                onClick={() => goto("/admin/logs")}
                icon={BookOpen}
                color="blue"
              />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

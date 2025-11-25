// src/pages/guru/GuruDashboard.jsx
import React, { useEffect, useState } from "react";
import { 
  Users, 
  BookOpen, 
  Calculator, 
  TrendingUp, 
  FileText,
  Calendar,
  ChevronRight,
  Award
} from "lucide-react";
import GuruLayout from "../../components/layout/GuruLayout";
import api from "../../_api";
import { showByGuru, getSemesterByTahunAjaran } from "../../_services/waliKelas";

// StatCard Component
function StatCard({ label, value, icon: Icon, color = "indigo", subtitle }) {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
            )}
          </div>
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${colorClasses[color]}`}></div>
    </div>
  );
}

// QuickActionCard Component
function QuickActionCard({ title, description, buttonText, onClick, icon: Icon, color = "indigo" }) {
  const colorClasses = {
    indigo: "from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-300",
    purple: "from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300",
    blue: "from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300",
    green: "from-green-50 to-green-100 border-green-200 hover:border-green-300",
    amber: "from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300",
  };

  const buttonColors = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    amber: "bg-amber-600 hover:bg-amber-700",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 transition-all hover:shadow-md`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick} 
        className={`w-full ${buttonColors[color]} text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2`}
      >
        {buttonText}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Helper function
function fmt(n) {
  if (n === null || n === undefined) return "-";
  return new Intl.NumberFormat().format(n);
}

export default function GuruDashboard() {
  const [user, setUser] = useState(null);
  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [stats, setStats] = useState({
    totalKelas: 0,
    totalSiswa: 0,
    totalMapel: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user info
    const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active tahun ajaran
      const resYear = await api.get("/tahun-ajaran/active");
      const yearData = resYear.data?.data || resYear.data;
      setTahunAjaran(yearData);

      // Fetch assignments by guru
      const resWali = await showByGuru(yearData?.id);
      const assignmentsData = resWali.data || [];
      setAssignments(assignmentsData);

      // Calculate stats
      const uniqueKelas = new Set();
      let totalSiswa = 0;
      const uniqueMapel = new Set();

      assignmentsData.forEach(assignment => {
        if (assignment.kelas_id) {
          uniqueKelas.add(assignment.kelas_id);
        }
        if (assignment.kelas?.siswa?.length) {
          totalSiswa += assignment.kelas.siswa.length;
        }
        // Assuming mapel info might be in assignment
        if (assignment.mapel_id) {
          uniqueMapel.add(assignment.mapel_id);
        }
      });

      setStats({
        totalKelas: uniqueKelas.size,
        totalSiswa: totalSiswa,
        totalMapel: uniqueMapel.size || assignmentsData.length,
      });

      // Fetch active semester
      if (yearData?.id) {
        const resSem = await getSemesterByTahunAjaran(yearData.id);
        const semList = resSem.data?.data ?? resSem.data ?? [];
        const activeSem = semList.find(s => s.is_active);
        setActiveSemester(activeSem);
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err?.response?.data?.message || "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const goto = (path) => (window.location.href = path);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <GuruLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl shadow-sm border border-red-200">
          <p className="font-medium">Terjadi Kesalahan</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {getGreeting()}, {user?.nama || user?.name || "Guru"}! 👋
                </h1>
                <p className="text-indigo-100 text-lg">
                  Selamat datang kembali di Dashboard Guru
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Kelas yang Diampu" 
              value={fmt(stats.totalKelas)} 
              icon={Users} 
              color="indigo"
              subtitle="Total kelas aktif"
            />
            <StatCard 
              label="Total Siswa" 
              value={fmt(stats.totalSiswa)} 
              icon={Award} 
              color="purple"
              subtitle="Dari semua kelas"
            />
            <StatCard 
              label="Mata Pelajaran" 
              value={fmt(stats.totalMapel)} 
              icon={BookOpen} 
              color="blue"
              subtitle="Yang diajarkan"
            />
            <StatCard 
              label="Tugas Aktif" 
              value={fmt(assignments.length)} 
              icon={FileText} 
              color="green"
              subtitle="Assignment total"
            />
          </div>

          {/* Tahun Ajaran & Semester Info */}
          {tahunAjaran && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Tahun Ajaran Aktif</h3>
                <p className="text-2xl font-bold text-amber-600">{tahunAjaran.nama}</p>
                {activeSemester && (
                  <p className="text-sm text-gray-600 mt-1">
                    Semester: {activeSemester.nama}
                  </p>
                )}
              </div>
              <div className="hidden md:block">
                <div className="bg-amber-100 p-4 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Input Nilai Detail"
                description="Kelola nilai formatif, ASLIM (UTS), dan ASAS (UAS) siswa"
                buttonText="Buka Input Nilai"
                onClick={() => goto("/guru/nilai-detail")}
                icon={Calculator}
                color="indigo"
              />
              <QuickActionCard
                title="Struktur Nilai"
                description="Buat dan kelola struktur nilai per mapel dan semester"
                buttonText="Kelola Struktur"
                onClick={() => goto("/guru/struktur-nilai")}
                icon={FileText}
                color="purple"
              />
              <QuickActionCard
                title="Nilai Akhir"
                description="Download template dan import nilai akhir dari Excel"
                buttonText="Kelola Nilai Akhir"
                onClick={() => goto("/guru/nilai-akhir")}
                icon={Award}
                color="blue"
              />
            </div>
          </div>

          {/* Kelas List */}
          {assignments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Kelas yang Anda Ampu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((assignment, idx) => (
                  <div 
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => goto("/guru/nilai-detail")}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {assignment.kelas?.nama || `Kelas ${assignment.kelas_id}`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {assignment.kelas?.tingkat || "-"} • {assignment.kelas?.jurusan || "-"}
                        </p>
                      </div>
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {assignment.kelas?.siswa?.length || 0} Siswa
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GuruLayout>
  );
}
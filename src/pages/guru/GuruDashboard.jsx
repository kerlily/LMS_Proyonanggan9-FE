
// src/pages/guru/GuruDashboard.jsx
import React, { useEffect, useState } from "react";
import { 
  Users, 
  Calculator, 
  ChevronRight,
  Award,
  UserStar,
  Newspaper,
  BookImage
} from "lucide-react";
import GuruLayout from "../../components/layout/GuruLayout";
import { showByGuru } from "../../_services/waliKelas";


function QuickActionCard({ title, description, buttonText, onClick, icon: Icon, color = "indigo" }) {
  const colorClasses = {
    indigo: "from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-300",
    purple: "from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300",
    blue: "from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300",
    green: "from-green-50 to-green-100 border-green-200 hover-border-green-300",
    amber: "from-amber-50 to-amber-100 border-amber-200 hover-border-amber-300",
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

export default function GuruDashboard() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

      const resWali = await showByGuru();
      const assignmentsData = resWali.data || [];
      setAssignments(assignmentsData);

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

          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.nama || user?.name || "Guru"}! 👋
            </h1>
            <p className="text-indigo-100 text-lg">Selamat datang kembali di Dashboard Guru</p>
          </div>

           {/* LIST KELAS */}
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
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {assignment.kelas?.nama}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {assignment.kelas?.tingkat} • SD Proyonanggan 9
                        </p>
                      </div>

                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>

                    {/* ARROW */}
                    <div className="flex items-center justify-end text-sm">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENU UTAMA */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Pencatatan Nilai Akademik"
                description="Kelola nilai formatif, ASLIM (UTS), dan ASAS (UAS) siswa"
                buttonText="Buka Input Nilai"
                onClick={() => goto("/guru/nilai-detail")}
                icon={Calculator}
                color="indigo"
              />
              <QuickActionCard
                title="Input Nilai Akhir (Excel)"
                description="Download template dan import nilai akhir"
                buttonText="Kelola Nilai Akhir"
                onClick={() => goto("/guru/nilai-akhir")}
                icon={Award}
                color="blue"
              />
              <QuickActionCard
                title="Nilai Sikap"
                description="Download template dan import nilai akhir"
                buttonText="Kelola Nilai "
                onClick={() => goto("/guru/nilai-sikap")}
                icon={UserStar}
                color="purple"
              />
              <QuickActionCard
                title="Input Berita"
                description="Mengolah berita sekolah"
                buttonText="Kelola Berita"
                onClick={() => goto("/guru/berita")}
                icon={Newspaper}
                color="green"
              />
              <QuickActionCard
                title="Input Gallery"
                description="Mengolah gallery foto sekolah"
                buttonText="Kelola Gallery"
                onClick={() => goto("/guru/gallery")}
                icon={BookImage}
                color="amber"
              />
            </div>
          </div>

         
        </div>
      )}
    </GuruLayout>
  );
}
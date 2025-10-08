// src/pages/admin/Mapel/MapelDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Layers, CheckCircle, Clock } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import kelasMapelService from "../../../_services/kelasMapel"; // pastikan path ini sesuai

function Badge({ status, count }) {
  if (status === "assigned") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
        <CheckCircle className="w-4 h-4" /> {count}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
      <Clock className="w-4 h-4" /> {count}
    </span>
  );
}

export default function MapelDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsResp, setStatsResp] = useState(null);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await kelasMapelService.getStatistics();
      // safeGet returns null for 401/403/404. Handle that.
      if (!res) {
        setError("Tidak dapat mengambil statistik (permission atau data tidak ditemukan).");
        setStatsResp(null);
      } else {
        // res.data is the backend payload (message, statistics, summary, kelas_need_attention)
        setStatsResp(res.data ?? res);
      }
    } catch (err) {
      console.error("Error get statistics:", err);
      setError(err?.response?.data?.message || err.message || "Gagal memuat statistik");
      setStatsResp(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // summary helpers
  const summary = statsResp?.summary ?? null;
  const statistics = statsResp?.statistics ?? [];
  const needAttention = statsResp?.kelas_need_attention ?? [];

  const percentAssigned = summary?.percentage_assigned ?? null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top: two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white">
              <PlusCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Tambah Mata Pelajaran</h3>
              <p className="text-sm text-gray-600 mb-4">Buat mapel baru yang nantinya bisa diassign ke kelas.</p>
              <div className="flex gap-3">
                <Link to="/admin/create-mapel" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Tambah Mapel</Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
              <Layers className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Assign Mapel ke Kelas</h3>
              <p className="text-sm text-gray-600 mb-4">Tambahkan atau sesuaikan mapel yang tersedia pada masing-masing kelas.</p>
              <div className="flex gap-3">
                <Link to="/admin/kelas-mapel" className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700">Assign Mapel</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Statistik summary */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Statistik Mapel per Kelas</h3>
              <p className="text-sm text-gray-600">Ringkasan pemetaan mapel di setiap kelas.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchStatistics} className="px-3 py-2 bg-gray-50 border rounded text-sm hover:bg-gray-100">Refresh</button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Memuat statistik...</div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
          ) : (
            <>
              {/* summary top: total/assigned/percentage */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Total Kelas</div>
                  <div className="text-2xl font-bold">{summary?.total_kelas ?? "-"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Kelas punya mapel</div>
                  <div className="text-2xl font-bold">{summary?.kelas_with_mapel ?? "-"}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Persentase assigned</div>
                  <div className="text-2xl font-bold">{percentAssigned !== null ? `${percentAssigned}%` : "-"}</div>
                </div>
              </div>

              {/* progress bar */}
              <div className="mb-6">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-green-500`}
                    style={{ width: `${Math.min(Math.max(percentAssigned ?? 0, 0), 100)}%` }}
                  />
                </div>
              </div>

              {/* Grid kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {statistics.map((k) => (
                  <div key={k.id} className="bg-white border rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-500">{`Kelas ${k.tingkat} • ${k.section ?? ""}`}</div>
                        <Badge status={k.status} count={k.mapel_count} />
                      </div>
                      <div className="text-lg font-semibold">{k.nama}</div>
                    </div>

                  </div>
                ))}
              </div>

              {/* kelas need attention */}
              <div>
                <h4 className="font-semibold mb-2">Kelas perlu perhatian</h4>
                {needAttention.length === 0 ? (
                  <div className="text-sm text-gray-600">Semua kelas sudah memiliki mapel.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {needAttention.map((k) => (
                      <div key={k.id} className="px-3 py-1 rounded bg-red-50 text-red-700 text-sm">{k.nama} (Kelas {k.tingkat})</div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

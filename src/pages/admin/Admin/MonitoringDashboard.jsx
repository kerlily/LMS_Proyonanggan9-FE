// src/pages/admin/Monitoring/MonitoringDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  RefreshCw,
  Filter,
  Download,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import MonitoringCard from "../../../components/MonitoringCard";
import MonitoringTable from "../../../components/MonitoringTable";
import { getMonitoring } from "../../../_services/monitoring";
import AdminLayout from "../../../components/layout/AdminLayout";
import api from "../../../_api";

export default function MonitoringDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    completion_below: "",
    guru_id: "",
  });
  const [guruList, setGuruList] = useState([]);

  // Load data monitoring
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.completion_below) {
        params.completion_below = filters.completion_below;
      }
      if (filters.guru_id) {
        params.guru_id = filters.guru_id;
      }

      const response = await getMonitoring(params);
      setData(response.data);
    } catch (error) {
      console.error("Error loading monitoring:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load list guru untuk filter
  const loadGuruList = async () => {
    try {
      const response = await api.get("/admin/guru");
      const gurus = response.data?.data || response.data || [];
      setGuruList(gurus);
    } catch (error) {
      console.error("Error loading guru list:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadGuruList();
  }, []);

  const handleFilter = () => {
    loadData();
  };

  const handleReset = () => {
    setFilters({
      completion_below: "",
      guru_id: "",
    });
    setTimeout(() => loadData(), 100);
  };

  const handleViewDetail = (item) => {
    navigate(`/admin/monitoring/detail/${item.kelas.id}`, {
      state: { kelas: item },
    });
  };

  const handleExport = () => {
    if (!data?.kelas_list || data.kelas_list.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Data",
        text: "Tidak ada data untuk diexport",
      });
      return;
    }

    // Simple CSV export
    const headers = [
      "Kelas",
      "Wali Kelas",
      "Total Siswa",
      "Total Mapel",
      "Nilai Terisi",
      "Nilai Expected",
      "Completion Rate",
      "Status",
    ];

    const rows = data.kelas_list.map((item) => [
      item.kelas?.nama || "-",
      item.wali_kelas?.guru_nama || "-",
      item.total_siswa || 0,
      item.total_mapel || 0,
      item.nilai_terisi || 0,
      item.nilai_expected || 0,
      `${item.completion_rate}%`,
      item.status || "-",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `monitoring_nilai_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Export Berhasil",
      text: "Data monitoring berhasil diexport",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <AdminLayout>
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Pelaporan Nilai Akhir
            </h1>
            <p className="text-sm text-gray-600">
              Pantau kelengkapan nilai akhir per kelas
            </p>
          </div>
        </div>

        {/* Info Alert */}
        {data && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">
                  Data Semester & Tahun Ajaran
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Semester:</strong> {data.semester?.nama || "-"} |{" "}
                  <strong>Tahun Ajaran:</strong>{" "}
                  {data.tahun_ajaran?.nama || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Rate Kurang Dari
              </label>
              <select
                value={filters.completion_below}
                onChange={(e) =>
                  setFilters({ ...filters, completion_below: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua</option>
                <option value="25">{"< 25%"}</option>
                <option value="50">{"< 50%"}</option>
                <option value="75">{"< 75%"}</option>
                <option value="100">{"< 100%"}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wali Kelas
              </label>
              <select
                value={filters.guru_id}
                onChange={(e) =>
                  setFilters({ ...filters, guru_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Guru</option>
                {guruList.map((guru) => (
                  <option key={guru.id} value={guru.id}>
                    {guru.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Terapkan
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={loading || !data?.kelas_list?.length}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        {data?.overall_stats && (
          <MonitoringCard stats={data.overall_stats} />
        )}

        {/* Overall Progress */}
        {data?.overall_stats && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Progress Keseluruhan
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Nilai</span>
                  <span className="font-semibold">
                    {data.overall_stats.total_nilai_terisi} /{" "}
                    {data.overall_stats.total_nilai_expected}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${data.overall_stats.overall_completion_rate}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {data.overall_stats.overall_completion_rate}%
                </div>
                <div className="text-xs text-gray-500">Completion</div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <MonitoringTable
            data={data?.kelas_list || []}
            onViewDetail={handleViewDetail}
          />
  )}
      </div>
    </div>
      </AdminLayout>
  );
}
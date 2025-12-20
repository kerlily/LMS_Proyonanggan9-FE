// src/pages/admin/Monitoring/MonitoringDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ChevronLeft,
  AlertCircle,
  Users,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { getMissingDetail } from "../../../_services/monitoring";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function MonitoringDetail() {
  const { kelasId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedMapel, setSelectedMapel] = useState("");

  const kelasInfo = location.state?.kelas;

  const loadDetail = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMapel) {
        params.mapel_id = selectedMapel;
      }

      const response = await getMissingDetail(kelasId, params);
      setData(response.data);
    } catch (error) {
      console.error("Error loading detail:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Detail",
        text: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [kelasId, selectedMapel]);

  if (loading && !data) {
    return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-gray-600">Memuat detail...</p>
        </div>
      </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/admin/monitoring")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Detail Monitoring - {data?.kelas?.nama || kelasInfo?.kelas?.nama}
            </h1>
            <p className="text-sm text-gray-600">
              Daftar siswa yang belum lengkap nilainya
            </p>
          </div>
          <button
            onClick={loadDetail}
            disabled={loading}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.total_siswa || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Mapel</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.total_mapel || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Siswa Belum Lengkap</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.siswa_with_missing_nilai?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Mapel */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Berdasarkan Mapel
          </label>
          <select
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Mapel</option>
            {kelasInfo?.mapel_incomplete?.map((mapel) => (
              <option key={mapel.mapel_id} value={mapel.mapel_id}>
                {mapel.mapel_nama} ({mapel.completion_rate}%)
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama Siswa
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Nilai Terisi
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Completion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mapel Yang Belum Ada Nilai
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.siswa_with_missing_nilai?.length > 0 ? (
                  data.siswa_with_missing_nilai.map((siswa, idx) => (
                    <tr key={siswa.siswa_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {siswa.siswa_nama}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {siswa.nilai_terisi}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {" "}/ {siswa.nilai_expected}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className={`h-2 rounded-full ${
                                siswa.completion_rate >= 75
                                  ? "bg-green-500"
                                  : siswa.completion_rate >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${siswa.completion_rate}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">
                            {siswa.completion_rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {siswa.mapel_missing?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {siswa.mapel_missing.map((mapel) => (
                              <span
                                key={mapel.mapel_id}
                                className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded border border-red-300"
                              >
                                {mapel.mapel_nama}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Lengkap
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>
                        {selectedMapel
                          ? "Semua siswa sudah memiliki nilai untuk mapel ini"
                          : "Semua siswa sudah memiliki nilai lengkap"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}
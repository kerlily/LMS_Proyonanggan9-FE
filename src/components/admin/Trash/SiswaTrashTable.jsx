// src/components/admin/Trash/SiswaTrashTable.jsx
import React, { useState } from "react";
import {
  RotateCcw,
  Trash2,
  Search,
  GraduationCap,
  Calendar,
  School,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";
import { restoreSiswa, forceDeleteSiswa } from "../../../_services/trash";

// ✅ Helper function untuk format days
const formatDaysAgo = (days) => {
  if (!days && days !== 0) return null;
  const roundedDays = Math.floor(days);
  if (roundedDays === 0) return 'Hari ini';
  if (roundedDays === 1) return '1 hari yang lalu';
  return `${roundedDays} hari yang lalu`;
};

const SiswaTrashTable = ({ siswaList, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSiswa = siswaList.filter((s) =>
    s.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = async (siswa) => {
    const result = await Swal.fire({
      title: "Restore Siswa?",
      html: `
        <div class="text-left">
          <p class="mb-2">Anda akan memulihkan siswa:</p>
          <div class="bg-gray-50 p-3 rounded">
            <p class="font-semibold">${siswa.nama}</p>
            <p class="text-sm text-gray-600">Tahun Lahir: ${siswa.tahun_lahir}</p>
            ${
              siswa.kelas
                ? `<p class="text-xs text-gray-500">Kelas: ${siswa.kelas.nama}</p>`
                : ""
            }
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Pulihkan",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Memulihkan...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await restoreSiswa(siswa.id);

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Siswa ${siswa.nama} berhasil dipulihkan`,
          timer: 2000,
        });

        onRefresh();
      } catch (error) {
        console.error("Error restoring siswa:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal memulihkan siswa",
        });
      }
    }
  };

  const handleForceDelete = async (siswa) => {
    const result = await Swal.fire({
      title: "Hapus Permanen?",
      html: `
        <div class="text-left">
          <div class="bg-red-50 border border-red-200 rounded p-3 mb-3">
            <p class="text-red-800 font-semibold flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              PERHATIAN!
            </p>
            <p class="text-sm text-red-700 mt-2">
              ⚠️ Menghapus siswa akan menghapus SEMUA DATA:
            </p>
            <ul class="text-sm text-red-700 mt-2 ml-4 list-disc">
              <li>Data nilai semua semester</li>
              <li>Riwayat kelas</li>
              <li>Data ketidakhadiran</li>
              <li>Data nilai sikap</li>
            </ul>
            <p class="text-sm text-red-800 font-semibold mt-2">
              Data TIDAK BISA dikembalikan!
            </p>
          </div>
          <div class="bg-gray-50 p-3 rounded">
            <p class="font-semibold">${siswa.nama}</p>
            <p class="text-sm text-gray-600">Tahun Lahir: ${siswa.tahun_lahir}</p>
            ${
              siswa.kelas
                ? `<p class="text-xs text-gray-500">Kelas: ${siswa.kelas.nama}</p>`
                : ""
            }
          </div>
          <p class="text-xs text-gray-500 mt-3">
            Ketik "<span class="font-mono font-bold">DELETE</span>" untuk konfirmasi
          </p>
        </div>
      `,
      icon: "warning",
      input: "text",
      inputPlaceholder: "Ketik DELETE",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus Permanen",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (value !== "DELETE") {
          return "Ketik DELETE untuk konfirmasi!";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Menghapus...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await forceDeleteSiswa(siswa.id);

        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          html: `
            <p>Siswa <strong>${siswa.nama}</strong> berhasil dihapus permanen</p>
            ${
              response.data?.deleted?.nilai
                ? `<p class="text-sm text-gray-600 mt-2">
                    ${response.data.deleted.nilai} data nilai terhapus
                   </p>`
                : ""
            }
          `,
          timer: 3000,
        });

        onRefresh();
      } catch (error) {
        console.error("Error force deleting siswa:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal menghapus siswa",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-3 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Siswa Trash
          </h2>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            {siswaList.length} deleted
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Siswa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deleted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSiswa.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                    <p className="font-medium">Trash Kosong</p>
                    <p className="text-sm">Tidak ada siswa yang dihapus</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSiswa.map((siswa) => (
                <tr key={siswa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{siswa.nama}</p>
                        <p className="text-sm text-gray-500">
                          Tahun Lahir: {siswa.tahun_lahir}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {siswa.kelas ? (
                      <div className="flex items-center gap-2 text-sm">
                        <School className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{siswa.kelas.nama}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {/* ✅ FIXED: Gunakan helper function */}
                        {formatDaysAgo(siswa.deleted_days_ago)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(siswa.deleted_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestore(siswa)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleForceDelete(siswa)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Permanent"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SiswaTrashTable;
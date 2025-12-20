// src/components/MonitoringTable.jsx
import React from "react";
import { Eye, AlertTriangle } from "lucide-react";

export default function MonitoringTable({ data, onViewDetail }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      complete: {
        label: "Selesai",
        classes: "bg-green-100 text-green-800 border-green-300",
      },
      partial: {
        label: "Belum Selesai",
        classes: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      empty: {
        label: "Kosong",
        classes: "bg-red-100 text-red-800 border-red-300",
      },
    };

    const config = statusConfig[status] || statusConfig.empty;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.classes}`}
      >
        {config.label}
      </span>
    );
  };

  const getProgressColor = (rate) => {
    if (rate >= 100) return "bg-green-500";
    if (rate >= 75) return "bg-blue-500";
    if (rate >= 50) return "bg-yellow-500";
    if (rate >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Kelas
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Wali Kelas
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Siswa
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Mapel
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Nilai Terisi
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Progress
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {item.kelas?.nama || "-"}
                </div>
                <div className="text-xs text-gray-500">
                  Tingkat {item.kelas?.tingkat || "-"}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {item.wali_kelas?.guru_nama || (
                    <span className="text-gray-400 italic">Belum ada wali</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                <span className="text-sm font-semibold text-gray-900">
                  {item.total_siswa || 0}
                </span>
              </td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                <span className="text-sm font-semibold text-gray-900">
                  {item.total_mapel || 0}
                </span>
              </td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">
                    {item.nilai_terisi}
                  </span>
                  <span className="text-gray-500">
                    {" "}/ {item.nilai_expected}
                  </span>
                </div>
                {item.nilai_missing > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Kurang {item.nilai_missing}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                <div className="flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(
                        item.completion_rate
                      )}`}
                      style={{ width: `${item.completion_rate}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {item.completion_rate}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                {getStatusBadge(item.status)}
              </td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                <button
                  onClick={() => onViewDetail(item)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
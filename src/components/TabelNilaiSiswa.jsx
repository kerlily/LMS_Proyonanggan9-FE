// src/components/guru/TabelNilaiSiswa.jsx
import React, { useState } from "react";

function valueBadge(val) {
  if (val === null || val === undefined || val === "" || val === "-") {
    return { cls: "text-gray-400 bg-gray-100", text: "-" };
  }
  const n = Number(val);
  if (Number.isNaN(n)) return { cls: "text-gray-400 bg-gray-100", text: "-" };

  if (n < 40) return { cls: "text-red-700 bg-red-100", text: String(n) };
  if (n < 60) return { cls: "text-yellow-800 bg-yellow-100", text: String(n) };
  return { cls: "text-green-800 bg-green-100", text: String(n) };
}

export default function TabelNilaiSiswa({ data, onUpdateNilai, loading, semesterId }) {
  const [editingCell, setEditingCell] = useState(null); // { siswaId, mapelId }
  const [editValue, setEditValue] = useState("");

  // Extract unique mapels
  const mapelSet = new Map();
  data.forEach((siswa) => {
    siswa.nilai.forEach((n) => {
      if (!mapelSet.has(n.mapel_id)) {
        mapelSet.set(n.mapel_id, {
          id: n.mapel_id,
          nama: n.mapel_nama,
          kode: n.mapel_kode,
        });
      }
    });
  });
  const mapelList = Array.from(mapelSet.values()).sort((a, b) =>
    a.nama.localeCompare(b.nama)
  );

  const handleStartEdit = (siswaId, mapelId, currentValue) => {
    setEditingCell({ siswaId, mapelId });
    setEditValue(currentValue ?? "");
  };

  const handleSaveEdit = async (siswa, mapel) => {
    const nilaiObj = siswa.nilai.find(
      (n) => n.mapel_id === mapel.id
    );

    // Validate nilai (0-100)
    const numValue = Number(editValue);
    if (editValue !== "" && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
      alert("Nilai harus antara 0-100");
      return;
    }

    if (!nilaiObj) {
      // Create new nilai
      await onUpdateNilai({
        id: null,
        siswa_id: siswa.siswa_id,
        mapel_id: mapel.id,
        semester_id: semesterId,
        nilai: editValue === "" ? null : numValue,
        siswa_nama: siswa.siswa_nama,
        mapel_nama: mapel.nama,
      });
    } else {
      // Update existing nilai
      await onUpdateNilai({
        id: nilaiObj.id,
        siswa_id: siswa.siswa_id,
        mapel_id: mapel.id,
        semester_id: semesterId,
        nilai: editValue === "" ? null : numValue,
        siswa_nama: siswa.siswa_nama,
        mapel_nama: mapel.nama,
      });
    }

    setEditingCell(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const getNilaiForMapel = (siswa, mapelId) => {
    const nilaiObj = siswa.nilai.find((n) => n.mapel_id === mapelId);
    return nilaiObj?.nilai ?? null;
  };

  const isEditing = (siswaId, mapelId) => {
    return (
      editingCell?.siswaId === siswaId && editingCell?.mapelId === mapelId
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 w-16">
                No
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 sticky left-16 bg-gray-50 z-10 min-w-[200px]">
                Nama Siswa
              </th>
              {mapelList.map((mapel) => (
                <th
                  key={mapel.id}
                  className="py-3 px-4 text-center font-semibold text-gray-700 min-w-[120px]"
                >
                  <div className="font-semibold">{mapel.nama}</div>
                  <div className="text-xs text-gray-500 font-normal mt-1">
                    ({mapel.kode})
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-center font-semibold text-gray-700 min-w-[100px]">
                Rata-rata
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={mapelList.length + 3}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={mapelList.length + 3}
                  className="py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-700">Tidak ada data siswa</div>
                      <div className="text-sm text-gray-500 mt-1">Pilih kelas dan semester untuk melihat data nilai</div>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((siswa, idx) => {
                // Calculate average
                const nilaiValues = siswa.nilai
                  .map((n) => Number(n.nilai))
                  .filter((v) => !isNaN(v) && v !== null);
                const avg =
                  nilaiValues.length > 0
                    ? (
                        nilaiValues.reduce((a, b) => a + b, 0) /
                        nilaiValues.length
                      ).toFixed(2)
                    : "-";

                return (
                  <tr key={siswa.siswa_id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-center sticky left-0 bg-white font-medium text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 sticky left-16 bg-white">
                      {siswa.siswa_nama}
                    </td>
                    {mapelList.map((mapel) => {
                      const nilaiValue = getNilaiForMapel(siswa, mapel.id);
                      const isCurrentlyEditing = isEditing(
                        siswa.siswa_id,
                        mapel.id
                      );

                      if (isCurrentlyEditing) {
                        return (
                          <td key={mapel.id} className="py-2 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-20 px-2 py-1.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveEdit(siswa, mapel);
                                  } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleSaveEdit(siswa, mapel)}
                                className="p-1.5 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                title="Simpan (Enter)"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                title="Batal (Esc)"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        );
                      }

                      const badge = valueBadge(nilaiValue);
                      return (
                        <td
                          key={mapel.id}
                          className="py-3 px-4 text-center cursor-pointer hover:bg-blue-50 transition-colors group"
                          onClick={() =>
                            handleStartEdit(siswa.siswa_id, mapel.id, nilaiValue)
                          }
                          title="Klik untuk edit nilai"
                        >
                          <span
                            className={`inline-block px-3 py-1.5 rounded-lg font-semibold transition-all group-hover:ring-2 group-hover:ring-blue-300 ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-lg text-gray-900">
                        {avg}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Info Footer */}
      {data.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium text-gray-900">{data.length}</span> siswa • 
              <span className="font-medium text-gray-900 ml-2">{mapelList.length}</span> mata pelajaran
            </div>
            <div className="text-gray-500">
              💡 Klik nilai untuk edit, tekan <kbd className="px-2 py-0.5 bg-white border rounded text-xs">Enter</kbd> untuk simpan
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
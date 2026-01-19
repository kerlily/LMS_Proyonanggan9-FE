// src/components/NilaiTable.jsx
import React from "react";
import { Download, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

export default function NilaiTable({ data, struktur, kelas, mapel, semester }) {
  // Null safety checks
  if (!struktur) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Pilih kelas, semester, dan mapel terlebih dahulu</p>
      </div>
    );
  }

  const strukturData = struktur?.struktur || {};
  const lingkupMateri = strukturData?.lingkup_materi || [];
  const aslimKey = strukturData?.aslim?.kolom_key;
  const asasKey = strukturData?.asas?.kolom_key;

  // Check if struktur data is valid
  if (!lingkupMateri || lingkupMateri.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
        <p className="text-gray-700 font-medium mb-2">Struktur Nilai Belum Valid</p>
        <p className="text-gray-500 text-sm">
          Struktur nilai untuk mapel ini belum dikonfigurasi dengan benar.
          <br />
          Silakan hubungi admin atau buat ulang struktur nilai.
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Belum ada data siswa untuk ditampilkan</p>
      </div>
    );
  }

  // Hitung total kolom untuk colspan
  const totalFormatifCols = lingkupMateri.reduce(
    (sum, lm) => sum + (lm.formatif?.length || 0),
    0
  );

  // Function untuk get nilai dengan safe access
  const getNilai = (nilaiData, lmKey, kolomKey) => {
    if (!nilaiData) return null;
    
    if (lmKey) {
      // Nested (Formatif dalam LM)
      return nilaiData[lmKey]?.[kolomKey] ?? null;
    } else {
      // Flat (ASLIM/ASAS)
      return nilaiData[kolomKey] ?? null;
    }
  };

  // Function untuk hitung nilai akhir manual
  const calculateNilaiAkhir = (nilaiData) => {
    if (!nilaiData || !lingkupMateri || lingkupMateri.length === 0) return null;

    let allFormatif = [];
    
    // Kumpulkan semua nilai formatif
    lingkupMateri.forEach((lm) => {
      if (!lm?.formatif) return;
      
      lm.formatif.forEach((f) => {
        const nilai = getNilai(nilaiData, lm.lm_key, f.kolom_key);
        if (nilai !== null && nilai !== undefined && nilai !== "") {
          const numNilai = Number(nilai);
          if (!isNaN(numNilai)) {
            allFormatif.push(numNilai);
          }
        }
      });
    });

    const aslim = getNilai(nilaiData, null, aslimKey);
    const asas = getNilai(nilaiData, null, asasKey);

    // Jika ada data yang kosong, return null
    if (allFormatif.length === 0 || aslim === null || asas === null) {
      return null;
    }

    const numAslim = Number(aslim);
    const numAsas = Number(asas);
    
    if (isNaN(numAslim) || isNaN(numAsas)) {
      return null;
    }

    const rataFormatif = allFormatif.reduce((a, b) => a + b, 0) / allFormatif.length;
    const nilaiAkhir = (rataFormatif + numAslim + numAsas) / 3;
    
    return Math.round(nilaiAkhir * 100) / 100;
  };

  // Function export to Excel
  const handleExportExcel = () => {
    try {
      const exportData = data.map((row, idx) => {
        const rowData = {
          No: idx + 1,
          "Nama Siswa": row.siswa_nama || "",
        };

        // Add formatif columns
        lingkupMateri.forEach((lm) => {
          if (lm?.formatif) {
            lm.formatif.forEach((f) => {
              const nilai = getNilai(row.nilai_data, lm.lm_key, f.kolom_key);
              rowData[f.kolom_label || "N/A"] = nilai ?? "";
            });
          }
        });

        // Add ASLIM & ASAS
        const aslim = getNilai(row.nilai_data, null, aslimKey);
        const asas = getNilai(row.nilai_data, null, asasKey);
        
        rowData["ASLIM"] = aslim ?? "";
        rowData["ASAS"] = asas ?? "";
        rowData["NILAI AKHIR"] = calculateNilaiAkhir(row.nilai_data) ?? "";

        return rowData;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Nilai");

      // Set column widths
      const colWidths = [
        { wch: 5 },  // No
        { wch: 30 }, // Nama
        ...Array(totalFormatifCols + 3).fill({ wch: 10 })
      ];
      ws["!cols"] = colWidths;

      const fileName = `Nilai_${kelas?.nama || "Kelas"}_${mapel?.nama || "Mapel"}_${semester?.nama || "Semester"}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      console.log("✅ Excel exported:", fileName);
    } catch (error) {
      console.error("❌ Export Excel error:", error);
      alert("Gagal export Excel: " + error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Data Nilai - {kelas?.nama}
            </h2>
            <p className="text-sm text-gray-600">
              {mapel?.nama} • {semester?.nama}
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            {/* Row 1: ASESMEN Header */}
            <tr className="bg-gray-100">
              <th
                rowSpan="3"
                className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border border-gray-300 sticky left-0 bg-gray-100 z-10"
                style={{ minWidth: "50px" }}
              >
                No.
              </th>
              <th
                rowSpan="3"
                className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border border-gray-300 sticky left-[50px] bg-gray-100 z-10"
                style={{ minWidth: "200px" }}
              >
                Nama Siswa
              </th>
              <th
                colSpan={totalFormatifCols}
                className="px-4 py-3 text-center text-sm font-bold text-gray-900 uppercase border border-gray-300 bg-blue-50"
              >
                ASESMEN
              </th>
              <th
                rowSpan="3"
                className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border border-gray-300 bg-yellow-50"
                style={{ minWidth: "80px" }}
              >
                ASLIM
              </th>
              <th
                rowSpan="3"
                className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border border-gray-300 bg-orange-50"
                style={{ minWidth: "80px" }}
              >
                ASAS
              </th>
              <th
                rowSpan="3"
                className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border border-gray-300 bg-green-50"
                style={{ minWidth: "80px" }}
              >
                NILAI
              </th>
            </tr>

            {/* Row 2: Lingkup Materi Headers */}
            <tr className="bg-gray-50">
              {lingkupMateri.map((lm, idx) => (
                <th
                  key={idx}
                  colSpan={lm.formatif?.length || 0}
                  className="px-4 py-2 text-center text-xs font-semibold text-gray-700 uppercase border border-gray-300 bg-blue-100"
                >
                  {lm.lm_label}
                </th>
              ))}
            </tr>

            {/* Row 3: Kolom Formatif */}
            <tr className="bg-gray-50">
              {lingkupMateri.map((lm) =>
                lm.formatif?.map((f, fIdx) => (
                  <th
                    key={`${lm.lm_key}-${fIdx}`}
                    className="px-3 py-2 text-center text-xs font-medium text-gray-600 border border-gray-300 bg-blue-50"
                    style={{ minWidth: "60px" }}
                  >
                    {f.kolom_label}
                  </th>
                ))
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIdx) => {
              const nilaiAkhir = calculateNilaiAkhir(row.nilai_data);
              
              return (
                <tr key={row.siswa_id} className="hover:bg-gray-50">
                  {/* No - Sticky */}
                  <td className="px-4 py-3 text-center text-sm text-gray-900 border border-gray-300 sticky left-0 bg-white z-10">
                    {rowIdx + 1}
                  </td>

                  {/* Nama Siswa - Sticky */}
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300 sticky left-[50px] bg-white z-10">
                    {row.siswa_nama}
                  </td>

                  {/* Nilai Formatif per LM */}
                  {lingkupMateri.map((lm) =>
                    lm.formatif?.map((f, fIdx) => {
                      const nilai = getNilai(row.nilai_data, lm.lm_key, f.kolom_key);
                      const isEmpty = nilai === null || nilai === undefined || nilai === "";
                      
                      return (
                        <td
                          key={`${lm.lm_key}-${fIdx}`}
                          className={`px-3 py-3 text-center text-sm border border-gray-300 ${
                            isEmpty ? "bg-yellow-50" : "bg-white"
                          }`}
                        >
                          {isEmpty ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span className="font-medium text-gray-900">{nilai}</span>
                          )}
                        </td>
                      );
                    })
                  )}

                  {/* ASLIM */}
                  <td
                    className={`px-3 py-3 text-center text-sm font-medium border border-gray-300 ${
                      getNilai(row.nilai_data, null, aslimKey) === null
                        ? "bg-yellow-50"
                        : "bg-white"
                    }`}
                  >
                    {getNilai(row.nilai_data, null, aslimKey) ?? (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* ASAS */}
                  <td
                    className={`px-3 py-3 text-center text-sm font-medium border border-gray-300 ${
                      getNilai(row.nilai_data, null, asasKey) === null
                        ? "bg-yellow-50"
                        : "bg-white"
                    }`}
                  >
                    {getNilai(row.nilai_data, null, asasKey) ?? (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* NILAI AKHIR */}
                  <td
                    className={`px-3 py-3 text-center text-sm font-bold border border-gray-300 ${
                      nilaiAkhir === null
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {nilaiAkhir ?? <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span>Nilai belum diisi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
            <span>Nilai akhir belum lengkap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span>Nilai akhir lengkap</span>
          </div>
        </div>
      </div>
    </div>
  );
}
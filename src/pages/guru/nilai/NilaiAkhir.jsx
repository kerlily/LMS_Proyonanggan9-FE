import React, { useState, useEffect } from "react";
import { Download, Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import GuruLayout from "../../../components/layout/GuruLayout";
import { downloadTemplate, importNilai } from "../../../_services/nilai";
import api from "../../../_api";
import { getSemesterByTahunAjaran, showByGuru } from "../../../_services/waliKelas";

// Helper: parse error response even when responseType='blob'
const parseErrorMessage = async (err) => {
  const respData = err?.response?.data;
  if (!respData) {
    return err?.response?.data?.message || err?.message || "Terjadi kesalahan";
  }

  if (typeof Blob !== "undefined" && respData instanceof Blob) {
    try {
      const text = await respData.text();
      try {
        const json = JSON.parse(text);
        return json?.message || text || err?.message || "Terjadi kesalahan";
      } catch (e) {
        console.log(e);
        return text || err?.message || "Terjadi kesalahan" ;
      }
    } catch (e) {
      console.log(e);
      return err?.message || "Terjadi kesalahan";
    }
  }

  return err?.response?.data?.message || err?.message || "Terjadi kesalahan";
};

export default function NilaiAkhir() {
  const [kelas, setKelas] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null); // Change to object
  const [tahunAjaran, setTahunAjaran] = useState(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (tahunAjaran?.id) {
      fetchSemesters(tahunAjaran.id);
      fetchKelasByGuru(tahunAjaran.id);
    }
  }, [tahunAjaran]);

  const fetchInitialData = async () => {
    try {
      const resYear = await api.get("/tahun-ajaran/active");
      const yearData = resYear.data?.data || resYear.data;
      setTahunAjaran(yearData);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Gagal memuat data awal";
      setError(msg);
    }
  };

  const fetchKelasByGuru = async (tahunId = null) => {
    try {
      const res = await showByGuru(tahunId);
      const raw = res.data?.data ?? res.data ?? [];
      const kelasList = Array.isArray(raw) ? raw.map((w) => w.kelas).filter(Boolean) : [];
      const seen = new Set();
      const unique = [];
      kelasList.forEach((k) => {
        if (!k || !k.id) return;
        if (!seen.has(k.id)) {
          seen.add(k.id);
          unique.push(k);
        }
      });
      setKelas(unique);
    } catch (err) {
      console.error("Gagal memuat kelas wali", err);
      setKelas([]);
    }
  };

  const fetchSemesters = async (tahunAjaranId) => {
    try {
      const res = await getSemesterByTahunAjaran(tahunAjaranId);
      const semList = res.data?.data ?? res.data ?? res.data?.semesters ?? [];
      setSemesters(Array.isArray(semList) ? semList : []);

      // Set active semester as default
      const activeSem = (Array.isArray(semList) ? semList : []).find((s) => s.is_active);
      if (activeSem) {
        setSelectedSemester(activeSem);
      } else if (semList.length > 0) {
        setSelectedSemester(semList[0]);
      }
    } catch (err) {
      console.error("Gagal memuat semester", err);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedKelas || !selectedSemester) {
      alert("Pilih kelas dan semester terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await downloadTemplate(Number(selectedKelas), Number(selectedSemester.id));

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const kelasObj = kelas.find((k) => k.id == selectedKelas);
      const kelasNama = kelasObj?.nama || selectedKelas;
      const semesterNama = selectedSemester?.nama || selectedSemester?.name || `Semester_${selectedSemester.id}`;
      
      // Clean filename: remove spaces and special chars
      const cleanKelasNama = kelasNama.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      const cleanSemesterNama = semesterNama.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      
      link.setAttribute("download", `Template_Nilai_${cleanKelasNama}_${cleanSemesterNama}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Show success message
      setError(null);
      alert("Template berhasil didownload!");
    } catch (err) {
      const msg = await parseErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split(".").pop().toLowerCase();
      if (!["xlsx", "xls", "csv"].includes(ext)) {
        alert("File harus berformat Excel (.xlsx, .xls) atau CSV");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
      setError(null);
    }
  };

  const handleImport = async (dryRun) => {
    if (!selectedKelas || !selectedSemester) {
      alert("Pilih kelas dan semester terlebih dahulu");
      return;
    }
    if (!file) {
      alert("Pilih file Excel terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await importNilai(Number(selectedKelas), Number(selectedSemester.id), formData, dryRun);
      setImportResult(res.data);

      if (!dryRun && res.data?.summary?.success_count > 0) {
        alert(`Berhasil import ${res.data.summary.success_count} nilai`);
        setFile(null);
        const input = document.getElementById("fileInput");
        if (input) input.value = "";
      }
    } catch (err) {
      const msg = await parseErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuruLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Input Nilai</h1>
              <p className="text-sm text-gray-600 mt-1">Download template, isi nilai di Excel, kemudian import</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>

                {typeof error === "string" && error.toLowerCase().includes("belum memiliki mapel") && (
                  <div className="mt-2 text-sm text-red-700">
                    <p>Silakan assign mapel terlebih dahulu melalui menu admin agar template bisa dibuat.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tahunAjaran && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Tahun Ajaran Aktif: <span className="font-bold">{tahunAjaran.nama}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => {
                  setSelectedKelas(e.target.value);
                  setImportResult(null);
                  setError(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Semester</label>
              <select
                value={selectedSemester?.id || ""}
                onChange={(e) => {
                  const sem = semesters.find(s => s.id === Number(e.target.value));
                  setSelectedSemester(sem || null);
                  setImportResult(null);
                  setError(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Pilih Semester --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama ?? s.name ?? `Semester ${s.semester ?? s.number ?? s.id}`} 
                    {s.is_active && " (Aktif)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Step 1: Download Template Excel</h3>
            <button
              onClick={handleDownloadTemplate}
              disabled={loading || !selectedKelas || !selectedSemester}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Download className="w-5 h-5" />
              {loading ? "Memproses..." : "Download Template Excel"}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              File akan didownload dengan nama: Template_Nilai_
              {selectedKelas && kelas.find(k => k.id == selectedKelas)?.nama}_
              {selectedSemester?.nama || selectedSemester?.name || ''}.xlsx
            </p>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Step 2: Upload File Excel yang Sudah Diisi</h3>
            <div className="space-y-4">
              <input
                id="fileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {file && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>
                    File dipilih: <span className="font-medium">{file.name}</span>
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleImport(true)}
                  disabled={loading || !file}
                  className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <AlertCircle className="w-5 h-5" />
                  {loading ? "Memproses..." : "Preview (Dry Run)"}
                </button>

                <button
                  onClick={() => handleImport(false)}
                  disabled={loading || !file}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Upload className="w-5 h-5" />
                  {loading ? "Memproses..." : "Import Nilai (Real)"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {importResult && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hasil Import</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-1">Berhasil</p>
                <p className="text-2xl font-bold text-green-900">{importResult.summary?.success_count || 0}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-1">Gagal</p>
                <p className="text-2xl font-bold text-red-900">{importResult.summary?.failed_count || 0}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-1">Tahun Ajaran</p>
                <p className="text-lg font-bold text-blue-900">{importResult.summary?.tahun_ajaran?.nama || "-"}</p>
              </div>
            </div>

            {importResult.summary?.unmatched_mapel_headers?.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-medium text-amber-900 mb-2">⚠️ Mapel tidak ditemukan di database:</p>
                <ul className="list-disc list-inside text-sm text-amber-800">
                  {importResult.summary.unmatched_mapel_headers.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
                <p className="text-xs text-amber-700 mt-2">
                  Pastikan nama mapel di Excel sesuai dengan yang ada di database
                </p>
              </div>
            )}

            {importResult.details?.failed?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">❌ Data Gagal ({importResult.details.failed.length})</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Baris</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Nama</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Mapel</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Alasan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {importResult.details.failed.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{item.row}</td>
                          <td className="px-4 py-2">{item.nama}</td>
                          <td className="px-4 py-2">{item.mapel || "-"}</td>
                          <td className="px-4 py-2 text-red-600">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importResult.details?.success?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">✅ Data Berhasil ({importResult.details.success.length})</h3>
                <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Baris</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Nama</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Mapel</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {importResult.details.success.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{item.row}</td>
                          <td className="px-4 py-2">{item.nama}</td>
                          <td className="px-4 py-2">{item.mapel}</td>
                          <td className="px-4 py-2 font-medium text-green-700">{item.nilai}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
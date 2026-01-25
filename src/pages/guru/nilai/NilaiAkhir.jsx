/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Download, Upload, CheckCircle, XCircle, Eye, Save } from "lucide-react";
import GuruLayout from "../../../components/layout/GuruLayout";
import { downloadTemplate, importNilai } from "../../../_services/nilai";
import api from "../../../_api";
import { getSemesterByTahunAjaran, showByGuru } from "../../../_services/waliKelas";
import Swal from "sweetalert2";

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
        return text || err?.message || "Terjadi kesalahan";
      }
    } catch (e) {
      return err?.message || "Terjadi kesalahan";
    }
  }

  return err?.response?.data?.message || err?.message || "Terjadi kesalahan";
};

export default function NilaiAkhir() {
  const [kelas, setKelas] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [tahunAjaran, setTahunAjaran] = useState(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
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
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Silakan pilih kelas dan semester terlebih dahulu",
      });
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

      const cleanKelasNama = kelasNama.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
      const cleanSemesterNama = semesterNama.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");

      link.setAttribute("download", `Template_Nilai_${cleanKelasNama}_${cleanSemesterNama}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Template berhasil didownload",
        timer: 2000,
        showConfirmButton: false,
      });

      setError(null);
    } catch (err) {
      const msg = await parseErrorMessage(err);
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Gagal Download",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split(".").pop().toLowerCase();
      if (!["xlsx", "xls", "csv"].includes(ext)) {
        Swal.fire({
          icon: "warning",
          title: "Format File Salah",
          text: "File harus berformat Excel (.xlsx, .xls) atau CSV",
        });
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      setPreviewData(null);
      setError(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedKelas || !selectedSemester) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Pilih kelas dan semester terlebih dahulu",
      });
      return;
    }
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Pilih file Excel terlebih dahulu",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await importNilai(Number(selectedKelas), Number(selectedSemester.id), formData, true);
      setPreviewData(res.data);

      // Show preview summary
      Swal.fire({
        icon: "info",
        title: "Preview Data",
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>Total Data Berhasil:</strong> ${res.data?.summary?.success_count || 0}</p>
            <p class="mb-2"><strong>Total Data Gagal:</strong> ${res.data?.summary?.failed_count || 0}</p>
            <p class="text-sm text-gray-600 mt-3">Scroll ke bawah untuk melihat detail lengkap</p>
          </div>
        `,
        confirmButtonText: "OK, Saya Mengerti",
      });
    } catch (err) {
      const msg = await parseErrorMessage(err);
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Gagal Preview",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedKelas || !selectedSemester) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Pilih kelas dan semester terlebih dahulu",
      });
      return;
    }
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Pilih file Excel terlebih dahulu",
      });
      return;
    }

    // Konfirmasi sebelum import
    const result = await Swal.fire({
      icon: "question",
      title: "Konfirmasi Import",
      text: "Data akan disimpan ke database. Lanjutkan?",
      showCancelButton: true,
      confirmButtonText: "Ya, Import Sekarang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await importNilai(Number(selectedKelas), Number(selectedSemester.id), formData, false);

      const successCount = res.data?.summary?.success_count || 0;
      const failedCount = res.data?.summary?.failed_count || 0;

      if (successCount > 0) {
        await Swal.fire({
          icon: "success",
          title: "Import Berhasil!",
          html: `
            <div class="text-left">
              <p class="mb-2"><strong>✅ Berhasil:</strong> ${successCount} data</p>
              ${failedCount > 0 ? `<p class="mb-2"><strong>❌ Gagal:</strong> ${failedCount} data</p>` : ""}
              <p class="text-sm text-gray-600 mt-3">Data telah tersimpan ke database</p>
            </div>
          `,
          confirmButtonText: "OK",
        });

        // Reset form
        setFile(null);
        setPreviewData(null);
        const input = document.getElementById("fileInput");
        if (input) input.value = "";
      } else {
        Swal.fire({
          icon: "error",
          title: "Import Gagal",
          text: `Tidak ada data yang berhasil diimport. ${failedCount} data gagal.`,
        });
      }
    } catch (err) {
      const msg = await parseErrorMessage(err);
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Gagal Import",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  // Group preview data by siswa
  const getGroupedPreviewData = () => {
    if (!previewData?.details?.success) return [];

    const grouped = {};

    previewData.details.success.forEach((item) => {
      if (!grouped[item.siswa_id]) {
        grouped[item.siswa_id] = {
          siswa_id: item.siswa_id,
          nama: item.nama,
          nilai_mapel: [],
        };
      }

      grouped[item.siswa_id].nilai_mapel.push({
        mapel: item.mapel,
        nilai: item.nilai,
      });
    });

    return Object.values(grouped);
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
                  setPreviewData(null);
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
                  const sem = semesters.find((s) => s.id === Number(e.target.value));
                  setSelectedSemester(sem || null);
                  setPreviewData(null);
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
            <h3 className="font-semibold text-gray-900 mb-4">Langkah 1: Download Template Excel</h3>
            <button
              onClick={handleDownloadTemplate}
              disabled={loading || !selectedKelas || !selectedSemester}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Download className="w-5 h-5" />
              {loading ? "Memproses..." : "Download Template Excel"}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Template akan berisi daftar siswa, kolom nilai mapel, nilai sikap, dan ketidakhadiran
            </p>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Langkah 2: Upload File Excel yang Sudah Diisi</h3>
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
                  onClick={handlePreview}
                  disabled={loading || !file}
                  className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Eye className="w-5 h-5" />
                  {loading ? "Memproses..." : "Lihat Preview"}
                </button>

                <button
                  onClick={handleImport}
                  disabled={loading || !file}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Menyimpan..." : "Simpan ke Database"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                💡 Klik "Lihat Preview" untuk melihat data sebelum disimpan ke database
              </p>
            </div>
          </div>
        </div>

        {previewData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Preview Data Import</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-1">✅ Data Valid</p>
                <p className="text-2xl font-bold text-green-900">{previewData.summary?.success_count || 0}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-1">❌ Data Bermasalah</p>
                <p className="text-2xl font-bold text-red-900">{previewData.summary?.failed_count || 0}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-1">📅 Tahun Ajaran</p>
                <p className="text-lg font-bold text-blue-900">{previewData.summary?.tahun_ajaran?.nama || "-"}</p>
              </div>
            </div>

            {previewData.summary?.unmatched_mapel_headers?.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-medium text-amber-900 mb-2">⚠️ Mapel tidak ditemukan di database:</p>
                <ul className="list-disc list-inside text-sm text-amber-800">
                  {previewData.summary.unmatched_mapel_headers.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
                <p className="text-xs text-amber-700 mt-2">
                  Pastikan nama mapel di Excel sesuai dengan yang ada di database
                </p>
              </div>
            )}

            {previewData.details?.failed?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Data Bermasalah ({previewData.details.failed.length})
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Baris</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Nama Siswa</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Mapel</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Alasan Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {previewData.details.failed.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{item.row}</td>
                          <td className="px-4 py-3 font-medium">{item.nama}</td>
                          <td className="px-4 py-3">{item.mapel || "-"}</td>
                          <td className="px-4 py-3 text-red-600 text-xs">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {getGroupedPreviewData().length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Data Siap Disimpan ({getGroupedPreviewData().length} Siswa)
                </h3>
                
                <div className="space-y-4">
                  {getGroupedPreviewData().map((siswa, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
                        <h4 className="font-semibold text-gray-900">{siswa.nama}</h4>
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">📚 NILAI MAPEL:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {siswa.nilai_mapel.map((mapel, i) => (
                              <div key={i} className="bg-gray-50 rounded px-3 py-2 border">
                                <p className="text-xs text-gray-600">{mapel.mapel}</p>
                                <p className="text-lg font-bold text-blue-600">{mapel.nilai}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    ℹ️ <strong>Catatan:</strong> Data di atas adalah preview. Klik tombol <strong>"Simpan ke Database"</strong> untuk menyimpan data secara permanen.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
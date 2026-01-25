/* eslint-disable no-unused-vars */
// src/pages/guru/hitung_nilai/NilaiDetailDashboard.jsx 
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  CheckCircle, XCircle, Calculator, RefreshCw, 
  TrendingUp, Users, Clock, Plus, Eye, MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import GuruLayout from "../../../components/layout/GuruLayout";
import NilaiDetailForm from "../../../components/NilaiDetailForm";
import CatatanInput from "../../../components/CatatanInput";
import ProgressCard from "../../../components/ProgressCard";
import { showByGuru, getSemesterByTahunAjaran } from "../../../_services/waliKelas";
import { 
  getStrukturNilai, 
  getNilaiDetail, 
  postNilaiDetailBulk, 
  generateNilaiAkhir,
  getProgress 
} from "../../../_services/nilaiDetail";
import api from "../../../_api";

const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={`inline-flex p-2 rounded-lg bg-${color}-50 mb-3`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <div className="text-sm text-gray-500 mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  </div>
);

export default function NilaiDetailDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [kelasId, setKelasId] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [strukturList, setStrukturList] = useState([]);
  const [selectedStruktur, setSelectedStruktur] = useState(null);
  const [rows, setRows] = useState([]);
  const [edited, setEdited] = useState({});
  const [progress, setProgress] = useState(null);
  const [openRow, setOpenRow] = useState(null); // NilaiDetailForm modal
  const [openCatatanRow, setOpenCatatanRow] = useState(null); // Catatan modal
  const [saving, setSaving] = useState(false);
  const [savingCatatan, setSavingCatatan] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateSummary, setGenerateSummary] = useState(null);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!kelasId || !selectedStruktur) return;
    try {
      const res = await getProgress(kelasId, selectedStruktur.id);
      setProgress(res);
    } catch (err) {
      console.error("❌ fetchProgress error:", err);
    }
  }, [kelasId, selectedStruktur]);

  const fetchNilaiDetail = useCallback(async (strukturId) => {
    if (!kelasId || !strukturId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await getNilaiDetail(kelasId, strukturId);
      const payload = res?.data ?? res;

      if (payload?.struktur) {
        setSelectedStruktur(payload.struktur);
      }

      const rowsArray = Array.isArray(payload?.data) ? payload.data
                        : Array.isArray(payload) ? payload
                        : [];

      const normalizeRow = (r) => {
        const nd = r?.nilai_data;
        let nilaiObj = {};
        if (nd == null) {
          nilaiObj = {};
        } else if (typeof nd === "string") {
          try {
            nilaiObj = JSON.parse(nd);
          } catch (e) {
            nilaiObj = {};
            console.warn("Failed parse nilai_data for siswa:", r.siswa_id, e);
          }
        } else if (Array.isArray(nd)) {
          nilaiObj = {};
        } else if (typeof nd === "object") {
          nilaiObj = nd;
        } else {
          nilaiObj = {};
        }

        // keep catatan if provided on row (catatan disimpan terpisah)
        return { ...r, nilai_data: nilaiObj, catatan: r.catatan ?? r.catatan_mapel_siswa?.catatan ?? null, catatan_source: r.catatan_source ?? null };
      };

      const finalRows = rowsArray.map(normalizeRow);
      setRows(finalRows);
      setEdited({});
    } catch (err) {
      console.error("❌ fetchNilaiDetail error:", err);
      setError("Gagal mengambil data nilai detail");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [kelasId]);

  const fetchStruktur = useCallback(async () => {
    if (!kelasId || !selectedSemester) return;

    try {
      setLoading(true);
      setError(null);

      const res = await getStrukturNilai(kelasId, { semester_id: selectedSemester.id });
      const payload = res?.data ?? res;
      const list = Array.isArray(payload) ? payload : (payload?.data ?? payload ?? []);
      setStrukturList(Array.isArray(list) ? list : []);

      if (Array.isArray(list) && list.length === 1) {
        setSelectedStruktur(list[0]);
        fetchNilaiDetail(list[0].id);
      }
    } catch (err) {
      console.error("❌ fetchStruktur error:", err);
      setError("Gagal mengambil struktur nilai. Pastikan struktur sudah dibuat.");
      setStrukturList([]);
    } finally {
      setLoading(false);
    }
  }, [kelasId, selectedSemester, fetchNilaiDetail]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (kelasId && selectedSemester) {
      fetchStruktur();
    }
  }, [kelasId, selectedSemester, fetchStruktur]);

  useEffect(() => {
    if (selectedStruktur) {
      fetchProgress();
    }
  }, [selectedStruktur, fetchProgress]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const resYear = await api.get("/tahun-ajaran/active");
      const yearData = resYear.data?.data || resYear.data;
      setTahunAjaran(yearData);
      
      const resWali = await showByGuru(yearData?.id);
      const data = resWali.data || [];
      setAssignments(data);
      
      if (data.length === 1) {
        setSelectedAssignment(data[0]);
        setKelasId(data[0].kelas_id);
      }
      
      if (yearData?.id) {
        const resSem = await getSemesterByTahunAjaran(yearData.id);
        const semList = resSem.data?.data ?? resSem.data ?? [];
        setSemesters(Array.isArray(semList) ? semList : []);
        
        const activeSem = semList.find(s => s.is_active);
        if (activeSem) {
          setSelectedSemester(activeSem);
        }
      }
    } catch (err) {
      console.error("❌ fetchInitialData error:", err);
      setError(err?.response?.data?.message || "Gagal memuat data awal");
    } finally {
      setLoading(false);
    }
  };

  const onSelectAssignment = (id) => {
    const a = assignments.find((x) => x.id === Number(id));
    setSelectedAssignment(a || null);
    setKelasId(a ? a.kelas_id : null);
    resetData();
  };

  const onSelectSemester = (id) => {
    const sem = semesters.find(s => s.id === Number(id));
    setSelectedSemester(sem);
    resetData();
  };

  const resetData = () => {
    setSelectedStruktur(null);
    setStrukturList([]);
    setRows([]);
    setEdited({});
    setProgress(null);
    setGenerateSummary(null);
    setError(null);
  };

  const onSelectStruktur = (id) => {
    const s = strukturList.find((x) => String(x.id) === String(id));
    setSelectedStruktur(s || null);
    setRows([]);
    setEdited({});
    setProgress(null);
    setGenerateSummary(null);
    if (s) {
      fetchNilaiDetail(s.id);
      fetchProgress();
    }
  };

  // Open Nilai Detail (Pencapaian Akademik) modal
  const openForm = (row) => {
    setOpenRow(row);
  };

  // Open Catatan modal (small modal using CatatanInput)
  const openCatatan = (row) => {
    setOpenCatatanRow(row);
  };

  // Save nilai detail (existing)
  const handleSaveRow = async (saveData) => {
    try {
      setSaving(true);
      
      const payload = {
        data: [{
          siswa_id: saveData.siswa_id,
          nilai_data: saveData.nilai_data
        }]
      };
      
      await postNilaiDetailBulk(kelasId, selectedStruktur.id, payload);
      
      setRows((prev) =>
        prev.map((r) => 
          r.siswa_id === saveData.siswa_id 
            ? { ...r, nilai_data: saveData.nilai_data } 
            : r
        )
      );
      
      setEdited((prev) => {
        const newEdited = { ...prev };
        delete newEdited[saveData.siswa_id];
        return newEdited;
      });
      
      await fetchProgress();
      
      setOpenRow(null);
      setSaving(false);
      
    } catch (error) {
      setSaving(false);
      alert("Gagal menyimpan: " + (error.response?.data?.message || error.message));
    }
  };

  // Save catatan (from CatatanInput)
const handleSaveCatatan = async (payloadFromComponent) => {
  // payloadFromComponent may include siswa_id, struktur_nilai_mapel_id, catatan, mode...
  if (!openCatatanRow || !selectedStruktur) {
    alert("Tidak dapat menyimpan catatan: struktur atau baris tidak terpilih.");
    return;
  }

  const siswaId = payloadFromComponent?.siswa_id ?? openCatatanRow.siswa_id;
  const strukturId = selectedStruktur.id;
  const catatanText = (payloadFromComponent?.catatan ?? openCatatanRow.catatan ?? "").trim() || null;
  // use the existing nilai_data for this row (backend expects data.*.nilai_data)
  const nilaiDataForRow = openCatatanRow.nilai_data ?? {}; // object (will be decoded as array/assoc in PHP)

  try {
    setSavingCatatan(true);

    // Build payload matching backend validation: data: [{ siswa_id, nilai_data, catatan }]
    const payload = {
      data: [
        {
          siswa_id: siswaId,
          nilai_data: nilaiDataForRow,
          catatan: catatanText
        }
      ]
    };

    // Use service wrapper that calls /struktur-nilai/{struktur_id}/nilai-detail/bulk
    await postNilaiDetailBulk(kelasId, strukturId, payload);

    // Update local rows to reflect saved catatan (source = manual because user saved it manually)
    setRows((prev) =>
      prev.map((r) =>
        r.siswa_id === siswaId ? { ...r, catatan: catatanText, catatan_source: "manual" } : r
      )
    );

    alert("Catatan tersimpan.");
    setOpenCatatanRow(null);
  } catch (err) {
    console.error("❌ saveCatatan error:", err);
    alert("Gagal menyimpan catatan: " + (err.response?.data?.message || err.message));
  } finally {
    setSavingCatatan(false);
  }
};


  const handleGenerate = async () => {
    if (!selectedStruktur || !kelasId) {
      alert("Pilih kelas & struktur terlebih dahulu.");
      return;
    }
    
    if (!window.confirm("Generate nilai akhir akan menghitung dan menyimpan nilai akhir. Lanjutkan?")) {
      return;
    }
    
    try {
      setGenerating(true);
      setError(null);
      setGenerateSummary(null);
      const res = await generateNilaiAkhir(kelasId, selectedStruktur.id);
      setGenerateSummary(res.summary || null);
      alert("Generate selesai! Lihat ringkasan di bawah.");
      fetchNilaiDetail(selectedStruktur.id);
      fetchProgress();
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal generate nilai akhir");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewNilai = () => {
    navigate("/guru/nilai-detail/view", {
      state: {
        kelasId: kelasId,
        semesterId: selectedSemester.id,
        strukturId: selectedStruktur.id,
      }
    });
  };

  const hasEdits = Object.keys(edited).length > 0;
  const kelasName = selectedAssignment?.kelas?.nama || "—";
  const mapelName = selectedStruktur?.mapel?.nama || "—";

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              {/* Title changed to "Pencapaian Akademik" */}
              <h1 className="text-3xl font-bold mb-2">Pencapaian Akademik</h1>
              <p className="text-blue-100">
                Kelola nilai formatif, ASLIM (UTS), dan ASAS (UAS)
              </p>
            </div>
            {tahunAjaran && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-xs text-blue-100">Tahun Ajaran</div>
                <div className="text-lg font-bold">{tahunAjaran.nama}</div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <Link
            to="/guru/struktur-nilai"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Buat Struktur Nilai
          </Link>
          <Link
            to="/guru/nilai-sikap"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Buat Nilai Sikap & Absensi
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kelas
              </label>
              <select
                value={selectedAssignment?.id || ""}
                onChange={(e) => onSelectAssignment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Pilih Kelas --</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.kelas?.nama ?? `Kelas ${a.kelas_id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Semester
              </label>
              <select
                value={selectedSemester?.id || ""}
                onChange={(e) => onSelectSemester(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!kelasId}
              >
                <option value="">-- Pilih Semester --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} {s.is_active && "(Aktif)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Mapel
              </label>
              <select
                value={selectedStruktur?.id || ""}
                onChange={(e) => onSelectStruktur(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedSemester}
              >
                <option value="">-- Pilih Mapel --</option>
                {strukturList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.mapel?.nama ?? `Mapel ${s.mapel_id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        {selectedStruktur && progress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              title="Total Siswa"
              value={rows.length}
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              title="Data Lengkap"
              value={progress.summary?.complete || 0}
              subtitle={`${progress.summary?.completion_rate || 0}% selesai`}
              color="green"
            />
            <StatCard
              icon={Clock}
              title="Sebagian Terisi"
              value={progress.summary?.partial || 0}
              color="yellow"
            />
            <StatCard
              icon={TrendingUp}
              title="Belum Disimpan"
              value={hasEdits ? Object.keys(edited).length : 0}
              color="amber"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Data Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Daftar Siswa - {kelasName}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Mapel: {mapelName}
                    </p>
                  </div>
                  {selectedStruktur && (
                    <button
                      onClick={fetchProgress}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  )}
                </div>

                {selectedStruktur && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      {generating ? "Processing..." : "Generate Nilai Akhir"}
                    </button>
                    <button
                      onClick={handleViewNilai}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Nilai
                    </button>
                  </div>
                )}
              </div>

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
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-gray-500">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-12 text-center text-gray-500">
                          {selectedStruktur 
                            ? "Belum ada data siswa" 
                            : "Pilih kelas, semester, dan mapel untuk melihat data"}
                        </td>
                      </tr>
                    ) : (
                      rows.map((r, idx) => {
                        const hasData = r.nilai_data && Object.keys(r.nilai_data).length > 0;
                        const hasEdit = edited[r.siswa_id];
                        const progressData = progress?.progress?.find(p => p.siswa_id === r.siswa_id);
                        
                        return (
                          <tr key={r.siswa_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {r.siswa_nama}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {hasEdit ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  Belum Disimpan
                                </span>
                              ) : progressData ? (
                                progressData.status === 'complete' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Lengkap
                                  </span>
                                ) : progressData.status === 'partial' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {progressData.percentage}%
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Kosong
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Kosong
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Button 1: Pencapaian Akademik (Nilai Detail) */}
                                <button
                                  onClick={() => openForm(r)}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  {hasData ? "Edit Capaian Akademik" : "Input Capaian Akademik"}
                                </button>

                                {/* Button 2: Catatan (hanya tampil jika ada nilai) */}
                                {hasData && (
                                  <button
                                    onClick={() => openCatatan(r)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-100"
                                    title="Tambahkan / edit catatan siswa"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    Catatan
                                  </button>
                                )}
                              </div>
                              {/* optionally show small preview of catatan under actions */}
                              {r.catatan && (
                                <div className="mt-2 text-xs text-gray-600 italic">{r.catatan.length > 80 ? r.catatan.slice(0,80) + "..." : r.catatan}</div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Generate Summary */}
              {generateSummary && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Hasil Generate Nilai Akhir
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Berhasil</div>
                      <div className="text-2xl font-bold text-green-600">
                        {generateSummary.success}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Di-skip</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {generateSummary.skipped_incomplete || 0}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Gagal</div>
                      <div className="text-2xl font-bold text-red-600">
                        {generateSummary.failed}
                      </div>
                    </div>
                  </div>
                  {generateSummary.note && (
                    <div className="text-sm text-gray-600 italic">
                      ℹ️ {generateSummary.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Progress Card */}
          <div className="lg:col-span-1">
            {progress && <ProgressCard progress={progress} />}
          </div>
        </div>

        {/* Form Modal: NilaiDetailForm */}
        {openRow && selectedStruktur && (
          <NilaiDetailForm
            open={!!openRow}
            onClose={() => setOpenRow(null)}
            row={openRow}
            struktur={selectedStruktur}
            onSave={handleSaveRow}
          />
        )}

        {/* Modal: CatatanInput (small modal) */}
{openCatatanRow && selectedStruktur && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="fixed inset-0 bg-black/50"
      onClick={() => { if(!savingCatatan) setOpenCatatanRow(null); }}
    />
    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg z-10 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Catatan: {openCatatanRow.siswa_nama}</h3>
          <p className="text-xs text-gray-500 mt-1">Mapel: {selectedStruktur.mapel?.nama}</p>
        </div>
        <button onClick={() => { if(!savingCatatan) setOpenCatatanRow(null); }} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <CatatanInput
        mode="nilai_detail"
        siswaId={openCatatanRow.siswa_id}
        mapelId={selectedStruktur.mapel_id ?? selectedStruktur.mapel?.id}
        strukturId={selectedStruktur.id}
        initialValue={openCatatanRow.catatan ?? ""}
        onSave={async (payload) => {
          // CatatanInput akan mengirim { siswa_id, mapel_id, struktur_nilai_mapel_id, catatan, mode }
          // Kita terima payload itu langsung dan simpan lewat postNilaiDetailBulk
          await handleSaveCatatan(payload);
        }}
        disabled={savingCatatan}
        placeholder="Tulis catatan akademik..."
      />

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={() => setOpenCatatanRow(null)} className="px-4 py-2 border rounded text-sm">Batal</button>

        {/* optional: keep an explicit save button that triggers the same save path by
            reading current catatan from the row (in case user didn't press internal save) */}
        <button
          onClick={async () => {
            // trigger save with the latest catatan in the CatatanInput: the component calls onSave itself,
            // but if you want this button to also work, you can fetch the current value from openCatatanRow.catatan.
            // Safer: call handleSaveCatatan without payload -> it will use openCatatanRow.catatan
            await handleSaveCatatan({});
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm"
          disabled={savingCatatan}
        >
          {savingCatatan ? "Menyimpan..." : "Simpan Catatan"}
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </GuruLayout>
  );
}

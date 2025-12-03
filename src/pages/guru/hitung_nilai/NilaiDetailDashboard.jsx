// src/pages/guru/hitung_nilai/NilaiDetailDashboard.jsx - DEBUG VERSION
import React, { useEffect, useState } from "react";
import { 
  CheckCircle, XCircle, Calculator, Save, RefreshCw, 
  TrendingUp, Users, Clock, Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import GuruLayout from "../../../components/layout/GuruLayout";
import NilaiDetailForm from "../../../components/NilaiDetailForm";
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
  const [openRow, setOpenRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateSummary, setGenerateSummary] = useState(null);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (kelasId && selectedSemester) {
      fetchStruktur();
    }
  }, [kelasId, selectedSemester]);

  useEffect(() => {
    if (selectedStruktur) {
      fetchProgress();
    }
  }, [selectedStruktur]);

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

const fetchStruktur = async () => {
  if (!kelasId || !selectedSemester) return;

  try {
    setLoading(true);
    setError(null);

    const res = await getStrukturNilai(kelasId, { semester_id: selectedSemester.id });
    // res may be axios response or already data; handle both
    const payload = res?.data ?? res;
    // payload may be { data: [ ... ] } or array directly
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

 const fetchNilaiDetail = async (strukturId) => {
  if (!kelasId || !strukturId) return;

  try {
    setLoading(true);
    setError(null);

    const res = await getNilaiDetail(kelasId, strukturId);
    // res may be axios response: res.data === { struktur: {...}, data: [...] }
    const payload = res?.data ?? res;

    // Extract struktur from payload if present (keamanan: keep server-provided struktur)
    if (payload?.struktur) {
      // some responses wrap struktur inside payload.struktur
      setSelectedStruktur(payload.struktur);
    }

    // Extract rows array
    const rowsArray = Array.isArray(payload?.data) ? payload.data
                      : Array.isArray(payload) ? payload
                      : [];

    // Normalize nilai_data per row:
    const normalizeRow = (r) => {
      const nd = r?.nilai_data;
      let nilaiObj = {};
      if (nd == null) {
        nilaiObj = {};
      } else if (typeof nd === "string") {
        try {
          nilaiObj = JSON.parse(nd);
        } catch (e) {
          console.warn("⚠️ Failed parse nilai_data string, fallback to {} for siswa:", r.siswa_id, e);
          nilaiObj = {};
        }
      } else if (Array.isArray(nd)) {
        // fallback if backend returns empty array
        nilaiObj = {};
      } else if (typeof nd === "object") {
        nilaiObj = nd;
      } else {
        nilaiObj = {};
      }

      return { ...r, nilai_data: nilaiObj };
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
};

  const fetchProgress = async () => {
    if (!kelasId || !selectedStruktur) return;
    
    try {
      const res = await getProgress(kelasId, selectedStruktur.id);
      setProgress(res);
    } catch (err) {
      console.error("❌ fetchProgress error:", err);
    }
  };

  const openForm = (row) => {
    setOpenRow(row);
  };

  const handleSaveRow = async (saveData) => {
  
  try {
    // Update UI langsung
    setEdited((p) => ({ ...p, [saveData.siswa_id]: saveData.nilai_data }));
    setRows((prev) =>
      prev.map((r) => 
        r.siswa_id === saveData.siswa_id 
          ? { ...r, nilai_data: saveData.nilai_data } 
          : r
      )
    );
    
    // ✅ OPTIONAL: Juga save ke backend via bulk (jika ingin tetap pakai bulk)
    const payload = {
      data: [{
        siswa_id: saveData.siswa_id,
        nilai_data: saveData.nilai_data
      }]
    };
    
    await postNilaiDetailBulk(kelasId, selectedStruktur.id, payload);
    
    setOpenRow(null);
    fetchProgress(); // Refresh progress
  } catch (error) {
    console.error("❌ Error in handleSaveRow:", error);
    alert("Gagal menyimpan: " + (error.response?.data?.message || error.message));
  }
};

const handleSaveAll = async () => {
  if (!selectedStruktur || !kelasId) {
    alert("Pilih kelas dan struktur terlebih dahulu.");
    return;
  }

  const safeParse = (v) => {
    if (!v) return {};
    if (typeof v === "object") return v;
    try {
      return JSON.parse(v);
    } catch {
      return {};
    }
  };

  const payloadArray = rows.map((r) => {
    const edit = edited[Number(r.siswa_id)];
    const nilaiData = edit ? edit : safeParse(r.nilai_data);


    return {
      siswa_id: Number(r.siswa_id),
      nilai_data: nilaiData,
    };
  });


  try {
    setSaving(true);
    setError(null);

    const res = await postNilaiDetailBulk(
      kelasId,
      selectedStruktur.id,
      { data: payloadArray }
    );

    console.log("✅ Save Response:", res);
    alert("Berhasil menyimpan nilai.");

    setEdited({});
    fetchNilaiDetail(selectedStruktur.id);
    fetchProgress();
  } catch (err) {
    setError(err?.response?.data?.message || "Gagal menyimpan nilai");
  } finally {
    setSaving(false);
  }
};


  const handleGenerate = async () => {
    if (!selectedStruktur || !kelasId) {
      alert("Pilih kelas & struktur terlebih dahulu.");
      return;
    }
    
    if (!confirm("Generate nilai akhir akan menghitung dan menyimpan nilai akhir. Lanjutkan?")) {
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
              <h1 className="text-3xl font-bold mb-2">Input Nilai Detail</h1>
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
                      onClick={handleSaveAll}
                      disabled={saving || !hasEdits}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Menyimpan..." : `Simpan${hasEdits ? ` (${Object.keys(edited).length})` : ""}`}
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      {generating ? "Processing..." : "Generate Nilai Akhir"}
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
                              <button
                                onClick={() => openForm(r)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                {hasData ? "Edit" : "Input"}
                              </button>
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

        {/* Form Modal */}
        {openRow && selectedStruktur && (
          <NilaiDetailForm
            open={!!openRow}
            onClose={() => setOpenRow(null)}
            row={openRow}
            struktur={selectedStruktur}
            onSave={handleSaveRow}
          />
        )}
      </div>
    </GuruLayout>
  );
}
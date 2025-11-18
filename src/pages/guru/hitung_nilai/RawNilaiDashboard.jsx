import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, FileText, Users, BookOpen, Calculator } from "lucide-react";
import GuruLayout from "../../../components/layout/GuruLayout";
import RawNilaiForm from "./RawNilaiForm";
import NilaiSikapForm from "./NilaiSikapForm";
import { showByGuru, getSemesterByTahunAjaran } from "../../../_services/waliKelas";
import { 
  getStrukturNilai, 
  getNilaiDetail, 
  postNilaiDetailBulk, 
  generateNilaiAkhir 
} from "../../../_services/nilaiDetail";
import { getNilaiSikap, bulkStoreNilaiSikap } from "../../../_services/nilaiSikap";
import api from "../../../_api";

const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-${color}-50`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </div>
  </div>
);

export default function RawNilaiDashboard() {
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
  const [nilaiSikapData, setNilaiSikapData] = useState([]);
  const [editedSikap, setEditedSikap] = useState({});
  const [activeTab, setActiveTab] = useState("nilai-detail");
  const [openRow, setOpenRow] = useState(null);
  const [openSikapRow, setOpenSikapRow] = useState(null);
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
      if (activeTab === "nilai-sikap") {
        fetchNilaiSikap();
      }
    }
  }, [kelasId, selectedSemester, activeTab]);

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
      console.error("fetchInitialData error:", err);
      setError(err?.response?.data?.message || err?.message || "Gagal memuat data awal");
    } finally {
      setLoading(false);
    }
  };

  const onSelectAssignment = (id) => {
    const a = assignments.find((x) => x.id === Number(id));
    setSelectedAssignment(a || null);
    const kId = a ? a.kelas_id : null;
    setKelasId(kId);
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
    setNilaiSikapData([]);
    setEditedSikap({});
    setGenerateSummary(null);
    setError(null);
  };

  const fetchStruktur = async () => {
    if (!kelasId || !selectedSemester) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await getStrukturNilai(kelasId, { semester_id: selectedSemester.id });
      const list = Array.isArray(res) ? res : [];
      setStrukturList(list);
      
      if (list.length === 1) {
        setSelectedStruktur(list[0]);
        fetchNilaiDetail(list[0].id);
      }
    } catch (err) {
      console.error("fetchStruktur error:", err);
      setError("Gagal mengambil struktur nilai. Pastikan struktur sudah dibuat untuk mapel ini.");
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
    setGenerateSummary(null);
    if (s) fetchNilaiDetail(s.id);
  };

  const fetchNilaiDetail = async (strukturId) => {
    if (!kelasId || !strukturId) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await getNilaiDetail(kelasId, strukturId);
      const data = res.data || [];
      setRows(data);
      setEdited({});
    } catch (err) {
      console.error("fetchNilaiDetail error:", err);
      setError("Gagal mengambil data nilai detail");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNilaiSikap = async () => {
    if (!kelasId || !selectedSemester) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await getNilaiSikap(kelasId, { semester_id: selectedSemester.id });
      const data = res.data || [];
      setNilaiSikapData(data);
      setEditedSikap({});
    } catch (err) {
      console.error("fetchNilaiSikap error:", err);
      setError("Gagal mengambil data nilai sikap");
      setNilaiSikapData([]);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (row) => {
    setOpenRow(row);
  };

  const openSikapForm = (row) => {
    setOpenSikapRow(row);
  };

  const handleSaveRow = (siswaId, nilaiData) => {
    setEdited((p) => ({ ...p, [siswaId]: nilaiData }));
    setRows((prev) =>
      prev.map((r) => (r.siswa_id === siswaId ? { ...r, nilai_data: nilaiData } : r))
    );
    setOpenRow(null);
  };

  const handleSaveSikapRow = (siswaId, nilai, deskripsi) => {
    setEditedSikap(p => ({ ...p, [siswaId]: { nilai, deskripsi } }));
    setNilaiSikapData(prev =>
      prev.map(r => r.siswa_id === siswaId 
        ? { ...r, nilai, deskripsi, nilai_label: getNilaiLabel(nilai) }
        : r
      )
    );
    setOpenSikapRow(null);
  };

  const getNilaiLabel = (nilai) => {
    const labels = {
      A: "Sangat Baik",
      B: "Baik", 
      C: "Cukup",
      D: "Kurang",
      E: "Sangat Kurang"
    };
    return labels[nilai] || nilai;
  };

  const handleSaveAll = async () => {
    if (!selectedStruktur || !kelasId) {
      alert("Pilih kelas dan struktur terlebih dahulu.");
      return;
    }
    
    const payloadArray = rows.map((r) => ({
      siswa_id: r.siswa_id,
      nilai_data: edited[r.siswa_id] || r.nilai_data || {},
    }));

    try {
      setSaving(true);
      setError(null);
      await postNilaiDetailBulk(kelasId, selectedStruktur.id, { data: payloadArray });
      alert("Berhasil menyimpan semua nilai.");
      setEdited({});
      fetchNilaiDetail(selectedStruktur.id);
    } catch (err) {
      console.error("saveBulkNilai error:", err);
      setError(err?.response?.data?.message || "Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllSikap = async () => {
    if (!kelasId || !selectedSemester) {
      alert("Pilih kelas dan semester terlebih dahulu.");
      return;
    }

    const payloadArray = nilaiSikapData
      .filter(r => editedSikap[r.siswa_id])
      .map(r => ({
        siswa_id: r.siswa_id,
        nilai: editedSikap[r.siswa_id].nilai,
        deskripsi: editedSikap[r.siswa_id].deskripsi || "",
      }));

    if (payloadArray.length === 0) {
      alert("Tidak ada perubahan nilai sikap untuk disimpan.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await bulkStoreNilaiSikap(kelasId, {
        semester_id: selectedSemester.id,
        data: payloadArray,
      });
      alert("Berhasil menyimpan nilai sikap.");
      setEditedSikap({});
      fetchNilaiSikap();
    } catch (err) {
      console.error("saveBulkSikap error:", err);
      setError(err?.response?.data?.message || "Gagal menyimpan nilai sikap");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedStruktur || !kelasId) {
      alert("Pilih kelas & struktur terlebih dahulu.");
      return;
    }
    
    if (!confirm("Generate nilai akhir akan menghitung dan menyimpan nilai akhir ke tabel nilai. Lanjutkan?")) {
      return;
    }
    
    try {
      setGenerating(true);
      setError(null);
      setGenerateSummary(null);
      const res = await generateNilaiAkhir(kelasId, selectedStruktur.id);
      setGenerateSummary(res.summary || null);
      alert("Generate selesai. Lihat ringkasan di bawah.");
      fetchNilaiDetail(selectedStruktur.id);
    } catch (err) {
      console.error("generateNilaiAkhir error:", err);
      setError(err?.response?.data?.message || "Gagal generate nilai akhir");
    } finally {
      setGenerating(false);
    }
  };

  const hasEdits = Object.keys(edited).length > 0;
  const hasSikapEdits = Object.keys(editedSikap).length > 0;

  return (
    <GuruLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Input Nilai Detail</h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola nilai detail dan nilai sikap siswa per semester
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {tahunAjaran && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Tahun Ajaran Aktif:</span>{" "}
                <span className="font-bold">{tahunAjaran.nama}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pilih Kelas</label>
              <select
                value={selectedAssignment?.id || ""}
                onChange={(e) => onSelectAssignment(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium mb-1">Pilih Semester</label>
              <select
                value={selectedSemester?.id || ""}
                onChange={(e) => onSelectSemester(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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

            {activeTab === "nilai-detail" && (
              <div>
                <label className="block text-sm font-medium mb-1">Pilih Mapel</label>
                <select
                  value={selectedStruktur?.id || ""}
                  onChange={(e) => onSelectStruktur(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
            )}
          </div>
        </div>

        {selectedSemester && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              title="Total Siswa"
              value={activeTab === "nilai-detail" ? rows.length : nilaiSikapData.length}
              color="blue"
            />
            <StatCard
              icon={BookOpen}
              title="Mapel Tersedia"
              value={strukturList.length}
              color="green"
            />
            <StatCard
              icon={FileText}
              title="Nilai Terinput"
              value={activeTab === "nilai-detail" 
                ? rows.filter(r => r.nilai_data && Object.keys(r.nilai_data).length > 0).length
                : nilaiSikapData.filter(r => r.nilai).length
              }
              color="purple"
            />
            <StatCard
              icon={Calculator}
              title="Perubahan Belum Disimpan"
              value={activeTab === "nilai-detail" ? Object.keys(edited).length : Object.keys(editedSikap).length}
              color="amber"
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-1">
              <button
                onClick={() => setActiveTab("nilai-detail")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "nilai-detail"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Nilai Detail (Per Mapel)
              </button>
              <button
                onClick={() => {
                  setActiveTab("nilai-sikap");
                  if (kelasId && selectedSemester) {
                    fetchNilaiSikap();
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "nilai-sikap"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Nilai Sikap
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "nilai-detail" && (
              <>
                {selectedStruktur && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-2">
                      Struktur: {selectedStruktur.mapel?.nama ?? "—"}
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      {selectedStruktur.struktur?.map((lm) => (
                        <div key={lm.lm_key}>
                          <span className="font-semibold">{lm.lm_label}:</span>{" "}
                          {lm.kolom?.map((k) => k.kolom_label).join(" • ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStruktur && (
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={handleSaveAll}
                      disabled={saving || !hasEdits}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {saving ? "Menyimpan..." : `Simpan Semua${hasEdits ? ` (${Object.keys(edited).length})` : ""}`}
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <Calculator className="w-5 h-5" />
                      {generating ? "Generating..." : "Generate Nilai Akhir"}
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : rows.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            {selectedStruktur 
                              ? "Belum ada data siswa" 
                              : "Pilih mapel untuk melihat data"}
                          </td>
                        </tr>
                      ) : (
                        rows.map((r, idx) => {
                          const hasData = r.nilai_data && Object.keys(r.nilai_data).length > 0;
                          const hasEdit = edited[r.siswa_id];
                          return (
                            <tr key={r.siswa_id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{r.siswa_nama}</div>
                              </td>
                              <td className="px-4 py-3">
                                {hasEdit ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    Belum Disimpan
                                  </span>
                                ) : hasData ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Sudah Ada Nilai
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Kosong
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => openForm(r)}
                                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  Input / Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {generateSummary && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold mb-3">Hasil Generate Nilai Akhir</div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Berhasil: <strong>{generateSummary.success}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span>Gagal: <strong>{generateSummary.failed}</strong></span>
                      </div>
                    </div>
                    {generateSummary.details && generateSummary.details.length > 0 && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="font-medium mb-2">Detail Error:</div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {generateSummary.details.map((d) => (
                            <li key={d.siswa_id} className="text-red-600">
                              Siswa ID {d.siswa_id}: {d.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "nilai-sikap" && (
              <>
                {kelasId && selectedSemester && (
                  <div className="mb-6 flex gap-3">
                    <button
                      onClick={handleSaveAllSikap}
                      disabled={saving || !hasSikapEdits}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {saving ? "Menyimpan..." : `Simpan Nilai Sikap${hasSikapEdits ? ` (${Object.keys(editedSikap).length})` : ""}`}
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : nilaiSikapData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                            {kelasId && selectedSemester 
                              ? "Belum ada data siswa"
                              : "Pilih kelas dan semester untuk melihat data"}
                          </td>
                        </tr>
                      ) : (
                        nilaiSikapData.map((r, idx) => {
                          const hasEdit = editedSikap[r.siswa_id];
                          return (
                            <tr key={r.siswa_id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{r.nama}</div>
                              </td>
                              <td className="px-4 py-3">
                                {r.nilai ? (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    r.nilai === 'A' ? 'bg-green-100 text-green-800' :
                                    r.nilai === 'B' ? 'bg-blue-100 text-blue-800' :
                                    r.nilai === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                    r.nilai === 'D' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {r.nilai} - {r.nilai_label}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">Belum ada</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                  {r.deskripsi || "-"}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => openSikapForm(r)}
                                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  {r.nilai ? "Edit" : "Input"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {openRow && selectedStruktur && (
          <RawNilaiForm
            open={!!openRow}
            onClose={() => setOpenRow(null)}
            row={openRow}
            struktur={selectedStruktur}
            onSave={handleSaveRow}
          />
        )}

        {openSikapRow && selectedSemester && (
          <NilaiSikapForm
            open={!!openSikapRow}
            onClose={() => setOpenSikapRow(null)}
            row={openSikapRow}
            semester={selectedSemester}
            onSave={handleSaveSikapRow}
          />
        )}
      </div>
    </GuruLayout>
  );
}
// src/pages/guru/struktur_nilai/StrukturNilai.jsx
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, Users, Calendar, AlertCircle } from "lucide-react";
import GuruLayout from "../../../components/layout/GuruLayout";
import StrukturNilaiForm from "../../../components/StrukturNilaiForm";
import { showByGuru, getSemesterByTahunAjaran } from "../../../_services/waliKelas";
import { getStrukturNilai, deleteStruktur } from "../../../_services/nilaiDetail";
import Swal from "sweetalert2";

import api from "../../../_api";
// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={`inline-flex p-2 rounded-lg bg-${color}-50 mb-3`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <div className="text-sm text-gray-500 mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  </div>
);

export default function StrukturNilaiDashboard() {
  const [loading, setLoading] = useState(false);
  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [kelasId, setKelasId] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [strukturList, setStrukturList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (kelasId && selectedSemester) {
      fetchStruktur();
    }
  }, [kelasId, selectedSemester]);

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
      setError(err?.response?.data?.message || "Gagal memuat data awal");
    } finally {
      setLoading(false);
    }
  };

  const onSelectAssignment = (id) => {
    const a = assignments.find((x) => x.id === Number(id));
    setSelectedAssignment(a || null);
    setKelasId(a ? a.kelas_id : null);
    setStrukturList([]);
  };

  const onSelectSemester = (id) => {
    const sem = semesters.find(s => s.id === Number(id));
    setSelectedSemester(sem);
    setStrukturList([]);
  };

  const fetchStruktur = async () => {
    if (!kelasId || !selectedSemester) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getStrukturNilai(kelasId, { semester_id: selectedSemester.id });
      const list = Array.isArray(data) ? data : (data?.data || []);
      setStrukturList(list);
    } catch (err) {
      console.error("fetchStruktur error:", err);
      setError("Gagal mengambil struktur nilai");
      setStrukturList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const { value: confirmDelete } = await Swal.fire({
        title: "Hapus Struktur?",
        text: "Struktur nilai akan dihapus permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
    });
    if (!confirmDelete) return;

    
    try {
      await deleteStruktur(kelasId, id);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Struktur nilai berhasil dihapus",
      });

      fetchStruktur();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err?.response?.data?.message || "Gagal menghapus struktur nilai",
      });
    }
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    setEditData(null);
    if (refresh) {
      fetchStruktur();
    }
  };

  const kelasName = selectedAssignment?.kelas?.nama || "—";

  return (
    <GuruLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-5 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Struktur Nilai</h1>
              <p className="text-blue-100 text-sm">
                Kelola struktur nilai per mapel dan semester
              </p>
            </div>
            {tahunAjaran && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <div className="text-xs text-blue-100">Tahun Ajaran</div>
                <div className="text-base sm:text-lg font-semibold">{tahunAjaran.nama}</div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
        </div>

        {selectedSemester && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={BookOpen}
                title="Total Struktur"
                value={strukturList.length}
                color="blue"
              />
              <StatCard
                icon={Users}
                title="Kelas"
                value={kelasName}
                color="green"
              />
              <StatCard
                icon={Calendar}
                title="Semester"
                value={selectedSemester?.nama || "—"}
                color="purple"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Daftar Struktur Nilai - {kelasName}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedSemester?.nama}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {kelasId && (
                      <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Buat Struktur
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTENT: card grid for strukturList */}
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">Loading...</span>
                  </div>
                ) : strukturList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Belum ada struktur nilai. Klik "Buat Struktur" untuk membuat.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {strukturList.map((item, idx) => {
                      const struktur = item.struktur || {};
                      const lmCount = struktur.lingkup_materi?.length || 0;
                      return (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm text-gray-500">No. {idx + 1}</div>
                                <div className="text-lg font-semibold text-gray-900 mt-1">
                                  {item.mapel?.nama || "—"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Kode: {item.mapel?.kode || "—"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {lmCount} LM
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{/* placeholder for spacing */}</div>
                              </div>
                            </div>

                            <div className="mt-3 text-sm text-gray-700">
                              <div>Dibuat Oleh: <span className="font-medium text-gray-900">{item.created_by_guru?.nama || "—"}</span></div>
                              {item.updated_at && (
                                <div className="text-xs text-gray-400 mt-1">Terakhir diubah: {new Date(item.updated_at).toLocaleString()}</div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Hapus
                              </button>
                            </div>

                            <div className="text-xs text-gray-500">
                              {/* optional small meta */}
                              {item.semester?.nama || selectedSemester?.nama}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {showForm && (
          <StrukturNilaiForm
            open={showForm}
            onClose={handleFormClose}
            kelasId={kelasId}
            semesterId={selectedSemester?.id}
            editData={editData}
          />
        )}
      </div>
    </GuruLayout>
  );
}

import React, { useState, useEffect } from "react";
import jadwalService from "../../../_services/jadwal";
import JadwalForm from "../../../components/JadwalForm";
import JadwalPrintView from "../../../components/JadwalPrintView";
import GuruLayout from "../../../components/layout/GuruLayout";

const HARI_OPTIONS = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

const JadwalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [waliKelasList, setWaliKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [jadwalData, setJadwalData] = useState(null);
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState(null);

  useEffect(() => {
    loadWaliKelasList();
    loadTahunAjaran();
  }, []);

  const loadWaliKelasList = async () => {
    try {
      const response = await jadwalService.getWaliKelasList();
      setWaliKelasList(response.data || []);
    } catch (error) {
      console.error("Error loading wali kelas:", error);
      alert("Gagal memuat data kelas yang Anda ampu");
    } finally {
      setLoading(false);
    }
  };

  const loadTahunAjaran = async () => {
    try {
      const response = await jadwalService.getTahunAjaranAktif();
      setTahunAjaranAktif(response.data.data);
    } catch (error) {
      console.error("Error loading tahun ajaran:", error);
    }
  };

  const loadJadwal = async (kelasId) => {
    setLoading(true);
    try {
      const response = await jadwalService.getJadwalByKelas(kelasId);
      setJadwalData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setJadwalData(null);
      } else {
        console.error("Error loading jadwal:", error);
        alert("Gagal memuat jadwal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKelas = async (kelas) => {
    setSelectedKelas(kelas);
    await loadJadwal(kelas.kelas.id);
    setView("list");
  };

  const handleCreateNew = () => {
    setView("create");
  };

  const handleEdit = () => {
    setView("edit");
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Yakin ingin menghapus jadwal ini? Semua slot jadwal akan terhapus!"
      )
    ) {
      return;
    }

    try {
      await jadwalService.deleteJadwal(
        selectedKelas.kelas.id,
        jadwalData.jadwal.id
      );
      alert("Jadwal berhasil dihapus!");
      await loadJadwal(selectedKelas.kelas.id);
      setView("list");
    } catch (error) {
      console.error("Error deleting jadwal:", error);
      alert(
        error.response?.data?.message || "Gagal menghapus jadwal"
      );
    }
  };

  const handleFormSuccess = async () => {
    await loadJadwal(selectedKelas.kelas.id);
    setView("list");
  };

  const handleCancel = () => {
    setView("list");
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleActualPrint = () => {
    window.print();
  };

  const getSlotColor = (tipeSlot) => {
    return tipeSlot === "pelajaran"
      ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-400 hover:from-blue-100 hover:to-indigo-100 shadow-sm"
      : "bg-gradient-to-br from-gray-50 to-slate-50 border-l-4 border-gray-400 hover:from-gray-100 hover:to-slate-100 shadow-sm";
  };

  const calculateSlotHeight = (durasiMenit) => {
    return Math.max(durasiMenit * 2, 60);
  };

  // Render: Loading state
  if (loading && !selectedKelas) {
    return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Memuat data...</p>
        </div>
      </div>
    </GuruLayout>
    );
  }

  // Render: Select Kelas
  if (!selectedKelas) {
    return (
        <GuruLayout>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
              Kelola Jadwal Pelajaran
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pilih kelas yang Anda ampu untuk mengelola jadwal pelajaran
            </p>
          </div>

          {waliKelasList.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Anda Belum Menjadi Wali Kelas
              </h2>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                Saat ini Anda belum ditugaskan sebagai wali kelas. Hubungi administrator untuk penugasan.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                >
                Refresh Halaman
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {waliKelasList.map((wk) => (
                  <div
                    key={wk.id}
                    onClick={() => handleSelectKelas(wk)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-blue-300/50 hover:transform hover:-translate-y-1 cursor-pointer group p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{wk.kelas.tingkat}</span>
                      </div>
                      <div className="w-3 h-3 bg-green-400 rounded-full ring-2 ring-green-200 animate-pulse"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {wk.kelas.nama}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>Tingkat: {wk.kelas.tingkat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>Section: {wk.kelas.section}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>Tahun Ajaran: {wk.tahunAjaran?.nama || "-"}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200/50">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-semibold text-sm">Kelola Jadwal</span>
                        <svg className="w-5 h-5 text-blue-500 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
        </GuruLayout>
    );
  }

  // Render: Form Create/Edit
  if (view === "create" || view === "edit") {
    return (
        <GuruLayout>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <button
              onClick={() => setSelectedKelas(null)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Pilih Kelas
            </button>
            <span className="mx-3 text-gray-400">›</span>
            <button
              onClick={() => setView("list")}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {selectedKelas.kelas.nama}
            </button>
            <span className="mx-3 text-gray-400">›</span>
            <span className="text-gray-800 font-semibold">
              {view === "create" ? "Buat Jadwal Baru" : "Edit Jadwal"}
            </span>
          </div>

          <JadwalForm
            kelasId={selectedKelas.kelas.id}
            existingJadwal={view === "edit" ? jadwalData : null}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
              </GuruLayout>
    );
  }

  // Render: Jadwal View
  return (
            <GuruLayout>
                
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => setSelectedKelas(null)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 flex items-center gap-2 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Pilihan Kelas
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">{selectedKelas.kelas.tingkat}</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                    Jadwal {selectedKelas.kelas.nama}
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    {tahunAjaranAktif?.nama} • Semester {tahunAjaranAktif?.semester_aktif?.nama}
                  </p>
                </div>
              </div>
            </div>

            {jadwalData ? (
              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center gap-2"
                  >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Jadwal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus
                </button>
              </div>
            ) : (
                <button
                onClick={handleCreateNew}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Jadwal Baru
              </button>
            )}
          </div>
        </div>

        {/* Jadwal Display */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Memuat jadwal...</p>
          </div>
        ) : !jadwalData ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Belum Ada Jadwal
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Kelas ini belum memiliki jadwal pelajaran. Mulai buat jadwal untuk mengatur mata pelajaran dan waktu belajar.
            </p>
            <button
              onClick={handleCreateNew}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
              Buat Jadwal Baru
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            {/* Jadwal Info */}
            {jadwalData.jadwal.nama && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">
                  {jadwalData.jadwal.nama}
                </h2>
                <p className="text-blue-100 mt-1">Jadwal Pelajaran Kelas {selectedKelas.kelas.nama}</p>
              </div>
            )}

            {/* Jadwal Grid */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {HARI_OPTIONS.map(({ value, label }) => {
                    const slotsForDay = jadwalData.slots_by_hari[value] || [];
                    
                  return (
                    <div key={value} className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300">
                      {/* Header Hari */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-4 text-center">
                        <h3 className="font-bold text-lg">{label}</h3>
                      </div>

                      {/* Slots */}
                      <div className="p-4 space-y-3 min-h-[400px]">
                        {slotsForDay.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">Tidak ada jadwal</p>
                          </div>
                        ) : (
                            slotsForDay.map((slot) => (
                                <div
                                key={slot.id}
                                className={`rounded-xl p-4 transition-all duration-200 hover:transform hover:-translate-y-0.5 ${getSlotColor(
                                    slot.tipe_slot
                                )}`}
                                style={{
                                    minHeight: `${calculateSlotHeight(slot.durasi_menit)}px`,
                                }}
                            >
                              {/* Jam */}
                              <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {slot.jam_mulai} - {slot.jam_selesai}
                              </div>

                              {/* Content */}
                              {slot.tipe_slot === "pelajaran" ? (
                                <div>
                                  <div className="font-bold text-gray-900 text-sm leading-tight">
                                    {slot.mapel?.nama || "Mapel tidak ditemukan"}
                                  </div>
                                  {slot.mapel?.kode && (
                                    <div className="text-xs text-gray-500 mt-2 bg-white/50 rounded-lg px-2 py-1 inline-block">
                                      {slot.mapel.kode}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <div className="font-semibold text-gray-700 text-sm">
                                    {slot.keterangan}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-2">
                                    {slot.durasi_menit} menit
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Print Button */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200/50 flex justify-end">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-gray-300 font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Jadwal
              </button>
            </div>
          </div>
        )}

        {/* Print Modal */}
        {showPrintModal && jadwalData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-200/50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-slate-50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Preview Cetak Jadwal</h3>
                  <p className="text-gray-600 mt-1">Pastikan jadwal sudah benar sebelum mencetak</p>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                
                  <JadwalPrintView
                    jadwalData={jadwalData}
                    kelasNama={selectedKelas?.kelas?.nama}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-slate-50 flex justify-end gap-4">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-8 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-gray-300 font-semibold"
                  >
                  Tutup Preview
                </button>
                <button
                  onClick={handleActualPrint}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center gap-2"
                  >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
            body * {
            visibility: hidden;
            }
            .print-view, .print-view * {
                visibility: visible;
                }
                .print-view {
                    position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            }
            }
            `}</style>
    </div>
            </GuruLayout>
  );
};

export default JadwalDashboard;
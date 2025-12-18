import React, { useState, useEffect } from "react";
import jadwalService from "../_services/jadwal";
import Swal from "sweetalert2";

const HARI_OPTIONS = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

const TIPE_SLOT_OPTIONS = [
  { value: "pelajaran", label: "Pelajaran" },
  { value: "istirahat", label: "Istirahat" },
];

const JadwalForm = ({ kelasId, existingJadwal, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [mapelList, setMapelList] = useState([]);
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    semester_id: null,
    tahun_ajaran_id: null,
  });

  // Slots state - organized by hari
  const [slotsByHari, setSlotsByHari] = useState({
    senin: [],
    selasa: [],
    rabu: [],
    kamis: [],
    jumat: [],
    sabtu: [],
  });

  const [activeHari, setActiveHari] = useState("senin");

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load existing jadwal if edit mode
  useEffect(() => {
    if (existingJadwal) {
      loadExistingJadwal();
    }
  }, [existingJadwal]);

  const loadInitialData = async () => {
    try {
      const [mapelRes, tahunRes] = await Promise.all([
        jadwalService.getAllMapel(),
        jadwalService.getTahunAjaranAktif(),
      ]);

      setMapelList(mapelRes.data.mapels || []);
      setTahunAjaranAktif(tahunRes.data.data);

      // Set default semester & tahun ajaran
      if (tahunRes.data.data) {
        setFormData((prev) => ({
          ...prev,
          tahun_ajaran_id: tahunRes.data.data.id,
          semester_id: tahunRes.data.data.semester_aktif?.id || null,
        }));
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal memuat data. Silakan refresh halaman.",
      });
    }
  };

  const loadExistingJadwal = () => {
    setFormData({
      nama: existingJadwal.jadwal.nama || "",
      semester_id: existingJadwal.jadwal.semester.id,
      tahun_ajaran_id: existingJadwal.jadwal.tahun_ajaran.id,
    });

    // Group slots by hari
    const groupedSlots = {
      senin: [],
      selasa: [],
      rabu: [],
      kamis: [],
      jumat: [],
      sabtu: [],
    };

    existingJadwal.all_slots.forEach((slot) => {
      groupedSlots[slot.hari].push({
        id: slot.id,
        jam_mulai: slot.jam_mulai,
        jam_selesai: slot.jam_selesai,
        tipe_slot: slot.tipe_slot,
        mapel_id: slot.mapel_id || "",
        keterangan: slot.keterangan || "",
        urutan: slot.urutan,
      });
    });

    setSlotsByHari(groupedSlots);
  };

  const addSlot = (hari) => {
    const currentSlots = slotsByHari[hari];
    const lastSlot = currentSlots[currentSlots.length - 1];

    const newSlot = {
      id: Date.now(), // temporary ID
      jam_mulai: lastSlot ? lastSlot.jam_selesai : "07:00",
      jam_selesai: "",
      tipe_slot: "pelajaran",
      mapel_id: "",
      keterangan: "",
      urutan: currentSlots.length + 1,
    };

    setSlotsByHari({
      ...slotsByHari,
      [hari]: [...currentSlots, newSlot],
    });
  };

  const updateSlot = (hari, index, field, value) => {
    const updatedSlots = [...slotsByHari[hari]];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [field]: value,
    };

    // Auto-clear mapel_id if changing to istirahat
    if (field === "tipe_slot" && value === "istirahat") {
      updatedSlots[index].mapel_id = "";
    }

    // Auto-clear keterangan if changing to pelajaran
    if (field === "tipe_slot" && value === "pelajaran") {
      updatedSlots[index].keterangan = "";
    }

    setSlotsByHari({
      ...slotsByHari,
      [hari]: updatedSlots,
    });
  };

  const deleteSlot = (hari, index) => {
    const updatedSlots = slotsByHari[hari].filter((_, i) => i !== index);
    // Re-number urutan
    updatedSlots.forEach((slot, i) => {
      slot.urutan = i + 1;
    });

    setSlotsByHari({
      ...slotsByHari,
      [hari]: updatedSlots,
    });
  };

  // use async so we can await the Swal confirmation
  const copyFromOtherDay = async (targetHari, sourceHari) => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: `Copy jadwal dari ${sourceHari} ke ${targetHari}? Jadwal ${targetHari} yang ada akan ditimpa.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, copy",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setSlotsByHari({
        ...slotsByHari,
        [targetHari]: [...slotsByHari[sourceHari]],
      });
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Jadwal ${sourceHari} telah disalin ke ${targetHari}.`,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.semester_id || !formData.tahun_ajaran_id) {
      await Swal.fire({
        icon: "warning",
        title: "Validasi",
        text: "Semester dan Tahun Ajaran harus dipilih!",
      });
      return;
    }

    // Flatten all slots
    const allSlots = [];
    let globalUrutan = 1;

    try {
      for (const hariObj of HARI_OPTIONS) {
        const hari = hariObj.value;
        const slots = slotsByHari[hari] || [];

        for (const slot of slots) {
          // Validate slot
          if (!slot.jam_mulai || !slot.jam_selesai) {
            await Swal.fire({
              icon: "warning",
              title: "Validasi",
              text: `Slot di ${hari} memiliki jam yang tidak lengkap!`,
            });
            return;
          }

          if (slot.tipe_slot === "pelajaran" && !slot.mapel_id) {
            await Swal.fire({
              icon: "warning",
              title: "Validasi",
              text: `Slot pelajaran di ${hari} harus memilih mapel!`,
            });
            return;
          }

          if (slot.tipe_slot === "istirahat" && !slot.keterangan) {
            await Swal.fire({
              icon: "warning",
              title: "Validasi",
              text: `Slot istirahat di ${hari} harus memiliki keterangan!`,
            });
            return;
          }

          allSlots.push({
            hari,
            jam_mulai: slot.jam_mulai,
            jam_selesai: slot.jam_selesai,
            tipe_slot: slot.tipe_slot,
            mapel_id: slot.tipe_slot === "pelajaran" ? slot.mapel_id : null,
            keterangan: slot.tipe_slot === "istirahat" ? slot.keterangan : null,
            urutan: globalUrutan++,
          });
        }
      }

      if (allSlots.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "Validasi",
          text: "Minimal harus ada 1 slot jadwal!",
        });
        return;
      }

      const payload = {
        ...formData,
        slots: allSlots,
      };

      setLoading(true);

      try {
        if (existingJadwal) {
          await jadwalService.updateJadwal(
            kelasId,
            existingJadwal.jadwal.id,
            payload
          );
          await Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Jadwal berhasil diupdate!",
          });
        } else {
          await jadwalService.createJadwal(kelasId, payload);
          await Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Jadwal berhasil dibuat!",
          });
        }

        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Error saving jadwal:", error);
        await Swal.fire({
          icon: "error",
          title: "Gagal",
          text:
            error?.response?.data?.message ||
            "Gagal menyimpan jadwal. Silakan coba lagi.",
        });
      } finally {
        setLoading(false);
      }
    } catch (err) {
      // safety catch for unexpected errors
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  };

  const calculateDuration = (jamMulai, jamSelesai) => {
    if (!jamMulai || !jamSelesai) return 0;

    const [hMulai, mMulai] = jamMulai.split(":").map(Number);
    const [hSelesai, mSelesai] = jamSelesai.split(":").map(Number);

    const totalMulai = hMulai * 60 + mMulai;
    const totalSelesai = hSelesai * 60 + mSelesai;

    return totalSelesai - totalMulai;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6">
        {existingJadwal ? "Edit Jadwal" : "Buat Jadwal Baru"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Header Info */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Jadwal (Optional)
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Jadwal Semester Ganjil 2024/2025"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={tahunAjaranAktif?.nama || "Loading..."}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                value={formData.semester_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    semester_id: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Semester</option>
                {tahunAjaranAktif?.all_semesters?.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.nama.charAt(0).toUpperCase() + sem.nama.slice(1)}
                    {sem.is_active && " (Aktif)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs Hari */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-1 md:space-x-2 overflow-x-auto">
              {HARI_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveHari(value)}
                  className={`
                    py-2 px-3 md:px-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${
                      activeHari === value
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {label}
                  {slotsByHari[value].length > 0 && (
                    <span className="ml-1 md:ml-2 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                      {slotsByHari[value].length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Slots for Active Hari */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            <h3 className="text-base md:text-lg font-semibold">
              Jadwal {activeHari.charAt(0).toUpperCase() + activeHari.slice(1)}
            </h3>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {/* Copy from other day */}
              <select
                onChange={async (e) => {
                  if (e.target.value) {
                    await copyFromOtherDay(activeHari, e.target.value);
                    e.target.value = "";
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Copy dari hari lain...</option>
                {HARI_OPTIONS.filter((h) => h.value !== activeHari).map(
                  ({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={() => addSlot(activeHari)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
              >
                + Tambah Slot
              </button>
            </div>
          </div>

          {slotsByHari[activeHari].length === 0 ? (
            <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">
                Belum ada jadwal untuk hari ini
              </p>
              <button
                type="button"
                onClick={() => addSlot(activeHari)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tambah Slot Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {slotsByHari[activeHari].map((slot, index) => {
                const duration = calculateDuration(
                  slot.jam_mulai,
                  slot.jam_selesai
                );

                return (
                  <div
                    key={slot.id}
                    className="border border-gray-300 rounded-lg p-3 md:p-4 bg-gray-50"
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Urutan */}
                      <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-base">
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-2 md:space-y-3">
                        {/* Jam */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Jam Mulai
                            </label>
                            <input
                              type="time"
                              value={slot.jam_mulai}
                              onChange={(e) =>
                                updateSlot(
                                  activeHari,
                                  index,
                                  "jam_mulai",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Jam Selesai
                            </label>
                            <input
                              type="time"
                              value={slot.jam_selesai}
                              onChange={(e) =>
                                updateSlot(
                                  activeHari,
                                  index,
                                  "jam_selesai",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              required
                            />
                          </div>
                        </div>

                        {duration > 0 && (
                          <p className="text-xs text-gray-500">
                            Durasi: {duration} menit
                          </p>
                        )}

                        {/* Tipe Slot */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tipe
                          </label>
                          <select
                            value={slot.tipe_slot}
                            onChange={(e) =>
                              updateSlot(
                                activeHari,
                                index,
                                "tipe_slot",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {TIPE_SLOT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Conditional: Mapel or Keterangan */}
                        {slot.tipe_slot === "pelajaran" ? (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Mata Pelajaran
                            </label>
                            <select
                              value={slot.mapel_id}
                              onChange={(e) =>
                                updateSlot(
                                  activeHari,
                                  index,
                                  "mapel_id",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              required
                            >
                              <option value="">Pilih Mapel</option>
                              {mapelList.map((mapel) => (
                                <option key={mapel.id} value={mapel.id}>
                                  {mapel.nama}
                                  {mapel.kode && ` (${mapel.kode})`}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Keterangan
                            </label>
                            <input
                              type="text"
                              value={slot.keterangan}
                              onChange={(e) =>
                                updateSlot(
                                  activeHari,
                                  index,
                                  "keterangan",
                                  e.target.value
                                )
                              }
                              placeholder="Contoh: Istirahat, Sholat Dzuhur, Upacara"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              required
                            />
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteSlot(activeHari, index)}
                        className="flex-shrink-0 p-1 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Slot"
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
              disabled={loading}
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {loading
              ? "Menyimpan..."
              : existingJadwal
              ? "Update Jadwal"
              : "Simpan Jadwal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JadwalForm;

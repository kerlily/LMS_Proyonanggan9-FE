// src/pages/siswa/SiswaJadwal.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import SiswaLayout from "../../components/layout/SiswaLayout";
import api from "../../_api";

const HARI_OPTIONS = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

export default function SiswaJadwal() {
  const [loading, setLoading] = useState(true);
  const [jadwalData, setJadwalData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user info from localStorage
      const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;

      if (!user?.kelas_id) {
        setError("Data kelas tidak ditemukan");
        return;
      }

      // Fetch jadwal for this kelas
      const response = await api.get(`/kelas/${user.kelas_id}/jadwal`);
      setJadwalData(response.data);
    } catch (err) {
      console.error("Error fetching jadwal:", err);
      if (err?.response?.status === 404) {
        setError("Jadwal belum tersedia untuk kelas Anda");
      } else {
        setError("Gagal memuat jadwal");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSlotColor = (tipeSlot) => {
    return tipeSlot === "pelajaran"
      ? "bg-purple-50 border-l-4 border-purple-400"
      : "bg-gray-50 border-l-4 border-gray-300";
  };

  if (loading) {
    return (
      <SiswaLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Memuat jadwal...</p>
          </div>
        </div>
      </SiswaLayout>
    );
  }

  if (error) {
    return (
      <SiswaLayout>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <p className="text-sm text-gray-600">
              Hubungi guru atau admin untuk informasi lebih lanjut
            </p>
          </div>
        </div>
      </SiswaLayout>
    );
  }

  if (!jadwalData) {
    return (
      <SiswaLayout>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
          Tidak ada data jadwal
        </div>
      </SiswaLayout>
    );
  }

  return (
    <SiswaLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Jadwal Pelajaran</h2>
              {jadwalData.jadwal?.nama && (
                <p className="text-sm text-gray-600">{jadwalData.jadwal.nama}</p>
              )}
            </div>
          </div>
        </div>

        {/* Jadwal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HARI_OPTIONS.map(({ value, label }) => {
            const slotsForDay = jadwalData.slots_by_hari?.[value] || [];

            return (
              <div key={value} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header Hari */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 text-center">
                  <h3 className="font-bold text-sm">{label}</h3>
                </div>

                {/* Slots */}
                <div className="p-3 space-y-2 min-h-[200px]">
                  {slotsForDay.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada jadwal</p>
                    </div>
                  ) : (
                    slotsForDay.map((slot) => (
                      <div
                        key={slot.id}
                        className={`rounded-lg p-2 ${getSlotColor(slot.tipe_slot)} border`}
                      >
                        {/* Jam */}
                        <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1">
                          <Clock className="w-3 h-3" />
                          {slot.jam_mulai} - {slot.jam_selesai}
                        </div>

                        {/* Content */}
                        {slot.tipe_slot === "pelajaran" ? (
                          <div>
                            <div className="font-bold text-gray-900 text-xs">
                              {slot.mapel?.nama || "Mata Pelajaran"}
                            </div>
                            {slot.mapel?.kode && (
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                ({slot.mapel.kode})
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-gray-700 text-xs">
                              {slot.keterangan}
                            </div>
                            <div className="text-[10px] text-gray-500">
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
    </SiswaLayout>
  );
}
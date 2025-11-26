    // src/components/StrukturNilaiForm.jsx
    import React, { useEffect, useState } from "react";
    import { X, Plus, Trash2, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getAvailableMapels, createStruktur, updateStruktur } from "../_services/nilaiDetail";
import { getMapelsByKelas } from "../_services/kelasMapel";

    export default function StrukturNilaiForm({ open, onClose, kelasId, semesterId, editData }) {
  const [loading, setLoading] = useState(false);
  const [availableMapels, setAvailableMapels] = useState([]);
  const [mapelId, setMapelId] = useState("");
  const [struktur, setStruktur] = useState([
    {
      lm_key: "lm1",
      lm_label: "LM 1",
      kolom: [{ kolom_key: "1.1", kolom_label: "1.1", tipe: "formatif" }]
    }
  ]);
  const [aslimKolom, setAslimKolom] = useState({
    kolom_key: "aslim",
    kolom_label: "ASLIM (UTS)"
  });
  const [asasKolom, setAsasKolom] = useState({
    kolom_key: "asas",
    kolom_label: "ASAS (UAS)"
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        setMapelId(editData.mapel_id);
        const str = editData.struktur || {};
        console.log("📥 Edit data struktur:", str); // Debug

        let converted = [];
        if (str.lingkup_materi && Array.isArray(str.lingkup_materi)) {
          converted = str.lingkup_materi.map((lm) => ({
            lm_key: lm.lm_key,
            lm_label: lm.lm_label,
            kolom: (lm.formatif || []).map((f) => ({
              kolom_key: f.kolom_key,
              kolom_label: f.kolom_label,
              tipe: "formatif"
            }))
          }));
        } else if (Array.isArray(str)) {
          converted = str
            .filter((s) => s.lm_key && s.lm_key.startsWith("lm")) // Hanya LM, jangan filter asas/aslim
            .map((lm) => ({
              lm_key: lm.lm_key,
              lm_label: lm.lm_label,
              kolom: (lm.kolom || [])
                .filter((k) => k.tipe === "formatif")
                .map((k) => ({
                  kolom_key: k.kolom_key,
                  kolom_label: k.kolom_label,
                  tipe: "formatif"
                }))
            }));
        }

        // ✅ Gunakan setter untuk update aslim dan asas
        if (str.aslim) {
          setAslimKolom({
            kolom_key: str.aslim.kolom_key || "aslim",
            kolom_label: str.aslim.kolom_label || "ASLIM (UTS)"
          });
        }
        if (str.asas) {
          setAsasKolom({
            kolom_key: str.asas.kolom_key || "asas",
            kolom_label: str.asas.kolom_label || "ASAS (UAS)"
          });
        }

        console.log("🔄 Converted struktur:", converted);
        setStruktur(converted.length > 0 ? converted : struktur); // Fallback jika kosong
      } else {
        fetchAvailableMapels();
      }
    }
  }, [open, editData]);

  const fetchAvailableMapels = async () => {
    try {
      setLoading(true);
      const res = await getAvailableMapels(kelasId, semesterId);

      let list =
          res?.data?.available_mapels ||
          res?.available_mapels ||
          res?.data ||
          res ||
          [];

      if (list && typeof list === "object" && !Array.isArray(list)) {
          list = Object.values(list);
      }

      setAvailableMapels(Array.isArray(list) ? list : []);
      } catch (err) {
      console.log("fetchAvailableMapels error:", err);
      try {
          const res = await getMapelsByKelas(kelasId);
          let list = res?.data?.mapels || res?.data || [];

          if (list && typeof list === "object" && !Array.isArray(list)) {
          list = Object.values(list);
          }

          setAvailableMapels(Array.isArray(list) ? list : []);
      } catch (err2) {
          Swal.fire("Error", "Gagal memuat daftar mapel", "error");
          console.error("getMapelsByKelas error:", err2);
          setAvailableMapels([]);
      }
      } finally {
      setLoading(false);
      }
  };

  const handleAddLM = () => {
      const newLmNum = struktur.length + 1;
      setStruktur(prev => [
      ...prev,
      {
          lm_key: `lm${newLmNum}`,
          lm_label: `LM ${newLmNum}`,
          kolom: [
          {
              kolom_key: `${newLmNum}.1`,
              kolom_label: `${newLmNum}.1`,
              tipe: "formatif"
          }
          ]
      }
      ]);
  };

  const handleRemoveLM = (index) => {
      if (struktur.length <= 1) {
      return Swal.fire("Perhatian", "Minimal harus ada 1 Lingkup Materi", "warning");
      }
      setStruktur(prev => prev.filter((_, i) => i !== index));
  };

  const handleLMChange = (index, field, value) => {
      setStruktur(prev => prev.map((lm, i) => 
        i === index ? { ...lm, [field]: value } : lm
      ));
  };

  const handleAddFormatif = (lmIndex) => {
      const lmNum = lmIndex + 1;
      const formatifCount = struktur[lmIndex].kolom.filter((k) => k.tipe === "formatif").length;
      const newNum = formatifCount + 1;

      const newKolom = {
        kolom_key: `${lmNum}.${newNum}`,
        kolom_label: `${lmNum}.${newNum}`,
        tipe: "formatif"
      };

      setStruktur(prev => prev.map((lm, i) => 
        i === lmIndex ? { ...lm, kolom: [...lm.kolom, newKolom] } : lm
      ));
  };

    const handleRemoveKolom = (lmIndex, kolomIndex) => {
      const formatifCount = struktur[lmIndex].kolom.filter((k) => k.tipe === "formatif").length;
      if (formatifCount <= 1) {
      return Swal.fire("Perhatian", "Minimal 1 kolom formatif per LM", "warning");
      }

      setStruktur(prev => prev.map((lm, i) => 
        i === lmIndex ? { ...lm, kolom: lm.kolom.filter((_, j) => j !== kolomIndex) } : lm
      ));
  };

  const handleKolomChange = (lmIndex, kolomIndex, field, value) => {
      setStruktur(prev => prev.map((lm, i) => {
        if (i !== lmIndex) return lm;
        return {
          ...lm,
          kolom: lm.kolom.map((k, j) => 
            j === kolomIndex ? { ...k, [field]: value } : k
          )
        };
      }));
  };

    const handleSubmit = async () => {
      if (!mapelId) {
      return Swal.fire("Perhatian", "Pilih mata pelajaran terlebih dahulu", "warning");
      }

      try {
      setLoading(true);

      const payload = {
        mapel_id: mapelId,
        semester_id: semesterId,
        struktur: {
          lingkup_materi: struktur.map(lm => ({
            lm_key: lm.lm_key,
            lm_label: lm.lm_label,
            formatif: lm.kolom.map(k => ({
              kolom_key: k.kolom_key,
              kolom_label: k.kolom_label
            })) // ✅ Map tanpa tipe, sesuai API
          })),
          aslim: aslimKolom,
          asas: asasKolom
        }
      };

      console.log("🚀 Payload to send:", JSON.stringify(payload, null, 2)); // Debug dengan pretty print

      let res;
      if (editData) {
        res = await updateStruktur(kelasId, editData.id, payload);
      } else {
        res = await createStruktur(kelasId, payload);
        console.error("🚀 Create response:", res); // Debug
      }

      Swal.fire("Sukses", editData ? "Struktur berhasil diupdate" : "Struktur berhasil dibuat", "success");
      onClose(true);
      } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("Error", err?.response?.data?.message || "Gagal menyimpan struktur", "error");
      } finally {
      setLoading(false);
      }
  };

    if (!open) return null;

    return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-xl sm:text-2xl font-bold">
            {editData ? "Edit Struktur Nilai" : "Buat Struktur Nilai"}
            </h2>

            <button
            onClick={() => onClose(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            >
            <X className="w-5 h-5" />
            </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {/* Mapel */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Mata Pelajaran *
            </label>

            {editData ? (
                <input
                type="text"
                value={editData.mapel?.nama || ""}
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
                />
            ) : (
                <select
                value={mapelId}
                onChange={(e) => setMapelId(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <option value="">-- Pilih Mapel --</option>
                {availableMapels.map((m) => (
                    <option key={m.id} value={m.id}>
                    {m.nama} ({m.kode})
                    </option>
                ))}
                </select>
            )}
            </div>

            {/* LM LIST */}
            <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Lingkup Materi</h3>
                <button
                onClick={handleAddLM}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                <Plus className="w-4 h-4" />
                Tambah LM
                </button>
            </div>

            <div className="space-y-4">
                {struktur.map((lm, lmIdx) => (
                <div
                    key={lmIdx}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                    {/* LM HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <input
                        type="text"
                        value={lm.lm_key}
                        placeholder="lm1"
                        onChange={(e) => handleLMChange(lmIdx, "lm_key", e.target.value)}
                        className="sm:w-24 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={lm.lm_label}
                        placeholder="LM 1"
                        onChange={(e) => handleLMChange(lmIdx, "lm_label", e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={() => handleRemoveLM(lmIdx)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>

                    {/* KOLOM FORMATIF */}
                    <div className="space-y-2 ml-2 sm:ml-4">
                    {lm.kolom.map((kolom, kolomIdx) => (
                        <div
                        key={kolomIdx}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2 rounded border border-gray-200"
                        >
                        <span className="text-xs text-gray-500 w-20 sm:w-16">
                            Formatif:
                        </span>

                        <input
                            type="text"
                            value={kolom.kolom_key}
                            placeholder="1.1"
                            onChange={(e) =>
                            handleKolomChange(lmIdx, kolomIdx, "kolom_key", e.target.value)
                            }
                            className="w-full sm:w-20 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="text"
                            value={kolom.kolom_label}
                            placeholder="1.1"
                            onChange={(e) =>
                            handleKolomChange(lmIdx, kolomIdx, "kolom_label", e.target.value)
                            }
                            className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            onClick={() => handleRemoveKolom(lmIdx, kolomIdx)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        </div>
                    ))}

                    <button
                        onClick={() => handleAddFormatif(lmIdx)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Formatif
                    </button>
                    </div>
                </div>
                ))}
            </div>

            {/* ASLIM & ASAS SECTION */}
            <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">
                Otomatis ditambahkan:
                </h4>

                {/* ASLIM */}
                <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded border border-gray-200">
                    <span className="text-xs font-medium text-gray-600 w-24 sm:w-20">
                    ASLIM (UTS):
                    </span>

                    <input
                    type="text"
                    value={aslimKolom.kolom_key}
                    disabled
                    className="w-full sm:w-24 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100"
                    />

                    <input
                    type="text"
                    value={aslimKolom.kolom_label}
                    disabled
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100"
                    />
                </div>

                {/* ASAS */}
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded border border-gray-200">
                    <span className="text-xs font-medium text-gray-600 w-24 sm:w-20">
                    ASAS (UAS):
                    </span>

                    <input
                    type="text"
                    value={asasKolom.kolom_key}
                    disabled
                    className="w-full sm:w-24 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100"
                    />

                    <input
                    type="text"
                    value={asasKolom.kolom_label}
                    disabled
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100"
                    />
                </div>
                </div>

                <div className="mt-2 text-xs text-gray-600">
                * ASLIM (UTS) dan ASAS (UAS) otomatis ditambahkan untuk setiap mapel
                </div>
            </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
            <button
            onClick={() => onClose(false)}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium w-full sm:w-auto"
            >
            Batal
            </button>
            <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium w-full sm:w-auto"
            >
            <Save className="w-4 h-4" />
            {loading ? "Menyimpan..." : "Simpan"}
            </button>
        </div>
        </div>
    </div>
    );

    }

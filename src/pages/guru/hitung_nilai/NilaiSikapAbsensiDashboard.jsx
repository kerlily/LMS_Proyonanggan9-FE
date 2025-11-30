// src/pages/guru/nilai_sikap_ketidakhadiran/NilaiSikapAbsensiDashboard.jsx
import React, { useEffect, useState } from "react";
import GuruLayout from "../../../components/layout/GuruLayout";
import { getSiswaByKelas } from "../../../_services/siswa";
import nilaiSikapService from "../../../_services/nilaiSikap";
import ketidakhadiranService from "../../../_services/ketidakhadiran";
import { showByGuru, getSemesterByTahunAjaran } from "../../../_services/waliKelas";
import { RefreshCw, Save, Users, Calendar, BookOpen, AlertCircle, CheckCircle } from "lucide-react";

export default function NilaiSikapAbsensiDashboard() {
  const [waliKelas, setWaliKelas] = useState([]);
  const [kelasId, setKelasId] = useState("");
  const [tahunAjaranId, setTahunAjaranId] = useState(null);
  const [semesterId, setSemesterId] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [siswa, setSiswa] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // data states
  const [sikap, setSikap] = useState({});
  const [originalSikap, setOriginalSikap] = useState({});
  const [deskripsi, setDeskripsi] = useState({});
  const [originalDeskripsi, setOriginalDeskripsi] = useState({});
  const [absensi, setAbsensi] = useState({});
  const [catatan, setCatatan] = useState({});
  const [originalCatatan, setOriginalCatatan] = useState({});

  const [error, setError] = useState(null);

  // load wali kelas
  useEffect(() => {
    const loadWaliKelas = async () => {
      try {
        const res = await showByGuru();
        const payload = res.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.data ?? payload ?? []);
        setWaliKelas(list);
      } catch (err) {
        console.error("Error fetching wali kelas:", err);
        setError("Gagal memuat daftar kelas.");
      }
    };
    loadWaliKelas();
  }, []);

  // when kelasId changes: set tahunAjaranId, fetch semesters & siswa
  useEffect(() => {
    if (!kelasId) {
      setSiswa([]);
      setSemesters([]);
      setSemesterId("");
      setTahunAjaranId(null);
      return;
    }

    const entry = waliKelas.find((w) => String(w.kelas_id) === String(kelasId));
    const taId = entry ? entry.tahun_ajaran_id : null;
    setTahunAjaranId(taId);

    const loadSemesters = async () => {
      if (!taId) {
        setSemesters([]);
        return;
      }
      try {
        const res = await getSemesterByTahunAjaran(taId);
        const payload = res.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.data ?? payload ?? []);
        setSemesters(list);
      } catch (err) {
        console.error("Error fetching semesters:", err);
        setSemesters([]);
      }
    };

    const loadSiswa = async () => {
      try {
        setLoading(true);
        const res = await getSiswaByKelas(kelasId);
        const payload = res.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.data ?? payload ?? []);
        setSiswa(list || []);

        // initialize states
        const sInit = {};
        const aInit = {};
        const descInit = {};
        const catInit = {};
        list.forEach((st) => {
          sInit[st.id] = "";
          descInit[st.id] = "";
          catInit[st.id] = "";
          aInit[st.id] = { ijin: 0, sakit: 0, alpa: 0 };
        });
        setSikap(sInit);
        setOriginalSikap({});
        setDeskripsi(descInit);
        setOriginalDeskripsi({});
        setAbsensi(aInit);
        setCatatan(catInit);
        setOriginalCatatan({});
      } catch (err) {
        console.error("Error fetching siswa:", err);
        setSiswa([]);
      } finally {
        setLoading(false);
      }
    };

    loadSemesters();
    loadSiswa();
    setSemesterId("");
  }, [kelasId, waliKelas]);

  // when semester changes: fetch existing nilai & absensi
  useEffect(() => {
    const fetchExisting = async () => {
      if (!kelasId || !semesterId) return;
      try {
        setLoading(true);

        // nilai sikap existing
        const sikapRes = await nilaiSikapService.getNilaiSikap(kelasId, { semester_id: Number(semesterId) });
        const sikapPayload = sikapRes.data ?? sikapRes;
        const sikapList = Array.isArray(sikapPayload) ? sikapPayload : (sikapPayload?.data ?? sikapPayload ?? []);
        const sikapTemp = {};
        const desTemp = {};
        (sikapList || []).forEach((n) => {
          if (n && (n.siswa_id || n.siswa_id === 0)) {
            sikapTemp[n.siswa_id] = n.nilai ?? "";
            desTemp[n.siswa_id] = n.deskripsi ?? "";
          }
        });
        
        setOriginalSikap(sikapTemp);
        setOriginalDeskripsi(desTemp);
        setSikap((prev) => {
          const merged = { ...prev };
          Object.keys(sikapTemp).forEach((k) => {
            if (!merged[k] || String(merged[k]).trim() === "") {
              merged[k] = sikapTemp[k];
            }
          });
          return merged;
        });
        setDeskripsi((prev) => {
          const merged = { ...prev };
          Object.keys(desTemp).forEach((k) => {
            if (!merged[k] || String(merged[k]).trim() === "") {
              merged[k] = desTemp[k];
            }
          });
          return merged;
        });

        // ketidakhadiran existing
        const hadirRes = await ketidakhadiranService.getKetidakhadiran(kelasId, { semester_id: Number(semesterId) });
        const hadirPayload = hadirRes.data ?? hadirRes;
        const hadirList = Array.isArray(hadirPayload) ? hadirPayload : (hadirPayload?.data ?? hadirPayload ?? []);
        const absTemp = {};
        const catTemp = {};
        (hadirList || []).forEach((h) => {
          if (h && (h.siswa_id || h.siswa_id === 0)) {
            absTemp[h.siswa_id] = {
              ijin: Number(h.ijin ?? 0),
              sakit: Number(h.sakit ?? 0),
              alpa: Number(h.alpa ?? 0),
            };
            catTemp[h.siswa_id] = h.catatan ?? "";
          }
        });
        setAbsensi((prev) => {
          const merged = { ...prev };
          Object.keys(absTemp).forEach((k) => {
            merged[k] = absTemp[k];
          });
          return merged;
        });

        setOriginalCatatan(catTemp);
        setCatatan((prev) => {
          const merged = { ...prev };
          Object.keys(catTemp).forEach((k) => {
            if (!merged[k] || String(merged[k]).trim() === "") {
              merged[k] = catTemp[k];
            }
          });
          return merged;
        });
      } catch (err) {
        console.error("fetchExisting error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelasId, semesterId]);

  // helpers for updates
  const updateSikap = (siswaId, value) => {
    setSikap((p) => ({ ...p, [siswaId]: value }));
  };

  const updateDeskripsi = (siswaId, value) => {
    setDeskripsi((p) => ({ ...p, [siswaId]: value }));
  };

  const updateAbsensi = (siswaId, field, value) => {
    const sanitized = value === "" ? "" : Number(value);
    setAbsensi((p) => ({
      ...p,
      [siswaId]: {
        ...p[siswaId],
        [field]: sanitized,
      },
    }));
  };

  const updateCatatan = (siswaId, value) => {
    setCatatan((p) => ({ ...p, [siswaId]: value }));
  };

  // save handler
  const handleSimpan = async () => {
    if (!kelasId) {
      alert("Pilih kelas terlebih dahulu.");
      return;
    }
    if (!semesterId) {
      alert("Pilih semester terlebih dahulu.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Build sikap payload
      const sikapData = siswa
        .map((s) => {
          const sid = s.id;
          const userVal = sikap[sid];
          const origVal = originalSikap[sid];
          const finalVal = (userVal !== undefined && String(userVal).trim() !== "") ? String(userVal).toUpperCase().trim() : (origVal !== undefined && String(origVal).trim() !== "" ? String(origVal).toUpperCase().trim() : null);

          if (!finalVal) return null;

          const userDesc = deskripsi[sid];
          const origDesc = originalDeskripsi[sid] ?? "";
          const finalDesc = (userDesc !== undefined && userDesc !== null && String(userDesc).trim() !== "") ? String(userDesc).trim() : String(origDesc).trim();

          return {
            siswa_id: Number(sid),
            nilai: finalVal,
            deskripsi: finalDesc || null
          };
        })
        .filter(Boolean);

      // Build absensi payload
      const absensiData = siswa.map((s) => {
        const sid = s.id;
        const a = absensi[sid] || { ijin: 0, sakit: 0, alpa: 0 };

        const userCat = catatan[sid];
        const origCat = originalCatatan[sid];
        const finalCat = (userCat !== undefined && userCat !== null && String(userCat).trim() !== "") ? String(userCat).trim() : (origCat !== undefined && origCat !== null && String(origCat).trim() !== "" ? String(origCat).trim() : null);

        return {
          siswa_id: Number(sid),
          ijin: Number(a.ijin || 0),
          sakit: Number(a.sakit || 0),
          alpa: Number(a.alpa || 0),
          catatan: finalCat || null,
        };
      });

      // Send bulk sikap
      if (sikapData.length > 0) {
        const sikapPayload = {
          semester_id: Number(semesterId),
          data: sikapData,
        };
        await nilaiSikapService.bulkStoreNilaiSikap(kelasId, sikapPayload);
      }

      // Send absensi
      const absensiPayload = {
        semester_id: Number(semesterId),
        data: absensiData,
      };
      await ketidakhadiranService.bulkStoreKetidakhadiran(kelasId, absensiPayload);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Refresh data
      setTimeout(() => {
        setSemesterId((s) => s);
      }, 300);
    } catch (err) {
      console.error("Save error:", err);
      const msg = err?.response?.data?.message || err?.message || "Gagal menyimpan data";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setSemesterId((s) => s);
  };

  const selectedKelas = waliKelas.find(w => String(w.kelas_id) === String(kelasId));
  const selectedSemester = semesters.find(s => String(s.id) === String(semesterId));

  return (
    <GuruLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Nilai Sikap & Ketidakhadiran</h1>
                <p className="text-slate-300 text-sm">
                  Input nilai sikap (A–E), deskripsi, dan catat ketidakhadiran per semester
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-medium text-emerald-800">Berhasil Disimpan!</h3>
                <p className="text-sm text-emerald-700 mt-1">Data nilai sikap dan ketidakhadiran telah berhasil disimpan.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Users className="w-4 h-4 text-indigo-500" />
                Pilih Kelas
              </label>
              <select
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
              >
                <option value="">-- Pilih Kelas --</option>
                {waliKelas.map((wk) => (
                  <option key={wk.id} value={wk.kelas_id}>
                    {wk.kelas?.nama ?? `Kelas ${wk.kelas_id}`} 
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Pilih Semester
              </label>
              <select
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                disabled={!tahunAjaranId || semesters.length === 0}
              >
                <option value="">-- Pilih Semester --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </select>
              <div className="text-xs text-slate-500 mt-2">
                Tahun Ajaran: <span className="font-medium">{selectedKelas?.tahun_ajaran?.nama || "—"}</span>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSimpan}
                disabled={saving || !kelasId || !semesterId}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 disabled:bg-slate-400 text-white rounded-xl hover:bg-indigo-700 font-medium transition-all duration-200 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? "Menyimpan..." : "Simpan Semua"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {selectedKelas && selectedSemester && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-blue-50 text-blue-600 mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-slate-500 mb-2">Total Siswa</div>
                  <div className="text-2xl font-bold text-slate-900">{siswa.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-slate-500 mb-2">Kelas</div>
                  <div className="text-2xl font-bold text-slate-900">{selectedKelas.kelas?.nama || "—"}</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-violet-50 text-violet-600 mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-slate-500 mb-2">Semester</div>
                  <div className="text-2xl font-bold text-slate-900">{selectedSemester.nama}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-slate-700">No</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-700">Nama Siswa</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-700">Nilai Sikap</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-700">Deskripsi Sikap</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-700">Ijin</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-700">Sakit</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-700">Alpa</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-700">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="text-slate-500 font-medium">Memuat data siswa...</span>
                      </div>
                    </td>
                  </tr>
                ) : siswa.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Users className="w-12 h-12 text-slate-300" />
                        <div>
                          <div className="font-semibold">Belum ada data siswa</div>
                          <div className="text-sm">Pilih kelas untuk menampilkan daftar siswa</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  siswa.map((st, idx) => {
                    const sid = st.id;
                    const currentSikap = sikap[sid] ?? "";
                    const currentDesc = deskripsi[sid] ?? "";
                    const currentAbs = absensi[sid] ?? { ijin: 0, sakit: 0, alpa: 0 };
                    const currentCat = catatan[sid] ?? "";

                    return (
                      <tr key={sid} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4 align-top">
                          <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-4  py-4 align-top">
                          <div className="font-semibold text-slate-900">{st.nama}</div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <select
                            value={currentSikap}
                            onChange={(e) => updateSikap(sid, e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="">-- Pilih --</option>
                            <option value="A">A - Sangat Baik</option>
                            <option value="B">B - Baik</option>
                            <option value="C">C - Cukup</option>
                            <option value="D">D - Kurang</option>
                            <option value="E">E - Sangat Kurang</option>
                          </select>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <textarea
                            value={currentDesc}
                            onChange={(e) => updateDeskripsi(sid, e.target.value)}
                            rows={2}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Deskripsi sikap (opsional)"
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <input
                            type="number"
                            min={0}
                            value={currentAbs.ijin ?? ""}
                            onChange={(e) => updateAbsensi(sid, "ijin", e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <input
                            type="number"
                            min={0}
                            value={currentAbs.sakit ?? ""}
                            onChange={(e) => updateAbsensi(sid, "sakit", e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <input
                            type="number"
                            min={0}
                            value={currentAbs.alpa ?? ""}
                            onChange={(e) => updateAbsensi(sid, "alpa", e.target.value)}
                            className="w-20 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <input
                            type="text"
                            value={currentCat}
                            onChange={(e) => updateCatatan(sid, e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            placeholder="Catatan kehadiran (opsional)"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}
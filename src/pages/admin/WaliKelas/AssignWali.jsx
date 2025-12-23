// src/pages/admin/WaliKelas/AssignWali.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  assignWaliKelas,
  getGuruList,
  getKelasList,
  listWaliKelas,
  unassignWali,
} from "../../../_services/admin";
import { useLocation } from "react-router-dom";
import AdminLayout from "../../../components/layout/AdminLayout";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  UserPlus,
  User,
  Trash2,
  RefreshCw,
  Check,
  Search,
  Star,
  UserCheck,
} from "lucide-react";

const MySwal = withReactContent(Swal);

export default function AssignWali() {
  const location = useLocation();
  const fetchingRef = useRef(false);
  const isMounted = useRef(true);

  const [gurus, setGurus] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({ 
    guru_id: "", 
    kelas_id: "",
    is_primary: false 
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [filterNoWali, setFilterNoWali] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const kelas_id = query.get("kelas_id");
    if (kelas_id) {
      setForm((p) => ({ ...p, kelas_id: kelas_id }));
    }
  }, [location.search]);

  async function fetchAll() {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('⚠️ Fetch already in progress, skipping...');
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setErr(null);
    
    try {
      const [gRes, kRes, wRes] = await Promise.allSettled([
        getGuruList({ per_page: 500 }),
        getKelasList(),
        listWaliKelas(),
      ]);

      // Only update state if component is still mounted
      if (!isMounted.current) return;

      const gItems = gRes.status === "fulfilled"
        ? Array.isArray(gRes.value.data)
          ? gRes.value.data
          : gRes.value.data?.data ?? []
        : [];
      setGurus(gItems);

      const kItems = kRes.status === "fulfilled"
        ? Array.isArray(kRes.value.data)
          ? kRes.value.data
          : kRes.value.data?.data ?? []
        : [];
      setKelasList(kItems);

      const wItems = wRes.status === "fulfilled"
        ? Array.isArray(wRes.value.data)
          ? wRes.value.data
          : wRes.value.data?.data ?? []
        : [];

      console.log('✅ Data fetched:', {
        gurus: gItems.length,
        kelas: kItems.length,
        wali: wItems.length
      });

      // Group wali by kelas_id
      const waliByKelas = {};
      wItems.forEach((w) => {
        const kid = Number(w?.kelas?.id ?? w?.kelas_id);
        if (kid) {
          if (!waliByKelas[kid]) waliByKelas[kid] = [];
          waliByKelas[kid].push(w);
        }
      });

      // Sort each kelas's wali: primary first
      Object.keys(waliByKelas).forEach((kid) => {
        waliByKelas[kid].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
      });

      // Use Map to ensure unique kelas
      const kelasMap = new Map();

      // Process all kelas from kItems
      kItems.forEach((k) => {
        const kelasId = Number(k.id);
        if (kelasId && !kelasMap.has(kelasId)) {
          kelasMap.set(kelasId, {
            kelas: {
              id: kelasId,
              nama: k.nama ?? `${k.tingkat ?? ""} ${k.section ?? ""}`.trim(),
              tingkat: k.tingkat,
              section: k.section,
            },
            wali_list: waliByKelas[kelasId] ?? [],
          });
        }
      });

      // Add kelas from wali that might not be in kItems
      wItems.forEach((w) => {
        const kid = Number(w?.kelas?.id ?? w?.kelas_id);
        if (kid && !kelasMap.has(kid)) {
          kelasMap.set(kid, {
            kelas: {
              id: kid,
              nama: w.kelas?.nama ?? `Kls ${kid}`,
              tingkat: w.kelas?.tingkat,
              section: w.kelas?.section,
            },
            wali_list: waliByKelas[kid] ?? [],
          });
        }
      });

      // Convert Map to Array
      const merged = Array.from(kelasMap.values());

      // Sort by tingkat, then section
      merged.sort((a, b) => {
        const ta = a.kelas.tingkat ?? 0;
        const tb = b.kelas.tingkat ?? 0;
        if (ta !== tb) return ta - tb;
        const sa = (a.kelas.section ?? "").localeCompare(b.kelas.section ?? "");
        if (sa !== 0) return sa;
        return (a.kelas.nama ?? "").localeCompare(b.kelas.nama ?? "");
      });

      console.log('✅ Final merged kelas:', merged.length);
      console.log('Kelas IDs:', merged.map(m => `${m.kelas.id}:${m.kelas.nama}`));

      if (isMounted.current) {
        setRows(merged);
      }
    } catch (e) {
      console.error("fetchAll error", e);
      if (isMounted.current) {
        setErr("Gagal memuat data.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }

  // Only fetch once on mount
  useEffect(() => {
    fetchAll();
  }, []); // Empty dependency array

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ 
      ...p, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!form.guru_id || !form.kelas_id) {
      setErr("Pilih guru dan kelas terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      MySwal.fire({
        title: "Menugaskan wali kelas...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => MySwal.showLoading(),
      });

      const payload = {
        guru_id: Number(form.guru_id),
        kelas_id: Number(form.kelas_id),
        is_primary: form.is_primary,
      };

      const res = await assignWaliKelas(payload);

      MySwal.close();
      MySwal.fire({
        icon: "success",
        title: "Berhasil",
        text: res?.data?.message ?? "Wali kelas telah ditugaskan.",
      });

      await fetchAll();
      setForm({ guru_id: "", kelas_id: "", is_primary: false });
      setMsg("Wali kelas berhasil diassign.");
    } catch (error) {
      MySwal.close();
      console.error("assign error", error);
      const message = error?.response?.data?.message || "Gagal assign wali kelas.";
      setErr(message);
      MySwal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (waliRecord) => {
    if (!waliRecord || !waliRecord.id) {
      MySwal.fire({ icon: "error", title: "Data wali tidak valid" });
      return;
    }

    const confirm = await MySwal.fire({
      title: `Unassign wali ${waliRecord.is_primary ? 'utama' : 'tambahan'}?`,
      html: `<b>${waliRecord.guru?.nama ?? "?"}</b> dari ${waliRecord.kelas?.nama ?? ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Unassign",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    MySwal.fire({
      title: "Meng-unassign...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => MySwal.showLoading(),
    });

    try {
      const res = await unassignWali(waliRecord.id);
      MySwal.close();
      MySwal.fire({
        icon: "success",
        title: "Berhasil",
        text: res?.data?.message ?? "Wali berhasil di-unassign.",
      });
      await fetchAll();
    } catch (error) {
      MySwal.close();
      const message = error?.response?.data?.message || "Gagal unassign wali.";
      MySwal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    }
  };

  const visibleRows = rows.filter((r) => {
    if (filterNoWali && r.wali_list.length > 0) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const kelasLabel = (r.kelas.nama ?? "").toLowerCase();
    const waliLabels = r.wali_list.map(w => 
      (w?.guru?.nama ?? w?.guru?.user?.name ?? "").toLowerCase()
    ).join(" ");
    return kelasLabel.includes(q) || waliLabels.includes(q);
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-md">
              <UserPlus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Assign Wali Kelas</h1>
              <p className="text-sm text-gray-500">
                Assign wali kelas utama dan tambahan (guru agama, olahraga, dll)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setForm({ guru_id: "", kelas_id: "", is_primary: false });
              setMsg(null);
              setErr(null);
              setSearch("");
              setFilterNoWali(false);
              fetchAll();
            }}
            className="px-3 py-2 border rounded bg-white hover:bg-gray-50 text-sm flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="col-span-1 bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-md flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-lg font-medium">Form Assign</div>
                <div className="text-xs text-gray-500">Pilih guru dan kelas</div>
              </div>
            </div>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pilih Guru</label>
                <select
                  name="guru_id"
                  value={form.guru_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  disabled={loading || submitting}
                >
                  <option value="">-- Pilih Guru --</option>
                  {gurus.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama ?? g.user?.name ?? `Guru ${g.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pilih Kelas</label>
                <select
                  name="kelas_id"
                  value={form.kelas_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  disabled={loading || submitting}
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama ?? `${k.tingkat ?? ""} ${k.section ?? ""}`.trim()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  name="is_primary"
                  checked={form.is_primary}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600"
                  disabled={loading || submitting}
                />
                <label htmlFor="is_primary" className="text-sm text-gray-700 flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  Jadikan Wali Kelas Utama
                </label>
              </div>

              {err && <div className="text-red-600 text-sm">{err}</div>}
              {msg && <div className="text-green-600 text-sm">{msg}</div>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className={`flex-1 px-4 py-2 rounded text-white flex items-center justify-center gap-2 ${
                    submitting || loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {submitting ? "Memproses..." : "Assign"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm({ guru_id: "", kelas_id: "", is_primary: false });
                    setErr(null);
                    setMsg(null);
                  }}
                  className="px-4 py-2 border rounded"
                  disabled={submitting}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="text-lg font-medium">Daftar Wali Kelas</div>
                <div className="text-xs text-gray-500">
                  <Star className="inline w-3 h-3 text-amber-500" /> = Wali Utama
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Cari kelas atau nama wali..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-3 py-2 border rounded-lg w-full sm:w-64"
                  />
                </div>

                <button
                  onClick={() => setFilterNoWali((v) => !v)}
                  className={`px-3 py-2 rounded-lg border text-sm whitespace-nowrap ${
                    filterNoWali ? "bg-indigo-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {filterNoWali ? "Semua" : "Tanpa Wali"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-600">Memuat...</div>
            ) : visibleRows.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Tidak ada kelas.</div>
            ) : (
              <div className="space-y-4">
                {visibleRows.map((r) => (
                  <div key={r.kelas.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
                          {(r.kelas.nama || "K")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{r.kelas.nama}</div>
                          <div className="text-xs text-gray-500">
                            {r.wali_list.length} wali kelas
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setForm((p) => ({ ...p, kelas_id: String(r.kelas.id) }))}
                        className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-100 flex items-center gap-2 text-sm"
                      >
                        <UserPlus className="w-4 h-4" /> Tambah Wali
                      </button>
                    </div>

                    {r.wali_list.length > 0 ? (
                      <div className="space-y-2 pl-13">
                        {r.wali_list.map((w) => (
                          <div
                            key={w.id}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              {w.is_primary ? (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm">
                                {w.guru?.nama ?? w.guru?.user?.name ?? "?"}
                              </span>
                              {w.is_primary && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                  Utama
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleUnassign(w)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              disabled={submitting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-gray-500 text-sm italic">
                        Belum ada wali kelas
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
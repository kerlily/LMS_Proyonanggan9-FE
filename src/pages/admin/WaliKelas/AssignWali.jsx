// src/pages/admin/WaliKelas/AssignWali.jsx
import React, { useEffect, useState } from "react";
import {
  assignWaliKelas,
  getGuruList,
  getKelasList,
  listWaliKelas,
  unassignWali,
} from "../../../_services/admin";
import {  useLocation } from "react-router-dom"; // Tambah useLocation
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
} from "lucide-react";

const MySwal = withReactContent(Swal);

export default function AssignWali() {
  const location = useLocation(); // Untuk mengambil query params

  // Data List untuk Form Dropdown (dari Kode 1)
  const [gurus, setGurus] = useState([]);
  const [kelasList, setKelasList] = useState([]); // Diubah namanya dari 'kelas' menjadi 'kelasList' untuk menghindari konflik

  const [kelasRaw, setKelasRaw] = useState([]); // raw kelas list from API
  const [waliRaw, setWaliRaw] = useState([]); // raw wali assignments from API
  const [rows, setRows] = useState([]); // merged unique rows { kelas, wali (or null) }

  const [form, setForm] = useState({ guru_id: "", kelas_id: "" });

  const [loading, setLoading] = useState(false); // for whole page refresh actions
  const [submitting, setSubmitting] = useState(false); // for assign button
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [filterNoWali, setFilterNoWali] = useState(false); // Dari Kode 2
  const [search, setSearch] = useState(""); // Dari Kode 2

  // Ambil kelas_id dari URL query jika ada (untuk pre-select form dari Kode 2 handleAssignClick)
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const kelas_id = query.get("kelas_id");
    if (kelas_id) {
      setForm((p) => ({ ...p, kelas_id: kelas_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  async function fetchAll() {
    setLoading(true);
    setErr(null);
    try {
      const [gRes, kRes, wRes] = await Promise.allSettled([
        getGuruList({ per_page: 500 }),
        getKelasList(),
        listWaliKelas(),
      ]);

    
      const gItems =
        gRes.status === "fulfilled"
          ? Array.isArray(gRes.value.data)
            ? gRes.value.data
            : gRes.value.data?.data ?? gRes.value.data ?? []
          : [];
      setGurus(gItems);

      // normalize kelas list (untuk dropdown form)
      const kItems =
        kRes.status === "fulfilled"
          ? Array.isArray(kRes.value.data)
            ? kRes.value.data
            : kRes.value.data?.data ?? kRes.value.data ?? []
          : [];
      setKelasList(kItems); // untuk dropdown

      // normalize wali list (raw)
      const wItems =
        wRes.status === "fulfilled"
          ? Array.isArray(wRes.value.data)
            ? wRes.value.data
            : wRes.value.data?.data ?? wRes.value.data ?? []
          : [];
      setWaliRaw(wItems); // raw wali assignments

      // --- Logika Merge Rows (Diambil dari Kode 2) ---

      // build map of wali by kelas_id (use last assignment if duplicates present)
      const waliMap = new Map();
      (wItems || []).forEach((w) => {
        const kid = w?.kelas?.id ?? w?.kelas_id ?? null;
        if (kid) waliMap.set(Number(kid), w);
      });

      // create unique list of classes (use kItems).
      let classes = kItems;
      if ((!Array.isArray(classes) || classes.length === 0) && Array.isArray(wItems) && wItems.length) {
        classes = wItems
          .map((w) => w.kelas)
          .filter(Boolean)
          .reduce((acc, k) => {
            if (!acc.find((x) => x.id === k.id)) acc.push(k);
            return acc;
          }, []);
      }

      // normalize rows
      const merged = (classes || []).map((k) => ({
        kelas: {
          id: k.id,
          nama: k.nama ?? `${k.tingkat ?? ""} ${k.section ?? ""}`.trim(),
          tingkat: k.tingkat,
          section: k.section,
        },
        wali: waliMap.get(Number(k.id)) ?? null, // may be null
      }));

      // If there are wali assignments for classes not present in kelas list, include them as well
      (wItems || []).forEach((w) => {
        const kid = w?.kelas?.id ?? w?.kelas_id ?? null;
        if (kid && !merged.find((r) => Number(r.kelas.id) === Number(kid))) {
          merged.push({
            kelas: {
              id: kid,
              nama: w.kelas?.nama ?? `Kls ${kid}`,
              tingkat: w.kelas?.tingkat,
              section: w.kelas?.section,
            },
            wali: w,
          });
        }
      });

      // sort by kelas.nama or tingkat/section
      merged.sort((a, b) => {
        // prefer tingkat then section then nama
        const ta = a.kelas.tingkat ?? 0;
        const tb = b.kelas.tingkat ?? 0;
        if (ta !== tb) return ta - tb;
        const sa = (a.kelas.section ?? "").localeCompare(b.kelas.section ?? "");
        if (sa !== 0) return sa;
        return (a.kelas.nama ?? "").localeCompare(b.kelas.nama ?? "");
      });

      setRows(merged);
    } catch (e) {
      console.error("fetchAll error", e);
      setErr("Gagal memuat data. Cek koneksi atau token.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
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
      // show loading modal (do NOT await)
      MySwal.fire({
        title: "Menugaskan wali kelas...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          MySwal.showLoading();
        },
      });

      const payload = {
        guru_id: Number(form.guru_id),
        kelas_id: Number(form.kelas_id),
      };

      const res = await assignWaliKelas(payload);

      // close loading modal
      MySwal.close();

      MySwal.fire({
        icon: "success",
        title: "Berhasil",
        text: res?.data?.message ?? "Wali kelas telah ditugaskan.",
      });

      // refresh lists
      await fetchAll();

      setForm({ guru_id: "", kelas_id: "" });
      setMsg("Wali kelas berhasil diassign.");
    } catch (error) {
      MySwal.close();
      console.error("assign error", error);
      const message = error?.response?.data?.message || error.message || "Gagal assign wali kelas.";
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

  // Unassign diimplementasikan kembali seperti di Kode 1, namun menggunakan struktur data `r.wali` dari Kode 2
  const handleUnassign = async (waliRecord) => {
    if (!waliRecord || !waliRecord.id) {
      MySwal.fire({ icon: "error", title: "Data wali tidak valid" });
      return;
    }

    const confirm = await MySwal.fire({
      title: `Unassign wali untuk ${waliRecord.kelas?.nama ?? "kelas?"}?`,
      html: `<b>${waliRecord.guru ? waliRecord.guru.nama : "Tanpa wali"}</b> — ${waliRecord.kelas?.nama ?? ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Unassign",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    // show loading
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

      // update UI: refresh list
      await fetchAll();
    } catch (error) {
      MySwal.close();
      console.error("unassign error", error);
      const message = error?.response?.data?.message || error.message || "Gagal unassign wali.";
      MySwal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    }
  };

  // Logika Filter dan Search dari Kode 2
  const visibleRows = rows.filter((r) => {
    if (filterNoWali && r.wali) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const kelasLabel = (r.kelas.nama ?? "").toLowerCase();
    const waliLabel =
      (r.wali?.guru?.nama ?? r.wali?.guru?.user?.name ?? r.wali?.guru?.user?.email ?? "").toLowerCase();
    return kelasLabel.includes(q) || waliLabel.includes(q);
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
              <p className="text-sm text-gray-500">Assign atau unassign wali kelas untuk tahun ajaran aktif.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setForm({ guru_id: "", kelas_id: "" });
                setMsg(null);
                setErr(null);
                setSearch("");
                setFilterNoWali(false);
                fetchAll(); // Refresh data
              }}
              className="px-3 py-2 border rounded bg-white hover:bg-gray-50 text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assign Form (Dari Kode 1) */}
          <div className="col-span-1 bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-md flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-lg font-medium">Form Assign</div>
                <div className="text-xs text-gray-500">Pilih guru dan kelas lalu tekan Assign</div>
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
                      {g.nama ?? g.user?.name ?? g.user?.email ?? `Guru ${g.id}`}
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
                    setForm({ guru_id: "", kelas_id: "" });
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

          {/* Wali list (Menggabungkan tampilan Kode 1 dengan logika data dan fitur filter/search Kode 2) */}
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="text-lg font-medium">Daftar Wali Kelas Berdasarkan Kelas</div>
                <div className="text-xs text-gray-500">Menampilkan status wali untuk setiap kelas.</div>
              </div>

              {/* Search dan Filter dari Kode 2 */}
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
                  onClick={() => {
                    setFilterNoWali((v) => !v);
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm whitespace-nowrap ${
                    filterNoWali ? "bg-indigo-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {filterNoWali ? "Dengan Wali" : "Tanpa Wali"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-600">Memuat daftar wali...</div>
            ) : visibleRows.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Tidak ada kelas sesuai filter.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleRows.map((r) => {
                  const wk = r.wali; // wali record
                  const guruNama = wk?.guru?.nama ?? wk?.guru?.user?.name ?? wk?.guru?.user?.email ?? null;
                  return (
                    <div
                      key={r.kelas.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
                          {(r.kelas.nama || "K").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {r.kelas.nama}
                          </div>
                          <div className="text-sm text-gray-600">
                            {wk ? (
                              <span>
                                Wali: <span className="font-medium text-gray-700">{guruNama}</span>
                              </span>
                            ) : (
                              <span className="italic text-gray-500">Belum ada wali</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {wk?.tahunAjaran ? wk.tahunAjaran.nama : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {wk ? (
                          <button
                            onClick={() => handleUnassign(wk)}
                            className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-md hover:bg-red-100 flex items-center gap-2 text-sm"
                            disabled={submitting}
                          >
                            <Trash2 className="w-4 h-4" /> Unassign
                          </button>
                        ) : (
                          <button
                            onClick={() => setForm((p) => ({ ...p, kelas_id: String(r.kelas.id) }))}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm"
                            disabled={submitting}
                          >
                            <UserPlus className="w-4 h-4" /> Assign
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
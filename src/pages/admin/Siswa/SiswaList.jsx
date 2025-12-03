// src/pages/admin/Siswa/SiswaList.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { listSiswa, deleteSiswa, getKelasList } from "../../../_services/admin";
import AdminLayout from "../../../components/layout/AdminLayout";

function SmallPagination({ meta, onPage }) {
  if (!meta) return null;
  const { current_page = 1, last_page = 1 } = meta;

  const pages = [];
  const start = Math.max(1, current_page - 2);
  const end = Math.min(last_page, current_page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        disabled={current_page <= 1}
        onClick={() => onPage(current_page - 1)}
        className="px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Prev</span>
      </button>

      {start > 1 && (
        <>
          <button 
            onClick={() => onPage(1)} 
            className="px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            1
          </button>
          {start > 2 && <span className="px-2 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`px-3 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-colors ${
            p === current_page 
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
              : "border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}

      {end < last_page && (
        <>
          {end < last_page - 1 && <span className="px-2 text-gray-400">…</span>}
          <button 
            onClick={() => onPage(last_page)} 
            className="px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {last_page}
          </button>
        </>
      )}

      <button
        disabled={current_page >= last_page}
        onClick={() => onPage(current_page + 1)}
        className="px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function SiswaList() {
  const [siswa, setSiswa] = useState([]);
  const [meta, setMeta] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [q] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [sort] = useState("nama:asc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  // fetch list with given params
  const fetchList = async ({ page: pageArg = 1, q: qArg = q, kelasId: kelasArg = kelasId, sort: sortArg = sort } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageArg,
        q: qArg || undefined,
        kelas_id: kelasArg || undefined,
        sort: sortArg || undefined,
      };

      const res = await listSiswa(params);
      const payload = res.data ?? {};
      const items = Array.isArray(payload.data) ? payload.data : payload.data ?? [];
      const metaObj = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        per_page: payload.per_page ?? items.length,
        total: payload.total ?? items.length,
        from: payload.from ?? ((pageArg - 1) * (payload.per_page ?? items.length) + 1),
        to: payload.to ?? null,
      };

      setSiswa(items);
      setMeta(metaObj);
      setPage(metaObj.current_page || pageArg);
    } catch (err) {
      console.error("listSiswa error:", err);
      setError(err?.response?.data?.message || "Gagal memuat data siswa.");
    } finally {
      setLoading(false);
    }
  };

  // initial load + kelas list
  useEffect(() => {
    getKelasList()
      .then((r) => {
        const payload = r.data ?? [];
        const items = Array.isArray(payload) ? payload : payload.data ?? [];
        setKelasList(items);
      })
      .catch((e) => {
        console.warn("getKelasList failed, will derive kelas from data", e);
        setKelasList([]);
      });

    fetchList({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // derive kelas list from first page if empty
  useEffect(() => {
    if (kelasList.length === 0 && siswa.length > 0) {
      const uniq = {};
      siswa.forEach((s) => {
        // prefer relation 'kelas' then fallback to kelas_id
        if (s.kelas && s.kelas.id) uniq[s.kelas.id] = s.kelas;
        else if (s.kelas_id) uniq[s.kelas_id] = { id: s.kelas_id, nama: s.kelas?.nama ?? `Kelas ${s.kelas_id}` };
      });
      const arr = Object.values(uniq);
      if (arr.length) setKelasList(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siswa]);

  // debounce search/filter/sort changes -> reset to page 1
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchList({ page: 1, q, kelasId, sort });
    }, 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, kelasId, sort]);

  const handlePage = (p) => {
    fetchList({ page: p, q, kelasId, sort });
  };

  // Use SweetAlert2 for delete confirmation
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus siswa?",
      text: "Data siswa dan nilai akan dihapus permanen. Lanjutkan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteSiswa(id);
      Swal.fire({ 
        icon: "success", 
        title: "Terhapus", 
        timer: 1200, 
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      // refetch list after delete
      fetchList({ page });
    } catch (err) {
      console.error("deleteSiswa err:", err);
      Swal.fire({ 
        icon: "error", 
        title: "Gagal", 
        text: err?.response?.data?.message || "Gagal menghapus siswa.",
        confirmButtonColor: "#3b82f6"
      });
    }
  };

  // helpers for display
  const getKelasNama = (item) => {
    // Prefer explicit kelas relation
    if (item.kelas && item.kelas.nama) return item.kelas.nama;
    // If provided in different key (kelas_saat_ini)
    if (item.kelas_saat_ini && item.kelas_saat_ini.nama) return item.kelas_saat_ini.nama;
    // Fallback: riwayat_kelas first entry (some endpoints include riwayat_kelas)
    const rk = item.riwayat_kelas ?? item.riwayatKelas ?? null;
    if (Array.isArray(rk) && rk.length) {
      const first = rk[0];
      if (first?.kelas?.nama) return first.kelas.nama;
    }
    // last-resort: kelas_id value
    if (item.kelas_id) return `Kelas ${item.kelas_id}`;
    return "-";
  };

  // new: compute last riwayat label robustly
  const getLastRiwayatLabel = (item) => {
    // check both naming variants
    const rkArr = item.riwayat_kelas ?? item.riwayatKelas ?? null;
    if (Array.isArray(rkArr) && rkArr.length > 0) {
      // backend usually sorts desc so first is latest; otherwise pick first
      const last = rkArr[0];
      const kelasNama = last?.kelas?.nama ?? last?.kelas?.nama ?? null;
      const taNama = last?.tahun_ajaran?.nama ?? last?.tahun_ajaran_id ?? null;
      const t = taNama ? `${taNama}` : null;
      if (kelasNama && t) return `${kelasNama} (${t})`;
      if (kelasNama) return `${kelasNama}`;
      if (t) return `TA: ${t}`;
    }

    // fallback: if item.kelas exists -> show current kelas
    if (item.kelas && item.kelas.nama) {
      // optionally include tingkat/section
      const sek = item.kelas.section ? ` ${item.kelas.section}` : "";
      return `${item.kelas.nama}${sek}`;
    }

    // fallback: kelas_saat_ini
    if (item.kelas_saat_ini && item.kelas_saat_ini.nama) {
      return `${item.kelas_saat_ini.nama}`;
    }

    return "-";
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                  Daftar Siswa
                </h1>
                <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
                  Kelola data siswa dan riwayat kelas
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => fetchList({ page: 1, q: "", kelasId: "", sort })}
                  className="px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-gray-300 font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </button>
                <Link 
                  to="/admin/siswa/create" 
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Siswa
                </Link>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 mb-6 border border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter Kelas
                </label>
                <select 
                  value={kelasId} 
                  onChange={(e) => setKelasId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="">Semua Kelas</option>
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama ?? `${k.tingkat ?? ""} ${k.section ?? ""}`.trim()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end sm:col-span-2 lg:col-span-3">
                <button 
                  onClick={() => fetchList({ page: 1, q, kelasId, sort })}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl overflow-hidden border border-white/20">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <tr>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        No
                      </div>
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      Nama Siswa
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      Tahun Lahir
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      Kelas
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50 hidden md:table-cell">
                      Riwayat Kelas
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 md:px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                          <p className="text-gray-600 text-base font-medium">Memuat data siswa...</p>
                        </div>
                      </td>
                    </tr>
                  ) : siswa.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 md:px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2A9 9 0 008.5 3M21 21v-1a6 6 0 00-6-6h-2" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada siswa</h3>
                          <p className="text-gray-600 text-sm max-w-md mx-auto">
                            {kelasId ? "Tidak ada siswa di kelas yang dipilih." : "Belum ada data siswa."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    siswa.map((s, idx) => {
                      const no = (meta?.from ?? ((page - 1) * (meta?.per_page ?? 15) + 1)) + idx;
                      const riwayatLabel = getLastRiwayatLabel(s);

                      return (
                        <tr key={s.id ?? idx} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="py-4 px-4 md:px-6">
                            <div className="font-medium text-gray-900 text-sm md:text-base">{no}</div>
                          </td>
                          <td className="py-4 px-4 md:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {s.nama?.charAt(0).toUpperCase() || "S"}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm md:text-base">{s.nama}</div>
                                {s.nis && (
                                  <div className="text-xs text-gray-500 mt-0.5">NIS: {s.nis}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 md:px-6">
                            <div className="text-gray-700 text-sm md:text-base">
                              {s.tahun_lahir ? (
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                                  {s.tahun_lahir}
                                </span>
                              ) : (
                                "-"
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 md:px-6">
                            <div className="text-gray-700 text-sm md:text-base font-medium">
                              {getKelasNama(s)}
                            </div>
                          </td>
                          <td className="py-4 px-4 md:px-6 hidden md:table-cell">
                            <div className="text-gray-600 text-sm">
                              {riwayatLabel}
                            </div>
                          </td>
                          <td className="py-4 px-4 md:px-6">
                            <div className="flex items-center gap-2">
                              <Link 
                                to={`/admin/siswa/${s.id}`}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                                title="Lihat Detail"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                              <button 
                                onClick={() => navigate(`/admin/siswa/edit/${s.id}`)}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
                                title="Edit Siswa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(s.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                title="Hapus Siswa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination and Info */}
            <div className="px-4 md:px-6 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-slate-50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-900">{meta?.from || 1}</span> -{" "}
                  <span className="font-semibold text-gray-900">{meta?.to || siswa.length}</span> dari{" "}
                  <span className="font-semibold text-gray-900">{meta?.total || siswa.length}</span> siswa
                </div>
                
                <SmallPagination meta={meta ?? { current_page: page, last_page: 1 }} onPage={handlePage} />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
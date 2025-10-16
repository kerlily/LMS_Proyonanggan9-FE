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
    <div className="flex items-center gap-2">
      <button
        disabled={current_page <= 1}
        onClick={() => onPage(current_page - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPage(1)} className="px-3 py-1 border rounded">1</button>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`px-3 py-1 rounded ${p === current_page ? "bg-blue-600 text-white" : "border"}`}
        >
          {p}
        </button>
      ))}

      {end < last_page && (
        <>
          {end < last_page - 1 && <span className="px-2">…</span>}
          <button onClick={() => onPage(last_page)} className="px-3 py-1 border rounded">{last_page}</button>
        </>
      )}

      <button
        disabled={current_page >= last_page}
        onClick={() => onPage(current_page + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
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
    });
    if (!result.isConfirmed) return;

    try {
      await deleteSiswa(id);
      Swal.fire({ icon: "success", title: "Terhapus", timer: 1200, showConfirmButton: false });
      // refetch list after delete
      fetchList({ page });
    } catch (err) {
      console.error("deleteSiswa err:", err);
      Swal.fire({ icon: "error", title: "Gagal", text: err?.response?.data?.message || "Gagal menghapus siswa." });
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Daftar Siswa</h2>
          <div className="flex gap-2">
            <Link to="/admin/siswa/create" className="px-3 py-2 bg-blue-600 text-white rounded">Tambah Siswa</Link>
            <button onClick={() => fetchList({ page: 1, q: "", kelasId: "", sort })} className="px-3 py-2 border rounded">Reset</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="px-3 py-2 border rounded">
              <option value="">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama ?? `${k.tingkat ?? ""} ${k.section ?? ""}`.trim()}
                </option>
              ))}
            </select>

            <div className="flex items-center">
              <button onClick={() => fetchList({ page: 1, q, kelasId, sort })} className="px-3 py-2 border rounded">Refresh</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-3 text-left w-12">No</th>
                <th className="py-3 px-3 text-left">Nama</th>
                <th className="py-3 px-3 text-left">Tahun Lahir</th>
                <th className="py-3 px-3 text-left">Kelas</th>
                <th className="py-3 px-3 text-left">Riwayat Kelas (terakhir)</th>
                <th className="py-3 px-3 text-left w-56">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center">Memuat...</td></tr>
              ) : siswa.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">Tidak ada siswa</td></tr>
              ) : (
                siswa.map((s, idx) => {
                  const no = (meta?.from ?? ((page - 1) * (meta?.per_page ?? 15) + 1)) + idx;
                  // last riwayat label
                  const riwayatLabel = getLastRiwayatLabel(s);

                  return (
                    <tr key={s.id ?? idx} className="border-b">
                      <td className="py-3 px-3">{no}</td>
                      <td className="py-3 px-3">{s.nama}</td>
                      <td className="py-3 px-3">{s.tahun_lahir ?? "-"}</td>
                      <td className="py-3 px-3">{getKelasNama(s)}</td>
                      <td className="py-3 px-3">{riwayatLabel}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <Link to={`/admin/siswa/${s.id}`} className="px-2 py-1 border rounded text-sm">View</Link>
                          <button onClick={() => navigate(`/admin/siswa/edit/${s.id}`)} className="px-2 py-1 border rounded text-sm">Edit</button>
                          <button onClick={() => handleDelete(s.id)} className="px-2 py-1 border rounded text-sm text-red-600">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Total: {meta?.total ?? siswa.length}</div>
          <SmallPagination meta={meta ?? { current_page: page, last_page: 1 }} onPage={handlePage} />
        </div>

        {error && <div className="mt-3 text-red-600">{error}</div>}
      </div>
    </AdminLayout>
  );
}

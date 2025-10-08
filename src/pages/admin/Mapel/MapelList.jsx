// src/pages/admin/Mapel/MapelList.jsx
import React, { useEffect, useState } from "react";
import {
  listMapel,
  createMapel,
  updateMapel,
  deleteMapel,
  getMapelAll,
} from "../../../_services/mapel";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/**
 * Admin Mapel management page
 * - Top: Add Mapel form
 * - Middle: Search + table with pagination
 * - Actions: Edit (popup), Delete (confirm)
 */

export default function MapelList() {
  const [mapels, setMapels] = useState([]);
  const [meta, setMeta] = useState(null); // pagination object from Laravel
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  // add form
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchMapels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  const fetchMapels = async (opts = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        search: search || undefined,
        ...opts,
      };
      const res = await listMapel(params);
      // Laravel pagination returns object: data, current_page, last_page, etc.
      setMapels(res.data?.data ?? res.data ?? []);
setMeta({
  current_page: res.data?.current_page ?? 1,
  last_page: res.data?.last_page ?? 1,
  per_page: res.data?.per_page ?? perPage,
  total: res.data?.total ?? (Array.isArray(res.data?.data) ? res.data.data.length : 0),
});
    } catch (e) {
      console.error("Gagal ambil mapel", e);
      Swal.fire("Error", e?.response?.data?.message || "Gagal memuat daftar mapel", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    setPage(1);
    await fetchMapels({ page: 1 });
  };

  const handleAdd = async (e) => {
    e?.preventDefault();
    if (!nama || nama.trim() === "") {
      return Swal.fire("Input kosong", "Nama mapel wajib diisi", "warning");
    }
    setAdding(true);
    try {
      const payload = { nama: nama.trim(), kode: kode ? kode.trim() : null };
      const res = await createMapel(payload);
      Swal.fire("Berhasil", res?.data?.message ?? "Mapel dibuat", "success");
      setNama("");
      setKode("");
      // reload first page to show new mapel
      setPage(1);
      await fetchMapels({ page: 1 });
    } catch (e) {
      console.error("Gagal tambah mapel", e);
      const msg = e?.response?.data?.message ||
        (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : "Gagal membuat mapel");
      Swal.fire("Error", msg, "error");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (m) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Mapel",
      html:
        `<input id="swal-nama" class="swal2-input" placeholder="Nama" value="${escapeHtml(m.nama)}">` +
        `<input id="swal-kode" class="swal2-input" placeholder="Kode" value="${escapeHtml(m.kode ?? "")}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      preConfirm: () => {
        const newNama = document.getElementById("swal-nama")?.value ?? "";
        const newKode = document.getElementById("swal-kode")?.value ?? "";
        if (!newNama || newNama.trim() === "") {
          Swal.showValidationMessage("Nama mapel wajib diisi");
          return false;
        }
        return { nama: newNama.trim(), kode: newKode.trim() || null };
      },
    });

    if (!formValues) return; // cancelled

    try {
      const res = await updateMapel(m.id, formValues);
      Swal.fire("Sukses", res?.data?.message ?? "Mapel diupdate", "success");
      // refresh current page
      await fetchMapels();
    } catch (e) {
      console.error("Gagal update mapel", e);
      const msg = e?.response?.data?.message ||
        (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : "Gagal update");
      Swal.fire("Error", msg, "error");
    }
  };

  const handleDelete = async (m) => {
    const result = await Swal.fire({
      title: `Hapus Mapel "${m.nama}"?`,
      text: "Tindakan ini tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMapel(m.id);
      Swal.fire("Terhapus", "Mapel berhasil dihapus", "success");
      // If last item on page and not first page, go back a page
      if (mapels.length === 1 && page > 1) {
        setPage(page - 1);
        await fetchMapels({ page: page - 1 });
      } else {
        await fetchMapels();
      }
    } catch (e) {
      console.error("Gagal hapus mapel", e);
      const msg = e?.response?.data?.message || "Gagal hapus mapel";
      Swal.fire("Error", msg, "error");
    }
  };

  // small helper to show badges for kode or dash
  const badge = (text) => (
    <span className="inline-block px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-700">
      {text || "-"}
    </span>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manajemen Mata Pelajaran</h1>
      </div>

      {/* Add form */}
      <div className="bg-white p-4 rounded shadow">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end" onSubmit={handleAdd}>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium">Nama Mata Pelajaran</label>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Contoh: Matematika"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Kode (opsional)</label>
            <input
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="MTK"
            />
          </div>

          <div className="md:col-span-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setNama(""); setKode(""); }}
              className="px-3 py-2 border rounded"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {adding ? "Menambah..." : "Tambah Mapel"}
            </button>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            placeholder="Cari nama atau kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Cari</button>
          <button
            type="button"
            onClick={() => { setSearch(""); setPage(1); fetchMapels({ page: 1 }); }}
            className="px-3 py-2 border rounded"
          >
            Reset
          </button>
        </form>

        <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border px-2 py-2 rounded">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="py-3 px-4 w-16">No</th>
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4 w-32">Kode</th>
              <th className="py-3 px-4 w-56 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center">Memuat...</td></tr>
            ) : mapels.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Belum ada mapel.</td></tr>
            ) : (
              mapels.map((m, idx) => (
                <tr key={m.id} className="border-t">
                  <td className="py-3 px-4 align-top">{(meta?.current_page - 1) * meta?.per_page + idx + 1}</td>
                  <td className="py-3 px-4 align-top">{m.nama}</td>
                  <td className="py-3 px-4 align-top">{badge(m.kode)}</td>
                  <td className="py-3 px-4 align-top text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => handleEdit(m)} className="px-3 py-1 border rounded text-sm">Edit</button>
                      <button onClick={() => handleDelete(m)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between text-sm text-gray-700">
          <div>Menampilkan halaman {meta.current_page} dari {meta.last_page} — total {meta.total} mapel</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (page > 1) { setPage(page - 1); fetchMapels({ page: page - 1 }); } }}
              disabled={page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-60"
            >
              Prev
            </button>
            <div className="px-2">Halaman</div>
            <input
              type="number"
              value={page}
              min={1}
              max={meta.last_page}
              onChange={(e) => {
                const v = Number(e.target.value) || 1;
                if (v >= 1 && v <= meta.last_page) {
                  setPage(v);
                  fetchMapels({ page: v });
                }
              }}
              className="w-16 border px-2 py-1 rounded text-center"
            />
            <button
              onClick={() => { if (page < meta.last_page) { setPage(page + 1); fetchMapels({ page: page + 1 }); } }}
              disabled={page >= meta.last_page}
              className="px-3 py-1 border rounded disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** small helper to escape values injected into sweetalert html value attributes */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

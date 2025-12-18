// src/pages/admin/Mapel/MapelList.jsx
import React, { useEffect, useState } from "react";
import {
  listMapel,
  createMapel,
  updateMapel,
  deleteMapel,
} from "../../../_services/mapel";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import AdminLayout from "../../../components/layout/AdminLayout";
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  Hash,
  BookOpen,
  Check,
  X
} from "lucide-react";

export default function MapelList() {
  const [mapels, setMapels] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  // add form
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [adding, setAdding] = useState(false);

  // edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMapel, setEditingMapel] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editKode, setEditKode] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const openEditModal = (mapel) => {
    setEditingMapel(mapel);
    setEditNama(mapel.nama);
    setEditKode(mapel.kode || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingMapel(null);
    setEditNama("");
    setEditKode("");
    setUpdating(false);
  };

  const handleEditSubmit = async () => {
    if (!editNama || editNama.trim() === "") {
      Swal.fire("Peringatan", "Nama mapel wajib diisi", "warning");
      return;
    }

    setUpdating(true);
    try {
      const payload = { 
        nama: editNama.trim(), 
        kode: editKode ? editKode.trim() : null 
      };
      const res = await updateMapel(editingMapel.id, payload);
      
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: res?.data?.message ?? "Mapel berhasil diperbarui",
        showConfirmButton: false,
        timer: 1500
      });
      
      closeEditModal();
      await fetchMapels();
    } catch (e) {
      console.error("Gagal update mapel", e);
      const msg = e?.response?.data?.message ||
        (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : "Gagal update");
      Swal.fire("Error", msg, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (m) => {
    const result = await Swal.fire({
      title: `Hapus Mapel "${m.nama}"?`,
      text: "Tindakan ini tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMapel(m.id);
      Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: "Mapel berhasil dihapus",
        showConfirmButton: false,
        timer: 1500
      });
      
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

  const badge = (text) => (
    <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
      {text || "-"}
    </span>
  );

  const handleResetSearch = () => {
    setSearch("");
    setPage(1);
    fetchMapels({ page: 1 });
  };

  const handleResetAddForm = () => {
    setNama("");
    setKode("");
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Mata Pelajaran</h1>
            <p className="text-gray-600 mt-1">Kelola data mata pelajaran di sekolah</p>
          </div>
        </div>

        {/* Add form */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={20} />
            Tambah Mata Pelajaran Baru
          </h2>
          
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full border border-gray-300 px-10 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Contoh: Matematika"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode <span className="text-gray-500">(opsional)</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    className="w-full border border-gray-300 px-10 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="MTK"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleResetAddForm}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCw size={18} />
                Reset
              </button>
              <button
                type="submit"
                disabled={adding}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition ${
                  adding ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menambah...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Tambah Mapel
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md border">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  placeholder="Cari nama atau kode mata pelajaran..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </form>
            
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Search size={18} />
                Cari
              </button>
              
              <button
                onClick={handleResetSearch}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCw size={18} />
                Reset
              </button>
              
              <select 
                value={perPage} 
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} 
                className="border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 per halaman</option>
                <option value={20}>20 per halaman</option>
                <option value={50}>50 per halaman</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">No</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Nama Mata Pelajaran</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Kode</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : mapels.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <BookOpen size={48} className="text-gray-300 mb-2" />
                        <p className="text-lg">Belum ada mata pelajaran</p>
                        <p className="text-sm mt-1">Mulai dengan menambahkan mata pelajaran baru di atas</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mapels.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 align-middle">
                        <div className="text-gray-600 font-medium">
                          {(meta?.current_page - 1) * meta?.per_page + idx + 1}
                        </div>
                      </td>
                      <td className="py-3 px-6 align-middle">
                        <div className="font-medium text-gray-800">{m.nama}</div>
                      </td>
                      <td className="py-3 px-6 align-middle">
                        {badge(m.kode)}
                      </td>
                      <td className="py-3 px-6 align-middle">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-md border">
            <div className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{(meta.current_page - 1) * meta.per_page + 1}</span> - 
              <span className="font-semibold"> {Math.min(meta.current_page * meta.per_page, meta.total)} </span> 
              dari <span className="font-semibold">{meta.total}</span> mata pelajaran
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (page > 1) { setPage(page - 1); fetchMapels({ page: page - 1 }); } }}
                disabled={page <= 1}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ArrowLeft size={16} />
                Sebelumnya
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Halaman</span>
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
                  className="w-16 border border-gray-300 px-2 py-1.5 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-600">dari {meta.last_page}</span>
              </div>
              
              <button
                onClick={() => { if (page < meta.last_page) { setPage(page + 1); fetchMapels({ page: page + 1 }); } }}
                disabled={page >= meta.last_page}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Selanjutnya
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
       {/* Edit Modal - TRANSPARANT VERSION */}
{showEditModal && (
  <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
    {/* Background dengan transparansi ringan */}
    <div 
      className="absolute inset-0 bg-gray-200 bg-opacity-30"
      onClick={closeEditModal}
    />
    
    {/* Modal Container */}
    <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-300 w-full max-w-lg animate-fadeIn">
      {/* Modal Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Edit2 className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Edit Mata Pelajaran</h3>
              <p className="text-sm text-gray-500">ID: {editingMapel?.id}</p>
            </div>
          </div>
          <button
            onClick={closeEditModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Modal Body dengan Current Data Display */}
      <div className="p-6 space-y-6">
        {/* Current Data Display - Style lebih ringan */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700">Data Saat Ini</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-500 font-medium">Nama</div>
              <div className="font-medium text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">
                {editingMapel?.nama}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500 font-medium">Kode</div>
              <div className="font-medium text-gray-900">
                {editingMapel?.kode ? (
                  <span className="inline-block px-3 py-2 bg-white border border-indigo-200 text-indigo-700 rounded">
                    {editingMapel.kode}
                  </span>
                ) : (
                  <span className="text-gray-400 italic px-3 py-2 bg-white border border-gray-200 rounded block">
                    Tidak ada kode
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700">Data Baru</h4>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={editNama}
                onChange={(e) => setEditNama(e.target.value)}
                className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                placeholder="Contoh: Matematika"
                autoFocus
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode <span className="text-gray-500 text-sm">(opsional)</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={editKode}
                onChange={(e) => setEditKode(e.target.value)}
                className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                placeholder="MTK"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Kosongkan jika ingin menghapus kode</p>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
        <button
          onClick={closeEditModal}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition font-medium"
        >
          Batal
        </button>
        <button
          onClick={handleEditSubmit}
          disabled={updating}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition ${
            updating ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm"
          }`}
        >
          {updating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Memperbarui...
            </>
          ) : (
            <>
              <Check size={18} />
              Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </AdminLayout>
  );
}
// src/pages/admin/TahunAjaran/Index.jsx
import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  listTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  changeAcademicYear,
  toggleSemester,
} from "../../../_services/tahunAjaran";
import { listSiswa } from "../../../_services/admin";
import TahunAjaranForm from "./TahunAjaranForm";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Edit3,
  Trash2,
  Play,
  CheckCircle,
  RefreshCw,
  ToggleRight,
  Search,
  X,
  Check,
  Calendar,
} from "lucide-react";

const MySwal = withReactContent(Swal);

export default function TahunAjaranIndex() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Change Year states
  const [changeOpen, setChangeOpen] = useState(false);
  const [name, setName] = useState("");
  const [copyWali, setCopyWali] = useState(true);

  // Students for repeat selection
  const [students, setStudents] = useState([]);
  const [selectedRepeatIds, setSelectedRepeatIds] = useState(new Set());
  const [searchStudent, setSearchStudent] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Preview states
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // prevent double execute
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await listTahunAjaran();
      const arr = res?.data?.data ?? res?.data ?? [];
      setData(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.error(e);
      MySwal.fire({
        icon: "error",
        title: "Gagal memuat tahun ajaran",
        text: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoading(false);
    }
  }

  // Fetch students for repeat selection
  const fetchStudents = async (query = "") => {
    setLoadingStudents(true);
    try {
      // listSiswa expects params: { per_page, q or search? } - your service used 'q' earlier;
      // your previous listSiswa usage used params object maybe { per_page:200, search: query }
      // keep using the same shape as earlier:
      const res = await listSiswa({ per_page: 200, search: query });
      const items = res?.data?.data ?? [];
      const normalized = items.map((s) => ({
        id: s.id,
        nama: s.nama,
        kelas: s.kelas?.nama ?? (s.riwayat_kelas && s.riwayat_kelas[0]?.kelas?.nama) ?? `Kls ${s.kelas_id ?? "-"}`,
      }));
      setStudents(normalized);
    } catch (e) {
      console.error("fetch students", e);
      MySwal.fire({
        icon: "error",
        title: "Gagal memuat siswa",
        text: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  // Toggle student for repeat
  const toggleRepeat = (id) => {
    setSelectedRepeatIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  // Handle create tahun ajaran
  const handleCreate = async (payload) => {
    try {
      await createTahunAjaran({
        nama: payload.nama,
        is_active: Number(payload.is_active),
      });
      MySwal.fire({
        icon: "success",
        title: "Tahun ajaran dibuat",
      });
      fetchList();
      setFormOpen(false);
    } catch (e) {
      console.error(e);
      MySwal.fire({
        icon: "error",
        title: "Gagal membuat tahun ajaran",
        text: e?.response?.data?.message || e.message,
      });
    }
  };

  // Handle update tahun ajaran
  const handleUpdate = async (payload) => {
    try {
      await updateTahunAjaran(editItem.id, {
        nama: payload.nama,
        is_active: Number(payload.is_active),
      });
      MySwal.fire({
        icon: "success",
        title: "Tahun ajaran diupdate",
      });
      fetchList();
      setFormOpen(false);
    } catch (e) {
      console.error(e);
      MySwal.fire({
        icon: "error",
        title: "Gagal mengupdate tahun ajaran",
        text: e?.response?.data?.message || e.message,
      });
    }
  };

  // Handle delete tahun ajaran
  const handleDelete = async (item) => {
    const result = await MySwal.fire({
      title: `Hapus ${item.nama}?`,
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (result.isConfirmed) {
      try {
        await deleteTahunAjaran(item.id);
        MySwal.fire({
          icon: "success",
          title: "Terhapus",
        });
        fetchList();
      } catch (e) {
        console.error(e);
        MySwal.fire({
          icon: "error",
          title: "Gagal menghapus",
          text: e?.response?.data?.message || e.message,
        });
      }
    }
  };

  // Preview change year
  const doPreview = async () => {
    if (!name || name.trim().length === 0) {
      MySwal.fire({
        icon: "warning",
        title: "Isi nama tahun ajaran terlebih dahulu",
      });
      return;
    }
    setPreviewLoading(true);
    try {
      const payload = {
        name,
        copy_wali: !!copyWali,
        repeat_student_ids: Array.from(selectedRepeatIds),
        dry_run: true,
      };
      const res = await changeAcademicYear(payload);
      setPreview(res?.data ?? null);
    } catch (e) {
      console.error(e);
      MySwal.fire({
        icon: "error",
        title: "Error saat preview",
        text: e?.response?.data?.message || e.message,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Execute change year
  const doExecute = async () => {
    if (!name || name.trim().length === 0) {
      MySwal.fire({
        icon: "warning",
        title: "Isi nama tahun ajaran terlebih dahulu",
      });
      return;
    }
    const confirm = await MySwal.fire({
      title: "Yakin ingin mengganti tahun ajaran?",
      html: `Nama: <b>${name}</b><br/>Copy wali kelas: <b>${copyWali ? "Ya" : "Tidak"}</b><br/>Jumlah siswa yang tidak naik: <b>${selectedRepeatIds.size}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, jalankan",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    // show loading modal (do NOT await it)
    MySwal.fire({
      title: "Menjalankan perubahan...",
      allowOutsideClick: false,
      didOpen: () => MySwal.showLoading(),
    });

    setExecuting(true);
    try {
      const payload = {
        name,
        copy_wali: !!copyWali,
        repeat_student_ids: Array.from(selectedRepeatIds),
        dry_run: false,
      };
      const res = await changeAcademicYear(payload);
      MySwal.close();
      MySwal.fire({
        icon: "success",
        title: "Sukses",
        text: res?.data?.message ?? "Tahun ajaran berhasil diubah",
      });
      // refresh list properly
      const r = await listTahunAjaran();
      const arr = r?.data?.data ?? r?.data ?? [];
      setData(Array.isArray(arr) ? arr : []);
      setPreview(null);
      setSelectedRepeatIds(new Set());
      setChangeOpen(false);
      setName("");
      setSearchStudent("");
      setStudents([]);
    } catch (e) {
      MySwal.close();
      console.error(e);
      MySwal.fire({
        icon: "error",
        title: "Error saat eksekusi",
        text: e?.response?.data?.message || e.message,
      });
    } finally {
      setExecuting(false);
      // ensure modal closed
      MySwal.close();
    }
  };

  // Toggle semester active
  const handleToggleSemester = async (semesterId) => {
    try {
      MySwal.fire({
        title: "Memproses...",
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading(),
      });
      const res = await toggleSemester(semesterId);
      MySwal.close();
      MySwal.fire({
        icon: "success",
        title: res?.data?.message ?? "Berhasil",
      });

      setData((prev) => {
        const copy = JSON.parse(JSON.stringify(prev || []));
        const updatedSem = res?.data?.data ?? null;
        if (!updatedSem) return copy;

        const tid = updatedSem.tahun_ajaran?.id;
        const yi = copy.findIndex((y) => y.id === tid);
        if (yi >= 0) {
          const semIdx = copy[yi].semesters.findIndex((s) => s.id === updatedSem.id);
          if (semIdx >= 0) {
            copy[yi].semesters[semIdx] = updatedSem;
          } else {
            copy[yi].semesters = copy[yi].semesters || [];
            copy[yi].semesters.push(updatedSem);
          }
        } else {
          for (let y = 0; y < copy.length; y++) {
            const si = copy[y].semesters.findIndex((s) => s.id === updatedSem.id);
            if (si >= 0) {
              copy[y].semesters[si] = updatedSem;
              break;
            }
          }
        }
        return copy;
      });
    } catch (e) {
      MySwal.close();
      console.error(e);
      MySwal.fire({
        icon: "error",
        title: "Gagal toggle semester",
        text: e?.response?.data?.message || e.message,
      });
    }
  };

  // Open edit form
  const openEdit = (it) => {
    setEditItem(it);
    setFormOpen(true);
  };

  // Filter students based on search
  const filteredStudents = students.filter((s) =>
    s.nama.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.kelas.toLowerCase().includes(searchStudent.toLowerCase())
  );

  // Preview list from response
  const promotePreviewList = useMemo(() => {
    return preview?.details?.promote_list_preview ?? preview?.promote_list_preview ?? preview?.promote_list ?? [];
  }, [preview]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tahun Ajaran</h1>
              <p className="text-sm text-gray-500">
                Kelola tahun ajaran, toggle semester aktif & gunakan Change Year untuk pergantian tahun
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            <button
              onClick={() => {
                const next = !changeOpen;
                setChangeOpen(next);
                if (next) {
                  fetchStudents();
                } else {
                  setPreview(null);
                  setSelectedRepeatIds(new Set());
                  setName("");
                }
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" /> Change Year
            </button>
          </div>
        </div>

        {/* --- CHANGE PANEL (moved here so it appears at top) --- */}
        {changeOpen && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Change Academic Year</h2>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 mr-4">{selectedRepeatIds.size} siswa tidak naik</div>
                <button
                  onClick={() => setChangeOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tahun Ajaran (target)
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="contoh: 2028/2029"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyWali}
                    onChange={(e) => setCopyWali(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Copy wali kelas</span>
                </label>
              </div>
            </div>

            {/* Students selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Pilih siswa yang *tidak* naik</h3>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-indigo-600">{selectedRepeatIds.size}</span> dipilih
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Cari nama siswa atau kelas..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full border border-gray-300 pl-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => fetchStudents(searchStudent)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cari
                </button>
                <button
                  onClick={() => {
                    setSelectedRepeatIds(new Set());
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Bersihkan
                </button>
              </div>

              <div className="max-h-64 overflow-auto border border-gray-200 rounded-lg bg-gray-50">
                {loadingStudents ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="text-sm text-gray-600">Memuat daftar siswa...</div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="text-sm text-gray-500">
                      {students.length === 0 ? "Belum ada siswa" : "Tidak ada hasil pencarian"}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredStudents.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-3 p-3 hover:bg-white cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRepeatIds.has(s.id)}
                          onChange={() => toggleRepeat(s.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{s.nama}</div>
                          <div className="text-xs text-gray-500">{s.kelas}</div>
                        </div>
                        {selectedRepeatIds.has(s.id) && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Preview (Dry Run)</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {previewLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-600">Memuat preview...</div>
                  </div>
                ) : !preview ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Klik "Preview (Dry run)" untuk melihat ringkasan perubahan
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-3 border border-gray-300 bg-white rounded-lg">
                        <div className="text-xs text-gray-600 font-medium">Promoted</div>
                        <div className="text-2xl font-bold text-green-600">
                          {preview?.summary?.promoted ?? preview?.summary?.promote_list_count ?? "-"}
                        </div>
                      </div>
                      <div className="p-3 border border-gray-300 bg-white rounded-lg">
                        <div className="text-xs text-gray-600 font-medium">Graduated</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {preview?.summary?.graduated ?? "-"}
                        </div>
                      </div>
                      <div className="p-3 border border-gray-300 bg-white rounded-lg">
                        <div className="text-xs text-gray-600 font-medium">Repeated</div>
                        <div className="text-2xl font-bold text-amber-600">
                          {(preview?.summary?.repeated ?? 0) + selectedRepeatIds.size}
                        </div>
                      </div>
                    </div>

                    {promotePreviewList.length > 0 && (
                      <div>
                        <div className="font-medium text-sm text-gray-900 mb-2">
                          Daftar Kandidat Promosi:
                        </div>
                        <div className="space-y-2">
                          {promotePreviewList.slice(0, 5).map((s) => (
                            <div
                              key={s.siswa_id}
                              className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-sm"
                            >
                              <div>
                                <div className="font-medium text-gray-900">{s.nama}</div>
                                <div className="text-xs text-gray-500">
                                  {s.from_kelas?.nama ?? "-"}
                                  {s.to_kelas ? ` → ${s.to_kelas.nama}` : " • graduate"}
                                </div>
                              </div>
                            </div>
                          ))}
                          {promotePreviewList.length > 5 && (
                            <div className="text-xs text-gray-500 text-center py-2">
                              +{promotePreviewList.length - 5} siswa lainnya
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-600">
                      {preview?.message ?? "Dry run complete — tidak ada perubahan disimpan."}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={doPreview}
                disabled={previewLoading || executing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <Play className="w-4 h-4" /> Preview (Dry run)
              </button>
              <button
                onClick={() => {
                  setSelectedRepeatIds(new Set());
                  setPreview(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
              <button
                onClick={doExecute}
                disabled={executing}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" /> Execute Change
              </button>
            </div>
          </div>
        )}

        {/* Years Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="p-6 bg-white rounded-lg shadow text-center col-span-full">
              Memuat tahun ajaran...
            </div>
          ) : data.length === 0 ? (
            <div className="p-6 bg-white rounded-lg shadow text-center col-span-full text-gray-500">
              Belum ada tahun ajaran
            </div>
          ) : (
            data.map((ta) => (
              <div
                key={ta.id}
                className={`bg-white rounded-lg shadow-sm border p-6 transition-all ${
                  ta.is_active
                    ? "border-amber-300 bg-amber-50 shadow-md"
                    : "border-gray-100 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">{ta.nama}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      ID: <span className="text-gray-500">{ta.id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {ta.is_active && (
                      <div className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        Aktif
                      </div>
                    )}
                  </div>
                </div>

                {/* Semesters */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">Semester:</div>
                  {Array.isArray(ta.semesters) && ta.semesters.length > 0 ? (
                    <div className="space-y-2">
                      {ta.semesters.map((s) => (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            s.is_active
                              ? "border-green-300 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{s.nama}</div>
                            <div className="text-xs text-gray-500">
                              Status:{" "}
                              <span
                                className={s.is_active ? "text-green-600 font-semibold" : "text-gray-600"}
                              >
                                {s.is_active ? "Aktif" : "Non-aktif"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleSemester(s.id)}
                            className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1 ${
                              s.is_active
                                ? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200"
                                : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <ToggleRight className="w-4 h-4" />
                            {s.is_active ? "Aktif" : "Non-aktif"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Tidak ada semester</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openEdit(ta)}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ta)}
                    className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Modal */}
        <TahunAjaranForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          initial={editItem}
          submitFn={async (payload) => {
            if (editItem) {
              await handleUpdate(payload);
            } else {
              await handleCreate(payload);
            }
          }}
          onSaved={() => {
            // handled in submitFn
          }}
        />
      </div>
    </AdminLayout>
  );
}

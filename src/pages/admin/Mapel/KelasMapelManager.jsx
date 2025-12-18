// src/pages/admin/Mapel/KelasMapelManager.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import {
  getKelasList,
} from "../../../_services/kelas"; // optional - if you have separate service for kelas
import {
  getAllMapels,
  getAvailableMapelsForKelas,
  attachMapelToKelas,
  detachMapelFromKelas,
  assignMapelsToKelas,
  copyMapelsFromKelas,
} from "../../../_services/kelasMapel";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function KelasMapelManager() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState(null);

  const [assigned, setAssigned] = useState([]); // assigned mapels
  const [available, setAvailable] = useState([]); // available mapels

  const [loading, setLoading] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);

  const [selectedAvailableIds, setSelectedAvailableIds] = useState(new Set());
  const [copySourceKelas, setCopySourceKelas] = useState("");

  // fetch kelas list (optional)
 useEffect(() => {
  (async () => {
    try {
      const res = await getKelasList();
      // our service returns { data: [...] } for compatibility
      const kelasData = res?.data ?? res?.data?.data ?? [];
      setKelasList(kelasData);
      if (!selectedKelas && kelasData.length > 0) {
        setSelectedKelas(kelasData[0].id);
      }
    } catch (e) {
      console.warn("Tidak bisa ambil list kelas via statistik. Cek permission/token atau endpoint /kelas.", e);
      // jangan crash UI — biarkan user pilih kelas manual nanti
    }
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  // fetch assigned + available when selectedKelas changes
  useEffect(() => {
    if (!selectedKelas) return;
    fetchForKelas(selectedKelas);
  }, [selectedKelas]);

 async function fetchForKelas(kelasId) {
  setLoading(true);
  setSelectedAvailableIds(new Set());
  try {
    // 1. ambil available (admin endpoint)
    const avRes = await getAvailableMapelsForKelas(kelasId);
    if (!avRes) {
      Swal.fire("Info", "Tidak bisa mengambil available mapel (permission/404).", "info");
      setAssigned([]);
      setAvailable([]);
      return;
    }
    const availList = avRes.data?.available_mapels ?? avRes.data?.mapels ?? avRes.data?.data ?? avRes.data ?? [];

    // 2. ambil all mapels lalu compute assigned = all - available
    const allRes = await getAllMapels();
    const allList = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data ?? allRes.data?.mapels ?? allRes.data ?? []);
    const availIds = new Set((availList || []).map((m) => Number(m.id)));
    const assignedList = (allList || []).filter((m) => !availIds.has(Number(m.id)));

    setAvailable(Array.isArray(availList) ? availList : []);
    setAssigned(Array.isArray(assignedList) ? assignedList : []);
  } catch (e) {
    console.error("fetchForKelas error:", e);
    const msg = e?.response?.data?.message || e?.message || "Gagal memuat mapel untuk kelas";
    Swal.fire("Error", msg, "error");
    setAssigned([]);
    setAvailable([]);
  } finally {
    setLoading(false);
  }
}



  // toggle checkbox for available mapel
  const toggleSelectAvailable = (id) => {
    setSelectedAvailableIds((prev) => {
      const s = new Set(Array.from(prev));
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  // attach selected mapels (multiple) -> use attach endpoint for each (or use assign if you want replace)
  const handleAttachSelected = async () => {
    if (!selectedKelas) return Swal.fire("Pilih kelas", "Silakan pilih kelas terlebih dahulu", "warning");
    if (selectedAvailableIds.size === 0) return Swal.fire("Pilih mapel", "Pilih minimal 1 mapel untuk ditambahkan", "warning");

    const toAttach = Array.from(selectedAvailableIds);
    const proceed = await Swal.fire({
      title: `Tambah ${toAttach.length} mapel ke kelas?`,
      text: "Akan menambahkan mapel tanpa menghapus yang sudah ada.",
      icon: "question",
      showCancelButton: true,
    });
    if (!proceed.isConfirmed) return;

    try {
      setLoadingAssign(true);
      // attach one by one
      for (const mapelId of toAttach) {
        // endpoint attach returns success or 422
        await attachMapelToKelas(selectedKelas, mapelId);
      }
      Swal.fire("Sukses", `Berhasil menambahkan ${toAttach.length} mapel`, "success");
      await fetchForKelas(selectedKelas);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e?.response?.data?.message || "Gagal menambahkan mapel", "error");
    } finally {
      setLoadingAssign(false);
    }
  };

  // detach single
  const handleDetach = async (mapelId, mapelNama) => {
    const conf = await Swal.fire({
      title: `Hapus mapel "${mapelNama}" dari kelas?`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!conf.isConfirmed) return;
    try {
      await detachMapelFromKelas(selectedKelas, mapelId);
      Swal.fire("Sukses", `Mapel ${mapelNama} dihapus dari kelas`, "success");
      await fetchForKelas(selectedKelas);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e?.response?.data?.message || "Gagal hapus mapel dari kelas", "error");
    }
  };

  // assign (replace all) with selected available ids (or a set user chooses)
  const handleAssignReplace = async () => {
    if (!selectedKelas) return Swal.fire("Pilih kelas", "Silakan pilih kelas terlebih dahulu", "warning");
    // choose which mapels to set: if user selected any available -> use those; else ask to confirm clearing
    const chosen = Array.from(selectedAvailableIds);
    const proceed = await Swal.fire({
      title: chosen.length ? `Replace mapel kelas dengan ${chosen.length} mapel?` : "Kosongkan semua mapel kelas?",
      text: chosen.length ? "Akan mengganti semua mapel kelas dengan pilihan ini." : "Akan menghapus semua mapel yang terassign pada kelas ini.",
      icon: "warning",
      showCancelButton: true,
    });
    if (!proceed.isConfirmed) return;

    try {
      setLoadingAssign(true);
      await assignMapelsToKelas(selectedKelas, chosen);
      Swal.fire("Sukses", "Assignment kelas berhasil diperbarui", "success");
      await fetchForKelas(selectedKelas);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e?.response?.data?.message || "Gagal assign mapel", "error");
    } finally {
      setLoadingAssign(false);
    }
  };

  // copy from other kelas
  const handleCopyFrom = async () => {
    if (!selectedKelas) return Swal.fire("Pilih kelas", "Pilih target kelas terlebih dahulu", "warning");
    if (!copySourceKelas) return Swal.fire("Pilih sumber", "Pilih kelas sumber untuk copy dari daftar", "warning");
    const conf = await Swal.fire({
      title: `Copy mapel dari kelas ID ${copySourceKelas} ke kelas ID ${selectedKelas}?`,
      text: "Akan mengganti semua mapel di kelas target dengan mapel dari kelas sumber.",
      icon: "question",
      showCancelButton: true,
    });
    if (!conf.isConfirmed) return;
    try {
      await copyMapelsFromKelas(selectedKelas, copySourceKelas);
      Swal.fire("Sukses", "Berhasil copy mapel dari kelas sumber", "success");
      await fetchForKelas(selectedKelas);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e?.response?.data?.message || "Gagal copy mapel", "error");
    }
  };

  return (
    <AdminLayout>
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Atur Mapel per Kelas</h1>
      </div>

      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium">Pilih Kelas</label>
          <select
            value={selectedKelas ?? ""}
            onChange={(e) => setSelectedKelas(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama} {k.tingkat ? `- K${k.tingkat}` : ""} {k.section ? `(${k.section})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium">Copy From (kelas)</label>
          <select className="w-full border px-3 py-2 rounded" value={copySourceKelas} onChange={(e) => setCopySourceKelas(e.target.value)}>
            <option value="">-- Pilih sumber kelas --</option>
            {kelasList.filter(k => k.id !== selectedKelas).map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
          <button onClick={handleCopyFrom} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded w-full">Copy Mapel dari Kelas</button>
        </div>
      </div>

      {/* Main lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available */}
        <div className="bg-white rounded shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Available Mapel</h2>
            <div className="text-sm text-gray-500">{available.length} tersedia</div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-6">Memuat...</div>
            ) : available.length === 0 ? (
              <div className="text-sm text-gray-500">Tidak ada mapel tersedia.</div>
            ) : (
              available.map((m) => (
                <div key={m.id} className="flex items-center justify-between border p-2 rounded">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAvailableIds.has(m.id)}
                      onChange={() => toggleSelectAvailable(m.id)}
                    />
                    <div>
                      <div className="font-medium">{m.nama}</div>
                      <div className="text-xs text-gray-500">{m.kode}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        // attach single
                        try {
                          await attachMapelToKelas(selectedKelas, m.id);
                          Swal.fire("Sukses", `${m.nama} ditambahkan`, "success");
                          await fetchForKelas(selectedKelas);
                        } catch (e) {
                          Swal.fire("Error", e?.response?.data?.message || "Gagal tambah mapel", "error");
                        }
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={handleAttachSelected} className="px-3 py-2 bg-green-600 text-white rounded" disabled={selectedAvailableIds.size===0 || loadingAssign}>
              {loadingAssign ? "Memproses..." : `Tambah yang dipilih (${selectedAvailableIds.size})`}
            </button>

            <button onClick={handleAssignReplace} className="px-3 py-2 border rounded" disabled={loadingAssign}>
              {loadingAssign ? "Memproses..." : "Assign (ganti semua dengan pilihan)"}
            </button>
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-white rounded shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Assigned Mapel</h2>
            <div className="text-sm text-gray-500">{assigned.length} assigned</div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-6">Memuat...</div>
            ) : assigned.length === 0 ? (
              <div className="text-sm text-gray-500">Belum ada mapel di kelas ini.</div>
            ) : (
              assigned.map((m) => (
                <div key={m.id} className="flex items-center justify-between border p-2 rounded">
                  <div>
                    <div className="font-medium">{m.nama}</div>
                    <div className="text-xs text-gray-500">{m.kode} {m.assigned_at ? `• ${new Date(m.assigned_at).toLocaleDateString()}` : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDetach(m.id, m.nama)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}

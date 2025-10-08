// src/pages/admin/Guru/GuruList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getGuruList, getKelasList, listWaliKelas, deleteGuru } from "../../../_services/admin";
import TahunAjaran from "../../../components/TahunAjaran";
import ConfirmModal from "../../../components/ConfirmModal";
import api from "../../../_api";
import AdminLayout from "../../../components/layout/AdminLayout";

/**
 * GuruList (updated)
 * - shows bubble list
 * - header buttons: /guru/create and /guru/wali-kelas/assign
 * - per-item: Edit, Reset pw (link to edit), Delete (confirm)
 * - shows list of kelas where guru is wali (under name)
 */

function Avatar({ guru, size = 56 }) {
  const getAvatarUrl = () => {
    // check common fields
    const candidates = [
      guru.photo, guru.foto, guru.photo_url, guru.foto_url,
      guru.avatar, guru.user?.photo, guru.user?.avatar
    ];
    const first = candidates.find((c) => c && String(c).length > 0);

    if (!first) return null;

    const s = String(first);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;

    // If relative path (no protocol) — try common storage location:
    // if API base is http://127.0.0.1:8000/api -> prefix with /storage
    // derive base origin from api.defaults.baseURL if available
    try {
      const base = (api && api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : "";
      // base maybe "http://127.0.0.1:8000/api" -> strip trailing "/api"
      const origin = base.replace(/\/api\/?$/, "");
      // if path already starts with "/storage" or "/"
      if (s.startsWith("/")) return origin + s;
      // else assume stored in storage folder
      return `${origin}/storage/${s}`;
    } catch (e) {
      // fallback: return as-is
      console.error(e);
      return s;
    }
  };

  const url = getAvatarUrl();
  if (url) {
    return (
      <img
        src={url}
        alt={guru.nama ?? guru.name ?? "Guru"}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={(e) => {
          // hide broken image (so initials show)
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  const name = guru.nama ?? guru.name ?? guru.email ?? "G";
  const initials = name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold"
         style={{ width: size, height: size }}>
      {initials}
    </div>
  );
}

export default function GuruList() {
  const [gurus, setGurus] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [waliMap, setWaliMap] = useState({}); // guruId => [kelas objects]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [gRes, kRes, wRes] = await Promise.allSettled([
          getGuruList(),
          getKelasList(),
          listWaliKelas()
        ]);

        // gurus
        let gItems = [];
        if (gRes.status === "fulfilled") {
          const payload = gRes.value?.data ?? [];
          // payload could be {data: [...]} (paginated) or array
          gItems = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : (payload.data ?? []));
        }

        // kelas
        let kItems = [];
        if (kRes.status === "fulfilled") {
          const kp = kRes.value?.data ?? [];
          kItems = Array.isArray(kp) ? kp : (kp.data ?? []);
        }

        // wali assignments
        let wali = [];
        if (wRes.status === "fulfilled") {
          const wp = wRes.value?.data ?? [];
          // could be array or paginated; normalize to array
          wali = Array.isArray(wp) ? wp : (wp.data ?? wp);
          // each item likely contains guru_id, kelas_id and kelas object
        }

        if (!mounted) return;
        setGurus(gItems);
        setKelas(kItems);

        // build map: guruId -> array of kelas objects or names
        const map = {};
        (wali || []).forEach((w) => {
          const gid = w.guru_id ?? w.user_id ?? null;
          const kelasObj = w.kelas ?? (kItems.find(k => String(k.id) === String(w.kelas_id)) ?? { id: w.kelas_id, nama: String(w.kelas_id) });
          if (!gid) return;
          if (!map[gid]) map[gid] = [];
          map[gid].push(kelasObj);
        });
        setWaliMap(map);
      } catch (e) {
        console.error(e);
        setErr("Gagal memuat data guru/kelas.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const handleDeleteConfirm = (guru) => {
    setToDelete(guru);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      // try delete endpoint if available (implement deleteGuru in services). If not available: show error
      if (typeof deleteGuru === "function") {
        await deleteGuru(toDelete.id);
      } else {
        // fallback: attempt DELETE /admin/guru/{id}
        await api.delete(`/admin/guru/${toDelete.id}`);
      }
      // remove from state
      setGurus(prev => prev.filter(g => String(g.id) !== String(toDelete.id)));
      setWaliMap(prev => {
        const copy = {...prev};
        delete copy[toDelete.id];
        return copy;
      });
      setErr(null);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Gagal menghapus guru.");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  return (
    <AdminLayout>
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daftar Guru</h1>
          <p className="text-sm text-gray-600">Kelola guru dan penugasan wali kelas.</p>
        </div>

        <div className="flex items-center gap-3">
          <TahunAjaran />
          <Link to="/admin/guru/create" className="px-3 py-2 bg-blue-600 text-white rounded">Create Guru</Link>
          <Link to="/admin/guru/wali-kelas/assign" className="px-3 py-2 bg-indigo-600 text-white rounded">Assign Wali</Link>
        </div>
      </div>

      {err && <div className="bg-red-50 text-red-700 px-4 py-2 rounded">{err}</div>}

      <div className="space-y-3">
        {loading ? (
          <div className="p-6 text-center">Memuat guru...</div>
        ) : gurus.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Belum ada guru.</div>
        ) : (
          gurus.map((g) => (
            <div key={g.id} className="flex items-center justify-between bg-white rounded shadow-sm p-4">
              <div className="flex items-center gap-4">
                <div style={{ width: 56, height: 56 }}>
                  <Avatar guru={g} size={56} />
                </div>

                <div>
                  <div className="font-semibold">{g.nama ?? g.name ?? g.user?.name ?? "-"}</div>
                  <div className="text-sm text-gray-500">{g.email ?? g.user?.email ?? "-"}</div>

                  {/* list kelas where this guru is wali */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(waliMap[g.id] || []).length === 0 ? (
                      <div className="text-xs text-gray-400">Belum menjadi wali kelas</div>
                    ) : (
                      (waliMap[g.id] || []).map((k) => (
                        <div key={k.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{k.nama}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/admin/guru/edit/${g.id}`} className="px-3 py-2 border rounded text-sm">Edit</Link>
                <Link to={`/admin/guru/edit/${g.id}?reset=true`} className="px-3 py-2 border rounded text-sm">Reset Password</Link>
                <button onClick={() => handleDeleteConfirm(g)} className="px-3 py-2 bg-red-600 text-white rounded text-sm">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Hapus Guru"
        message={`Apakah Anda yakin ingin menghapus guru "${toDelete?.nama ?? toDelete?.name ?? ""}"? Tindakan ini tidak bisa dibatalkan.`}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={doDelete}
      />
    </div>
    </AdminLayout>
  );
}

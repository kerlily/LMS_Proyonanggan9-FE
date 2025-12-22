import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGuruList, getKelasList, listWaliKelas } from "../../../_services/admin";
import TahunAjaran from "../../../components/TahunAjaran";
import api from "../../../_api";
import AdminLayout from "../../../components/layout/AdminLayout";

/* =======================
   AVATAR COMPONENT
======================= */
function Avatar({ guru, size = 56 }) {
  const getAvatarUrl = () => {
    const candidates = [
      guru.photo,
      guru.foto,
      guru.photo_url,
      guru.foto_url,
      guru.avatar,
      guru.user?.photo,
      guru.user?.avatar,
    ];
    const first = candidates.find((c) => c && String(c).length > 0);
    if (!first) return null;

    const s = String(first);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;

    try {
      const base = api?.defaults?.baseURL ?? "";
      const origin = base.replace(/\/api\/?$/, "");
      if (s.startsWith("/")) return origin + s;
      return `${origin}/storage/${s}`;
    } catch {
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
        onError={(e) => (e.currentTarget.style.display = "none")}
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
    <div
      className="flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

/* =======================
   FETCH ALL GURU (ALL PAGE)
======================= */
async function fetchAllGuru() {
  let page = 1;
  let lastPage = 1;
  let all = [];

  do {
    const res = await getGuruList({ page });
    const payload = res?.data;

    if (payload?.data && Array.isArray(payload.data)) {
      all = all.concat(payload.data);
      lastPage = payload.last_page ?? 1;
    } else {
      break;
    }

    page++;
  } while (page <= lastPage);

  return all;
}

/* =======================
   MAIN COMPONENT
======================= */
export default function GuruList() {
  const [gurus, setGurus] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [waliMap, setWaliMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const [gRes, kRes, wRes] = await Promise.allSettled([
          fetchAllGuru(),
          getKelasList(),
          listWaliKelas(),
        ]);

        /* ===== GURU ===== */
        let guruItems = [];
        if (gRes.status === "fulfilled") {
          guruItems = Array.isArray(gRes.value) ? gRes.value : [];
        }

        /* ===== KELAS ===== */
        let kelasItems = [];
        if (kRes.status === "fulfilled") {
          const kp = kRes.value?.data ?? [];
          kelasItems = Array.isArray(kp) ? kp : kp.data ?? [];
        }

        /* ===== WALI KELAS ===== */
        let waliItems = [];
        if (wRes.status === "fulfilled") {
          const wp = wRes.value?.data ?? [];
          waliItems = Array.isArray(wp) ? wp : wp.data ?? [];
        }

        if (!mounted) return;

        setGurus(guruItems);
        setKelas(kelasItems);

        // Build wali map (hanya tahun ajaran aktif)
        const map = {};
        waliItems.forEach((w) => {
          const guruId = w.guru_id ?? w.user_id;
          if (!guruId) return;
          if (!w.tahun_ajaran?.is_active) return;

          if (!map[guruId]) map[guruId] = [];

          map[guruId].push({
            assignment_id: w.id,
            kelas_id: w.kelas_id,
            kelas_nama: w.kelas?.nama ?? `Kelas ${w.kelas_id}`,
            tahun_ajaran: w.tahun_ajaran?.nama ?? "-",
          });
        });

        setWaliMap(map);

        console.log("TOTAL GURU:", guruItems.length);
      } catch (e) {
        console.error(e);
        setErr("Gagal memuat data guru.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daftar Guru</h1>
            <p className="text-sm text-gray-600">
              Kelola guru dan penugasan wali kelas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TahunAjaran />
            <Link
              to="/admin/guru/create"
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Guru
            </Link>
            <Link
              to="/admin/guru/wali-kelas/assign"
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Assign Wali
            </Link>
          </div>
        </div>

        {err && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded">
            {err}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="p-6 text-center">Memuat guru...</div>
          ) : gurus.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Belum ada guru.
            </div>
          ) : (
            gurus.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between bg-white rounded shadow-sm p-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar guru={g} size={56} />

                  <div>
                    <div className="font-semibold">
                      {g.nama ?? g.user?.name ?? "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {g.email ?? g.user?.email ?? "-"}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(waliMap[g.id] || []).length === 0 ? (
                        <span className="text-xs text-gray-400">
                          Belum menjadi wali kelas
                        </span>
                      ) : (
                        waliMap[g.id].map((a) => (
                          <span
                            key={a.assignment_id}
                            className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded"
                          >
                            {a.kelas_nama}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/admin/guru/edit/${g.id}`}
                  className="px-3 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

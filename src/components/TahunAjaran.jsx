// src/components/TahunAjaran.jsx
import React, { useEffect, useState } from "react";
import api from "../_api";

/**
 * TahunAjaran
 * - Fetches GET /tahun-ajaran/active
 * - Renders a small card showing current tahun ajaran and active semester
 * Usage: <TahunAjaran />
 */

export default function TahunAjaran() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/tahun-ajaran/active");
        if (!mounted) return;
        const payload = res?.data ?? null;
        setData(payload?.data ?? null);
      } catch (e) {
        console.error("fetch tahun ajaran failed", e);
        setErr("Gagal ambil tahun ajaran");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <div className="px-3 py-2 rounded bg-gray-50 text-sm text-gray-600">
        Memuat tahun ajaran...
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="px-3 py-2 rounded bg-gray-50 text-sm text-gray-600">
        Tahun ajaran: -
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded shadow-sm">
      <div className="flex flex-col">
        <div className="text-sm text-gray-500">Tahun Ajaran</div>
        <div className="text-lg font-semibold">{data.nama}</div>
      </div>
      <div className="px-3 py-2 rounded bg-indigo-50 text-indigo-700 text-sm font-medium">
        {data.semester_aktif?.nama ?? "—"}
      </div>
    </div>
  );
}

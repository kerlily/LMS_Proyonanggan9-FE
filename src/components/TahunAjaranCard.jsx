// src/components/TahunAjaranCard.jsx
import React, { useEffect, useState } from "react";
import api from "../_api";

export default function TahunAjaranCard() {
  const [ta, setTa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/tahun-ajaran/active"); // endpoint yang kamu sediakan
        if (!mounted) return;
        const data = res.data?.data ?? res.data ?? null;
        setTa(data);
      } catch (e) {
        console.warn("Gagal ambil tahun ajaran:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="bg-white p-3 rounded shadow">Memuat tahun ajaran...</div>;
  if (!ta) return <div className="bg-white p-3 rounded shadow">Tahun ajaran tidak tersedia</div>;

  return (
    <div className="bg-white p-4 rounded shadow flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">Tahun Ajaran</div>
        <div className="text-lg font-semibold">{ta.nama}</div>
        <div className="text-xs text-gray-400 mt-1">{ta.semester_aktif?.nama ?? ""}</div>
      </div>
      <div className="text-sm text-gray-500">Semester aktif</div>
    </div>
  );
}

// src/pages/admin/WaliKelas/AssignWali.jsx
import React, { useEffect, useState } from "react";
import { assignWaliKelas, getGuruList, getKelasList } from "../../../_services/admin";
import { useNavigate } from "react-router-dom";

export default function AssignWali() {
  const [gurus, setGurus] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [form, setForm] = useState({ guru_id: "", kelas_id: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getGuruList()
      .then((r) => setGurus(Array.isArray(r.data) ? r.data : r.data.data || []))
      .catch(() => setGurus([]));
    getKelasList()
      .then((r) => setKelas(Array.isArray(r.data) ? r.data : r.data.data || []))
      .catch(() => setKelas([]));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!form.guru_id || !form.kelas_id) return setErr("Pilih guru dan kelas.");

    setLoading(true);
    try {
      await assignWaliKelas({ guru_id: Number(form.guru_id), kelas_id: Number(form.kelas_id) });
      setMsg("Wali kelas berhasil diassign.");
      setTimeout(() => navigate("/admin/wali-kelas"), 800);
    } catch (error) {
      setErr(error?.response?.data?.message || "Gagal assign wali kelas.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Assign Wali Kelas</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Pilih Guru</label>
          <select name="guru_id" value={form.guru_id} onChange={handleChange} className="w-full px-3 py-2 border rounded">
            <option value="">-- Pilih Guru --</option>
            {gurus.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama ?? g.name ?? g.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Pilih Kelas</label>
          <select name="kelas_id" value={form.kelas_id} onChange={handleChange} className="w-full px-3 py-2 border rounded">
            <option value="">-- Pilih Kelas --</option>
            {kelas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama ?? k.kelas ?? `${k.tingkat ?? ""} ${k.nama ?? ""}`}
              </option>
            ))}
          </select>
        </div>

        {err && <div className="text-red-600">{err}</div>}
        {msg && <div className="text-green-600">{msg}</div>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600"}`}>
            {loading ? "Memproses..." : "Assign"}
          </button>
          <button type="button" onClick={() => navigate("/admin/wali-kelas")} className="px-4 py-2 border rounded">Batal</button>
        </div>
      </form>
    </div>
  );
}

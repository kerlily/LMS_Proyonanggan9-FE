// src/pages/admin/Siswa/SiswaForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSiswa, getKelasList } from "../../../_services/admin";

export default function SiswaForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: "", tahun_lahir: "", kelas_id: "" });
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getKelasList()
      .then((res) => setKelas(Array.isArray(res.data) ? res.data : res.data.data || []))
      .catch((e) => console.warn("gagal ambil kelas", e));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    if (!form.nama || !form.kelas_id) {
      return setErr("Nama dan Kelas wajib diisi.");
    }

    setLoading(true);
    try {
      const payload = {
        nama: form.nama,
        tahun_lahir: form.tahun_lahir ? Number(form.tahun_lahir) : undefined,
        kelas_id: Number(form.kelas_id),
      };
      const res = await createSiswa(payload);
      setSuccess("Siswa berhasil dibuat.");
      console.log("Created siswa:", res.data);
      // optionally redirect to siswa list or detail
      setTimeout(() => navigate("/admin/siswa"), 800);
    } catch (error) {
      setErr(error?.response?.data?.message || "Gagal membuat siswa.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Tambah Siswa Baru</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nama</label>
          <input name="nama" value={form.nama} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Tahun Lahir</label>
          <input name="tahun_lahir" value={form.tahun_lahir} onChange={handleChange} type="number" className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Kelas</label>
          <select name="kelas_id" value={form.kelas_id} onChange={handleChange} className="w-full px-3 py-2 border rounded">
            <option value="">-- Pilih Kelas --</option>
            {kelas.map((k) => (
              <option key={k.id ?? k.value} value={k.id ?? k.value}>
                {k.nama ?? k.name ?? k.tingkat ?? k.kelas}
              </option>
            ))}
          </select>
        </div>

        {err && <div className="text-red-600 text-sm">{err}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600"}`}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => navigate("/admin/siswa")} className="px-4 py-2 border rounded">Batal</button>
        </div>
      </form>
    </div>
  );
}

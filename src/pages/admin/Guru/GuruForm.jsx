// src/pages/admin/Guru/GuruForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGuru } from "../../../_services/admin";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function GuruForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", nip: "", no_hp: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    setPhotoFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    if (!form.name || !form.email || !form.password) return setErr("name, email, password wajib.");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("password", form.password);
    if (form.nip) fd.append("nip", form.nip);
    if (form.no_hp) fd.append("no_hp", form.no_hp);
    if (photoFile) fd.append("photo", photoFile); // backend expects photo key (user said 'photo')

    setLoading(true);
    try {
      await createGuru(fd);
      setSuccess("Guru berhasil ditambahkan.");
      setTimeout(() => navigate("/admin/guru"), 800);
    } catch (error) {
      setErr(error?.response?.data?.message || "Gagal tambah guru.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Tambah Guru</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">NIP</label>
            <input name="nip" value={form.nip} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">No. HP</label>
            <input name="no_hp" value={form.no_hp} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Foto (opsional)</label>
          <input type="file" accept="image/*" onChange={handlePhoto} className="block" />
          {preview && <img src={preview} alt="preview" className="mt-2 w-28 h-28 object-cover rounded" />}
        </div>

        {err && <div className="text-red-600 text-sm">{err}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600"}`}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => navigate("/admin/guru")} className="px-4 py-2 border rounded">Batal</button>
        </div>
      </form>
    </div>
    </AdminLayout>
  );
}

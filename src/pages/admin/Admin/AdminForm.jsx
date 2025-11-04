// src/pages/admin/Admin/AdminForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, User } from "lucide-react";
import { createAdmin, updateAdmin, showAdmin } from "../../../_services/adminUser";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function AdminForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      showAdmin(id)
        .then((res) => {
          const admin = res.data?.admin || res.data;
          setForm({ name: admin.name, email: admin.email, password: "" });
        })
        .catch((err) => setError("Gagal memuat data admin") || console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedPassword(null);

    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;

      const res = isEdit ? await updateAdmin(id, payload) : await createAdmin(payload);
      
      if (res.data?.raw_password) {
        setGeneratedPassword(res.data.raw_password);
      }

      alert(isEdit ? "Admin berhasil diupdate" : "Admin berhasil dibuat");
      if (!isEdit) navigate("/admin/admins");
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate("/admin/admins")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <User className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? "Edit Admin" : "Tambah Admin Baru"}
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              {isEdit ? "Update informasi admin" : "Buat akun admin baru"}
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {generatedPassword && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-900 mb-2">Password berhasil di-generate:</p>
              <code className="block bg-green-100 px-3 py-2 rounded text-green-800 font-mono">
                {generatedPassword}
              </code>
              <p className="text-sm text-green-700 mt-2">Simpan password ini dan berikan ke admin.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {isEdit && "(kosongkan jika tidak ingin mengubah)"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah" : "Minimal 8 karakter"}
                minLength={form.password ? 8 : undefined}
              />
              <p className="text-sm text-gray-500 mt-1">
                {isEdit
                  ? "Password akan di-hash otomatis"
                  : "Kosongkan untuk generate password otomatis (12 karakter)"}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
              >
                <Save className="w-5 h-5" />
                {loading ? "Menyimpan..." : isEdit ? "Update Admin" : "Buat Admin"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/admins")}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
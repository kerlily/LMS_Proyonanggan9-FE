// src/pages/admin/Admin/AdminResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Key, ArrowLeft, RefreshCw } from "lucide-react";
import { resetAdminPassword, showAdmin } from "../../../_services/adminUser";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function AdminResetPassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newPassword, setNewPassword] = useState(null);

  useEffect(() => {
    showAdmin(id)
      .then((res) => setAdmin(res.data?.admin || res.data))
      .catch(() => setError("Gagal memuat data admin"));
  }, [id]);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNewPassword(null);

    try {
      const payload = password ? { password } : {};
      const res = await resetAdminPassword(id, payload);
      setNewPassword(res.data?.raw_password);
      alert("Password berhasil direset");
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal reset password");
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
              <Key className="w-6 h-6 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900">Reset Password Admin</h1>
            </div>
            {admin && (
              <p className="text-sm text-gray-600">
                Reset password untuk: <span className="font-medium">{admin.name}</span> ({admin.email})
              </p>
            )}
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {newPassword && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-900 mb-2">Password baru:</p>
              <code className="block bg-green-100 px-3 py-2 rounded text-green-800 font-mono text-lg">
                {newPassword}
              </code>
              <p className="text-sm text-green-700 mt-2">
                Simpan password ini dan berikan ke admin. Password sudah di-hash di database.
              </p>
            </div>
          )}

          <form onSubmit={handleReset} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru (opsional)
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Kosongkan untuk generate otomatis"
                minLength={password ? 8 : undefined}
              />
              <p className="text-sm text-gray-500 mt-2">
                Kosongkan untuk generate password acak (12 karakter). Atau masukkan password baru (minimal 8 karakter).
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                {loading ? "Mereset..." : "Reset Password"}
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
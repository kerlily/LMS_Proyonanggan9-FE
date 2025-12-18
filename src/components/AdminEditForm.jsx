import React, { useEffect, useState } from "react";
import { showAdmin, updateAdmin } from "../_services/adminUser";
import { Save, ArrowLeft, User, Mail, Lock, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminEditForm({ adminId }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await showAdmin(adminId);
        const admin = res.data?.admin;

        setForm({
          name: admin?.name || "",
          email: admin?.email || "",
          password: "",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: err?.response?.data?.message || "Gagal memuat data admin",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "Mengerti",
          background: "#ffffff",
          color: "#1f2937",
        });
      } finally {
        setLoading(false);
      }
    };

    if (adminId) fetchAdmin();
  }, [adminId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Simpan Perubahan?",
      text: "Data admin akan diperbarui",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#9ca3af",
      background: "#ffffff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        title: "text-lg font-semibold",
        confirmButton: "px-6 py-2 rounded-lg font-medium",
        cancelButton: "px-6 py-2 rounded-lg font-medium"
      }
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
      };

      if (form.password.trim() !== "") {
        payload.password = form.password;
      }

      const res = await updateAdmin(adminId, payload);

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: res.data?.message || "Admin berhasil diperbarui",
        confirmButtonColor: "#10b981",
        background: "#ffffff",
        color: "#1f2937",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-lg font-semibold",
          confirmButton: "px-6 py-2 rounded-lg font-medium"
        }
      });

      if (res.data?.raw_password) {
        await Swal.fire({
          icon: "info",
          title: "Password Baru",
          html: `
            <div class="space-y-4">
              <p class="text-gray-600">Password admin telah diperbarui:</p>
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div class="font-mono text-lg font-bold text-center text-emerald-600 tracking-wider bg-white py-3 rounded-lg border border-emerald-100">
                  ${res.data.raw_password}
                </div>
                <p class="text-sm text-gray-500 text-center mt-3">
                  Harap simpan password ini dengan aman
                </p>
              </div>
            </div>
          `,
          confirmButtonText: "Saya Mengerti",
          confirmButtonColor: "#4f46e5",
          background: "#ffffff",
          color: "#1f2937",
          width: "500px",
          customClass: {
            popup: "rounded-2xl shadow-xl",
            title: "text-lg font-semibold mb-2",
            confirmButton: "px-6 py-2 rounded-lg font-medium"
          }
        });
      }

      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err?.response?.data?.message || "Gagal memperbarui admin",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-lg font-semibold",
          confirmButton: "px-6 py-2 rounded-lg font-medium"
        }
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-gray-600 font-medium">Memuat data admin...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          Edit Admin
        </h1>
        <p className="text-gray-600 mt-2">
          Perbarui informasi dan akses admin
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Field */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Nama Admin
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Masukkan nama admin"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
          </div>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="admin@example.com"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Password Baru
              <span className="text-gray-500 text-sm font-normal ml-2">
                (opsional)
              </span>
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Masukkan password baru"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kosongkan jika tidak ingin mengganti password
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-3 text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group shadow-md hover:shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
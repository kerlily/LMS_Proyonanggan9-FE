// src/pages/admin/Siswa/SiswaEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import api from "../../../_api";
import {
  showSiswa,
  updateSiswa,
  deleteSiswa,
} from "../../../_services/admin";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function SiswaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const [siswa, setSiswa] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    nisn: "",
    tahun_lahir: "",
    kelas_id: null,
    is_alumni: false,
  });

  const [kelasOptions, setKelasOptions] = useState([]);

  // fetch siswa detail + kelas list
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await showSiswa(id);
        const data = res?.data ?? {};
        const s = data.siswa ?? res?.data ?? null;
        if (!s) throw new Error("Data siswa tidak ditemukan");

        if (!mounted) return;

        setSiswa(s);
        setForm({
          nama: s.nama ?? "",
          nisn: s.nisn ?? "",
          tahun_lahir: s.tahun_lahir ?? "",
          kelas_id: s.kelas_id ?? null,
          is_alumni: !!s.is_alumni,
        });

        // ambil daftar kelas dari statistics endpoint (dipakai sebagai options)
        try {
          const ks = await api.get("/admin/kelas-mapel/statistics");
          const stats = ks?.data?.statistics ?? ks?.data ?? [];
          if (Array.isArray(stats) && mounted) {
            const opts = stats.map((k) => ({
              id: k.id,
              label: `${k.nama}`,
            }));
            setKelasOptions(opts);
          }
        } catch (e) {
          // tidak fatal
          console.warn("Gagal ambil daftar kelas:", e);
          setKelasOptions([]);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e?.response?.data?.message || e.message || "Gagal memuat data siswa.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => (mounted = false);
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);

    if (!form.nama || !form.nama.trim()) {
      Swal.fire({ 
        icon: "warning", 
        title: "Nama wajib diisi.",
        confirmButtonColor: "#3b82f6"
      });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        nama: form.nama,
        nisn: form.nisn || undefined, // ✅ FIX: Include NISN in payload
        tahun_lahir: form.tahun_lahir ? Number(form.tahun_lahir) : undefined,
        kelas_id: form.kelas_id || null,
        is_alumni: !!form.is_alumni,
      };

      const res = await updateSiswa(id, payload);
      const data = res?.data ?? {};
      
      await Swal.fire({ 
        icon: "success", 
        title: "Berhasil", 
        text: data.message ?? "Perubahan tersimpan.",
        timer: 1500,
        showConfirmButton: false
      });

      // ✅ Auto redirect to siswa list after success
      navigate("/admin/siswa");
      
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || e.message || "Gagal menyimpan siswa.";
      setErr(message);
      Swal.fire({ 
        icon: "error", 
        title: "Gagal", 
        text: message,
        confirmButtonColor: "#3b82f6"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const answer = await Swal.fire({
      title: `Hapus siswa "${siswa?.nama}"?`,
      text: "Data nilai dan riwayat akan ikut dihapus. Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!answer.isConfirmed) return;

    try {
      await deleteSiswa(id);
      await Swal.fire({ 
        icon: "success", 
        title: "Berhasil", 
        text: "Siswa dihapus.",
        timer: 1500,
        showConfirmButton: false
      });
      navigate("/admin/siswa");
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || e.message || "Gagal menghapus siswa.";
      Swal.fire({ 
        icon: "error", 
        title: "Gagal", 
        text: message,
        confirmButtonColor: "#3b82f6"
      });
    }
  };

  // RESET PASSWORD: open modal (SweetAlert) to ask new_password & confirmation
  const handleResetPassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: `Reset password untuk "${siswa?.nama}"`,
      html:
        `<input id="swal-new" class="swal2-input" type="password" placeholder="Password baru">` +
        `<input id="swal-confirm" class="swal2-input" type="password" placeholder="Konfirmasi password">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reset",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const newPass = document.getElementById("swal-new")?.value ?? "";
        const conf = document.getElementById("swal-confirm")?.value ?? "";
        if (!newPass) {
          Swal.showValidationMessage("Masukkan password baru");
          return false;
        }
        if (newPass !== conf) {
          Swal.showValidationMessage("Password dan konfirmasi tidak cocok");
          return false;
        }
        return { new_password: newPass, new_password_confirmation: conf };
      },
    });

    if (!formValues) return;

    try {
      const res = await api.post(`/admin/siswa/${id}/reset-password`, formValues);
      const data = res?.data ?? {};

      const possiblePwd =
        data.raw_password ??
        data.password ??
        data.new_password ??
        null;

      const successMsg = data.message ?? "Password berhasil direset.";

      await Swal.fire({
        icon: "success",
        title: "Sukses",
        html: possiblePwd
          ? `${successMsg}<br/><br/><b>Password baru:</b> <code class="bg-gray-100 px-2 py-1 rounded">${possiblePwd}</code>`
          : `${successMsg}`,
        confirmButtonColor: "#3b82f6"
      });
    } catch (e) {
      console.error("reset password error:", e);
      const message = e?.response?.data?.message || e.message || "Gagal reset password.";
      Swal.fire({ 
        icon: "error", 
        title: "Gagal", 
        text: message,
        confirmButtonColor: "#3b82f6"
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Memuat data siswa...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (err && !siswa) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{err}</span>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!siswa) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2A9 9 0 008.5 3M21 21v-1a6 6 0 00-6-6h-2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Siswa tidak ditemukan</h3>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate("/admin/siswa")}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Siswa</h1>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {err && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{err}</span>
              </div>
            </div>
          )}

          {msg && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">{msg}</span>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/20">
            <div className="space-y-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  placeholder="Masukkan nama lengkap siswa"
                />
              </div>

              {/* NISN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NISN
                </label>
                <input
                  name="nisn"
                  value={form.nisn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  placeholder="Nomor Induk Siswa Nasional (opsional)"
                />
              </div>

              {/* Tahun Lahir */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tahun Lahir
                </label>
                <input
                  name="tahun_lahir"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={form.tahun_lahir ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  placeholder="Contoh: 2010"
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kelas
                </label>
                <select
                  name="kelas_id"
                  value={form.kelas_id ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="">-- Pilih kelas (kosong = belum ada) --</option>
                  {kelasOptions.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alumni Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <input
                  id="is_alumni"
                  name="is_alumni"
                  type="checkbox"
                  checked={!!form.is_alumni}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="is_alumni" className="text-sm font-semibold text-gray-900 cursor-pointer">
                    Tandai sebagai alumni
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Centang jika siswa sudah lulus dan tidak aktif lagi
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Perubahan
                  </>
                )}
              </button>

              <button
                onClick={handleResetPassword}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Reset Password
              </button>

              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Siswa
              </button>

              <button
                onClick={() => navigate("/admin/siswa")}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 ml-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
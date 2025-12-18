// src/pages/admin/Guru/GuruEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Trash2, 
  Upload, 
  X, 
  User, 
  Mail, 
  Phone, 
  UserCircle,
  Eye,
  EyeOff,
  CheckCircle
} from "lucide-react";

import { showGuru, updateGuru, resetGuruPassword, deleteGuru } from "../../../_services/admin";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function GuruEdit() {
  const { id } = useParams();
  const [guru, setGuru] = useState(null);
  const [form, setForm] = useState({ nama: "", email: "", nip: "", no_hp: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    new_password: "",
    new_password_confirmation: ""
  });
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  const navigate = useNavigate();

  // Fungsi untuk kembali ke halaman daftar guru
  const handleBackToList = () => {
    navigate("/admin/guru");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await showGuru(id);
        if (!mounted) return;
        const g = res.data?.guru ?? res.data ?? res.data?.data ?? null;
        const photo_url =
          res.data?.photo_url ??
          g?.photo_url ??
          (g?.photo ? (g.photo.startsWith("http") ? g.photo : `${window.location.origin}/storage/${g.photo}`) : null);
        setGuru({ ...g, photo_url });
        setForm({
          nama: g?.nama ?? g?.user?.name ?? "",
          email: g?.user?.email ?? "",
          nip: g?.nip ?? "",
          no_hp: g?.no_hp ?? "",
        });
        setPhotoPreview(photo_url);
      } catch (e) {
        console.error(e);
        const message = e?.response?.data?.message || "Gagal memuat data guru";
        Swal.fire({ 
          icon: "error", 
          title: "Error", 
          text: message,
          confirmButtonColor: '#ef4444',
        }).then(() => {
          // Kembali ke list jika error
          handleBackToList();
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleResetPasswordChange = (e) => {
    setResetPasswordData({
      ...resetPasswordData,
      [e.target.name]: e.target.value
    });
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setPhotoFile(f);
    if (f) setPhotoPreview(URL.createObjectURL(f));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(guru?.photo_url || null);
  };

  const handleSave = async () => {
    if (!form.nama || !form.email) {
      Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Nama dan email wajib diisi",
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      if (form.nama) fd.append("nama", form.nama);
      if (form.email) fd.append("email", form.email);
      if (form.nip !== undefined) fd.append("nip", form.nip);
      if (form.no_hp !== undefined) fd.append("no_hp", form.no_hp);
      if (photoFile) fd.append("photo", photoFile);

      const res = await updateGuru(id, fd);
      const message = res?.data?.message ?? "Berhasil update";
      
      const result = await Swal.fire({ 
        icon: "success", 
        title: "Sukses", 
        text: message,
        showCancelButton: true,
        confirmButtonText: 'Kembali ke Daftar',
        cancelButtonText: 'Tetap di Halaman Ini',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
      });

      // Jika user memilih "Kembali ke Daftar"
      if (result.isConfirmed) {
        handleBackToList();
      } else {
        // update local state jika tetap di halaman ini
        const updatedGuru = res?.data?.guru ?? res?.data ?? guru;
        const photo_url = res?.data?.photo_url ?? updatedGuru?.photo_url ?? photoPreview;
        setGuru({ ...updatedGuru, photo_url });
        setPhotoPreview(photo_url);
        setPhotoFile(null);
      }
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || "Gagal update guru";
      Swal.fire({ 
        icon: "error", 
        title: "Error", 
        text: message,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordData.new_password) {
      Swal.fire({
        icon: "warning",
        title: "Password kosong",
        text: "Silakan masukkan password baru",
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    if (resetPasswordData.new_password !== resetPasswordData.new_password_confirmation) {
      Swal.fire({
        icon: "error",
        title: "Password tidak cocok",
        text: "Konfirmasi password harus sama dengan password baru",
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    try {
      const payload = resetPasswordData;
      const res = await resetGuruPassword(id, payload);
      const raw = res?.data?.raw_password ?? payload.new_password;
      
      const result = await Swal.fire({
        icon: "success",
        title: "Password Berhasil Di-reset",
        html: `
          <div class="text-left">
            <p class="mb-3">Password baru untuk <b>${guru?.nama}</b>:</p>
            <div class="bg-gray-100 p-3 rounded-lg mb-3">
              <code class="text-lg font-mono">${raw}</code>
            </div>
            <p class="text-sm text-gray-600">Salin dan beritahukan kepada guru terkait.</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Kembali ke Daftar',
        cancelButtonText: 'Tetap di Halaman',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
      });

      if (result.isConfirmed) {
        handleBackToList();
      } else {
        setShowResetPassword(false);
        setResetPasswordData({
          new_password: "",
          new_password_confirmation: ""
        });
      }
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || "Gagal reset password";
      Swal.fire({ 
        icon: "error", 
        title: "Error", 
        text: message,
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Hapus guru "${guru?.nama ?? ""}"?`,
      text: "Semua data terkait guru ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteGuru(id);
      
      await Swal.fire({ 
        icon: "success", 
        title: "Berhasil Dihapus", 
        text: "Guru berhasil dihapus dari sistem",
        showConfirmButton: false,
        timer: 1500
      });
      
      // Otomatis kembali ke daftar setelah hapus
      handleBackToList();
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || "Gagal hapus guru";
      Swal.fire({ 
        icon: "error", 
        title: "Error", 
        text: message,
        confirmButtonColor: '#ef4444',
      });
    }
  };

  // TAMBAHKAN: Tombol khusus untuk kembali ke daftar dengan konfirmasi
  const handleSaveAndBack = async () => {
    const result = await Swal.fire({
      title: "Simpan dan Kembali?",
      text: "Data akan disimpan dan Anda akan kembali ke daftar guru.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan & Kembali",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      // Validasi sebelum save
      if (!form.nama || !form.email) {
        Swal.fire({
          icon: "warning",
          title: "Data tidak lengkap",
          text: "Nama dan email wajib diisi",
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      setSaving(true);
      try {
        const fd = new FormData();
        if (form.nama) fd.append("nama", form.nama);
        if (form.email) fd.append("email", form.email);
        if (form.nip !== undefined) fd.append("nip", form.nip);
        if (form.no_hp !== undefined) fd.append("no_hp", form.no_hp);
        if (photoFile) fd.append("photo", photoFile);

        await updateGuru(id, fd);
        
        await Swal.fire({ 
          icon: "success", 
          title: "Berhasil!", 
          text: "Data guru berhasil diperbarui",
          showConfirmButton: false,
          timer: 1000
        });
        
        handleBackToList();
      } catch (e) {
        console.error(e);
        const message = e?.response?.data?.message || "Gagal update guru";
        Swal.fire({ 
          icon: "error", 
          title: "Error", 
          text: message,
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data guru...</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header dengan tombol back */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
              Kembali ke Daftar
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Edit Data Guru</h1>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Foto guru" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" 
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg">
                  <UserCircle size={48} className="text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{guru?.nama || "-"}</h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail size={16} />
                <span>{guru?.user?.email || form.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <User size={16} />
                <span>NIP: {guru?.nip || form.nip || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Edit Data */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">
            Informasi Data Guru
          </h3>
          
          <div className="space-y-5">
            {/* ... (form fields tetap sama) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="email@guru.sch.id"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIP
                </label>
                <input
                  name="nip"
                  value={form.nip}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Nomor Induk Pegawai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. HP
                </label>
                <input
                  name="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto Profil
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      <Upload size={18} />
                      Pilih Foto
                      <input
                        type="file"
                        onChange={handleFile}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    {photoPreview && photoPreview !== guru?.photo_url && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Format: JPG, PNG. Maksimal 5MB. Kosongkan jika tidak ingin mengubah foto.
                  </p>
                </div>
              </div>
            </div>

            {/* TAMBAHKAN: Tombol aksi dengan opsi "Simpan & Kembali" */}
            <div className="pt-4 border-t flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition ${
                  saving
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
                  </>
                )}
              </button>
              
              <button
                onClick={handleSaveAndBack}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition ${
                  saving
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                <CheckCircle size={18} />
                Simpan & Kembali ke Daftar
              </button>
              
              <button
                onClick={handleBackToList}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>

        {/* Reset Password Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b">
            Reset Password
          </h3>
          
          {showResetPassword ? (
            <div className="space-y-4">
              {/* ... (reset password form tetap sama) ... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    name="new_password"
                    type={showPassword ? "text" : "password"}
                    value={resetPasswordData.new_password}
                    onChange={handleResetPasswordChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-10"
                    placeholder="Masukkan password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    name="new_password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    value={resetPasswordData.new_password_confirmation}
                    onChange={handleResetPasswordChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-10"
                    placeholder="Ketik ulang password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResetPassword}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <RefreshCw size={18} />
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetPasswordData({
                      new_password: "",
                      new_password_confirmation: ""
                    });
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetPassword(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-amber-500 text-amber-700 rounded-lg hover:bg-amber-50 transition"
            >
              <RefreshCw size={18} />
              Reset Password Guru
            </button>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-700 mb-4 pb-3 border-b border-red-200">
            Zona Berbahaya
          </h3>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Tindakan ini akan menghapus guru dan semua data terkait secara permanen.
              Setelah dihapus, Anda akan kembali ke daftar guru.
            </p>
            
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={18} />
              Hapus Guru
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
// src/pages/admin/Guru/GuruForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGuru } from "../../../_services/admin";
import AdminLayout from "../../../components/layout/AdminLayout";
import Swal from "sweetalert2";
import { Eye, EyeOff, ArrowLeft, Save, X } from "lucide-react";

export default function GuruForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", nip: "", no_hp: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true); // Default true agar password terlihat

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    setPhotoFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!form.name || !form.email || !form.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Nama, email, dan password wajib diisi.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    setLoading(true);
    
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("password", form.password);
    if (form.nip) fd.append("nip", form.nip);
    if (form.no_hp) fd.append("no_hp", form.no_hp);
    if (photoFile) fd.append("photo", photoFile);

    try {
      await createGuru(fd);
      
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Guru berhasil ditambahkan.',
        showConfirmButton: false,
        timer: 1500
      });
      
      navigate("/admin/guru");
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error?.response?.data?.message || 'Gagal menambahkan guru.',
        confirmButtonColor: '#ef4444',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (form.name || form.email || form.password) {
      Swal.fire({
        title: 'Batal menambahkan?',
        text: 'Data yang sudah diisi akan hilang.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, batalkan',
        cancelButtonText: 'Lanjutkan'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/admin/guru");
        }
      });
    } else {
      navigate("/admin/guru");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors mr-4"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Tambah Guru Baru</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="contoh@guru.sch.id"
            />
          </div>

          {/* Password - Visible by default */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-10"
                placeholder="Buat password untuk guru"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password akan tetap terlihat karena ini adalah proses pembuatan akun
            </p>
          </div>

          {/* NIP dan No. HP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP
              </label>
              <input
                name="nip"
                value={form.nip}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto Profil (Opsional)
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: JPG, PNG, maksimal 5MB
                </p>
              </div>
              {preview && (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan Data
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              <X size={18} />
              Batal
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
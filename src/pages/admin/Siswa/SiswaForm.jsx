// src/pages/admin/Siswa/SiswaForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSiswa, getKelasList } from "../../../_services/admin";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function SiswaForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: "", nisn: "", tahun_lahir: "", kelas_id: "" });
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

    if (!form.nama || !form.nama.trim()) {
      return setErr("Nama wajib diisi.");
    }

    setLoading(true);
    try {
      const payload = {
        nama: form.nama,
        nisn: form.nisn || undefined,
        tahun_lahir: form.tahun_lahir ? Number(form.tahun_lahir) : undefined,
        kelas_id: (!form.kelas_id || form.kelas_id === "" || form.kelas_id === "0") ? null : Number(form.kelas_id),
      };
      // eslint-disable-next-line no-unused-vars
      const res = await createSiswa(payload);
      setSuccess("Siswa berhasil dibuat.");
      setTimeout(() => navigate("/admin/siswa"), 800);
    } catch (error) {
      setErr("Tahun lahir terlalu tua");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tambah Siswa Baru</h1>
            </div>
            <p className="text-gray-600 text-sm ml-11">Isi data siswa yang akan ditambahkan</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alert Messages */}
              {err && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-medium">{err}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 font-medium">{success}</span>
                  </div>
                </div>
              )}

              {/* Nama - WAJIB */}
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
                  required
                />
              </div>

              {/* NISN - Optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NISN <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <input 
                  name="nisn" 
                  value={form.nisn} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  placeholder="Nomor Induk Siswa Nasional"
                />
              </div>

              {/* Tahun Lahir */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tahun Lahir <span className="text-gray-400 text-xs"></span>
                </label>
                <input 
                  name="tahun_lahir" 
                  value={form.tahun_lahir} 
                  onChange={handleChange} 
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  placeholder="Contoh: 2010"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tahun lahir akan digunakan sebagai password default siswa
                </p>
              </div>

              {/* Kelas - Optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kelas <span className="text-gray-400 text-xs">(Opsional - bisa diisi nanti)</span>
                </label>
                <select 
                  name="kelas_id" 
                  value={form.kelas_id} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="">-- Pilih Kelas (atau kosongkan dulu) --</option>
                  <option value="0">Belum punya kelas</option>
                  {kelas.map((k) => (
                    <option key={k.id ?? k.value} value={k.id ?? k.value}>
                      {k.nama ?? k.name ?? k.tingkat ?? k.kelas}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Kelas bisa ditambahkan nanti saat siswa sudah masuk kelas
                </p>
              </div>


              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Simpan
                    </>
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => navigate("/admin/siswa")} 
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
// src/components/ProfileModal.jsx - MODERN VERSION
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { X, Camera, Loader, User, Mail, Phone, IdCard } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { updateMyProfile } from "../_services/profile";

const MySwal = withReactContent(Swal);
Modal.setAppElement("#root");

// Helper function untuk build photo URL
function buildPhotoUrl(data) {
  if (!data) {
    return null;
  }

  // Priority 1: photo_url exists dan valid
  if (data.photo_url && typeof data.photo_url === 'string' && data.photo_url.length > 0) {
    return data.photo_url;
  }

  // Priority 2: photo path exists
  if (data.photo && typeof data.photo === 'string' && data.photo.length > 0) {
    if (data.photo.startsWith('http')) {
      return data.photo;
    }
    
    // FIXED: Gunakan API base URL bukan window.location.origin
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${baseUrl}/storage/${data.photo}`;
    return url;
  }

  // Priority 3: nested guru object
  if (data.guru && typeof data.guru === 'object') {
    return buildPhotoUrl(data.guru);
  }

  return null;
}

export default function ProfileModal({ isOpen, onRequestClose, initialUser }) {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_hp: "",
    nip: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen && initialUser) {
      setForm({
        nama: initialUser?.nama ?? initialUser?.name ?? "",
        email: initialUser?.email ?? "",
        no_hp: initialUser?.no_hp ?? initialUser?.guru?.no_hp ?? "",
        nip: initialUser?.nip ?? initialUser?.guru?.nip ?? "",
      });
      
      // Build photo URL dengan helper
      const photoUrl = buildPhotoUrl(initialUser);
      setPreviewUrl(photoUrl);
      setPhotoFile(null);
      setImageError(false);
    }
  }, [initialUser, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    setPhotoFile(f);
    setImageError(false);
    
    if (f) {
      // Revoke previous blob URL to prevent memory leak
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      // Reset to original photo
      const originalUrl = buildPhotoUrl(initialUser);
      setPreviewUrl(originalUrl);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    
    // Validation
    if (!form.nama || !form.email) {
      MySwal.fire({ 
        icon: "warning", 
        title: "Peringatan",
        text: "Nama dan email harus diisi",
        background: '#1e1b4b',
        color: 'white',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    setSaving(true);
    
    try {
      const fd = new FormData();
      fd.append("name", form.nama);
      fd.append("email", form.email);
      if (form.no_hp) fd.append("no_hp", form.no_hp);
      if (form.nip) fd.append("nip", form.nip);
      if (photoFile) {
        fd.append("photo", photoFile);
      }

      const res = await updateMyProfile(fd);

      MySwal.fire({ 
        icon: "success", 
        title: "Berhasil!",
        text: "Profil berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
        background: '#1e1b4b',
        color: 'white'
      });

      // Update localStorage
      const newUser = res?.data?.user ?? res?.data?.guru?.user ?? res?.data;
      const newGuru = res?.data?.guru;
      
      if (newUser) {
        try {
          const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
          const prev = raw ? JSON.parse(raw) : {};
          
          // Build photo URL from response
          let photoUrl = res?.data?.photo_url;
          if (!photoUrl && newGuru?.photo_url) {
            photoUrl = newGuru.photo_url;
          } else if (!photoUrl && newGuru?.photo) {
            photoUrl = newGuru.photo.startsWith("http") 
              ? newGuru.photo 
              : `${window.location.origin}/storage/${newGuru.photo}`;
          } else if (!photoUrl && newUser?.photo) {
            photoUrl = newUser.photo.startsWith("http")
              ? newUser.photo
              : `${window.location.origin}/storage/${newUser.photo}`;
          }
           
          // Merge data - PENTING: preserve photo_url
          const merged = { 
            ...prev, 
            ...newUser,
            nama: newUser.name || prev.nama,
            name: newUser.name || prev.name,
            email: newUser.email || prev.email,
            no_hp: form.no_hp || prev.no_hp,
            nip: form.nip || prev.nip,
            photo: newGuru?.photo || newUser?.photo || prev.photo,
            photo_url: photoUrl || prev.photo_url
          };

          // If guru data exists, merge it - PENTING: include photo_url
          if (newGuru) {
            merged.guru = {
              ...prev.guru,
              ...newGuru,
              photo_url: newGuru.photo_url || photoUrl
            };
          }

          localStorage.setItem("userInfo", JSON.stringify(merged));
          localStorage.setItem("user", JSON.stringify(merged));
          
          // Dispatch events untuk update layout
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('userInfoUpdated'));
        } catch (e) {
          console.error("Error updating localStorage:", e);
        }
      }

      onRequestClose();
      
      // Refresh page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err) {
      
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.message || 
                          "Terjadi kesalahan saat menyimpan profil";
      
      MySwal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: errorMessage,
        background: '#1e1b4b',
        color: 'white',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setSaving(false);
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => !saving && onRequestClose()}
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start sm:items-center justify-center p-4"
      className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl max-w-md w-full shadow-2xl outline-none "
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Edit Profil</h3>
            <p className="text-indigo-100 text-sm">Perbarui informasi profil Anda</p>
          </div>
        </div>
        <button 
          onClick={() => !saving && onRequestClose()} 
          className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
          disabled={saving}
        >
          <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {previewUrl && !imageError ? (
                <img 
                  src={previewUrl} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-400">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <label className="inline-flex items-center gap-2 cursor-pointer p-2 bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 group">
                <Camera className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFile} 
                  className="hidden"
                  disabled={saving}
                />
              </label>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">Max 5MB (JPG, PNG, WebP)</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Nama Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="w-4 h-4 text-indigo-500" />
              Nama <span className="text-red-400">*</span>
            </label>
            <input 
              name="nama" 
              value={form.nama} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
              placeholder="Masukkan nama lengkap"
              required
              disabled={saving}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Mail className="w-4 h-4 text-indigo-500" />
              Email <span className="text-red-400">*</span>
            </label>
            <input 
              name="email" 
              type="email"
              value={form.email} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
              placeholder="email@example.com"
              required
              disabled={saving}
            />
          </div>

          {/* Grid Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* No HP Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Phone className="w-4 h-4 text-indigo-500" />
                No. HP
              </label>
              <input 
                name="no_hp" 
                value={form.no_hp} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                placeholder="08xxx"
                disabled={saving}
              />
            </div>

            {/* NIP Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <IdCard className="w-4 h-4 text-indigo-500" />
                NIP
              </label>
              <input 
                name="nip" 
                value={form.nip} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                placeholder="Nomor Induk Pegawai"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50">
          <button 
            type="button" 
            onClick={() => !saving && onRequestClose()} 
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium disabled:opacity-50"
            disabled={saving}
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className={`px-6 py-2.5 rounded-xl text-white transition-all duration-200 flex items-center gap-2 font-medium shadow-lg ${
              saving 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105"
            }`}
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </form>
    </Modal>    
  );
}
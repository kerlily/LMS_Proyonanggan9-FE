// src/components/ProfileModal.jsx - COMPLETE FIX
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { X, Camera, Loader } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { updateMyProfile } from "../_services/profile";

const MySwal = withReactContent(Swal);
Modal.setAppElement("#root");

// Helper function untuk build photo URL
function buildPhotoUrl(data) {
  if (!data) {
    console.log("🔍 buildPhotoUrl: No data");
    return null;
  }

  console.log("🔍 buildPhotoUrl input:", data);

  // Priority 1: photo_url
  if (data.photo_url) {
    console.log("✅ Found photo_url:", data.photo_url);
    return data.photo_url;
  }

  // Priority 2: photo path
  if (data.photo) {
    const url = data.photo.startsWith('http') 
      ? data.photo 
      : `${window.location.origin}/storage/${data.photo}`;
    console.log("✅ Built photo URL from path:", url);
    return url;
  }

  // Priority 3: nested guru object
  if (data.guru) {
    console.log("🔍 Checking nested guru object");
    return buildPhotoUrl(data.guru);
  }

  console.log("❌ No photo found");
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

  useEffect(() => {
    if (isOpen) {
      console.log("🔍 ProfileModal opened with user:", initialUser);
      
      setForm({
        nama: initialUser?.nama ?? initialUser?.name ?? "",
        email: initialUser?.email ?? "",
        no_hp: initialUser?.no_hp ?? initialUser?.guru?.no_hp ?? "",
        nip: initialUser?.nip ?? initialUser?.guru?.nip ?? "",
      });
      
      // Build photo URL dengan helper
      const photoUrl = buildPhotoUrl(initialUser);
      console.log("🖼️ Setting preview URL:", photoUrl);
      setPreviewUrl(photoUrl);
      setPhotoFile(null);
    }
  }, [initialUser, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    setPhotoFile(f);
    if (f) {
      // Revoke previous blob URL to prevent memory leak
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(f);
      console.log("📸 New photo selected, preview:", url);
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
        text: "Nama dan email harus diisi"
      });
      return;
    }

    setSaving(true);
    console.log("💾 Saving profile...", form);
    
    try {
      const fd = new FormData();
      fd.append("name", form.nama);
      fd.append("email", form.email);
      if (form.no_hp) fd.append("no_hp", form.no_hp);
      if (form.nip) fd.append("nip", form.nip);
      if (photoFile) {
        console.log("📸 Uploading photo:", photoFile.name);
        fd.append("photo", photoFile);
      }

      console.log("🚀 Sending profile update...");
      const res = await updateMyProfile(fd);
      console.log("✅ Profile update response:", res.data);

      MySwal.fire({ 
        icon: "success", 
        title: "Berhasil!",
        text: "Profil berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false
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
          if (!photoUrl && newGuru?.photo) {
            photoUrl = newGuru.photo.startsWith("http") 
              ? newGuru.photo 
              : `${window.location.origin}/storage/${newGuru.photo}`;
          } else if (!photoUrl && newUser?.photo) {
            photoUrl = newUser.photo.startsWith("http")
              ? newUser.photo
              : `${window.location.origin}/storage/${newUser.photo}`;
          }
          
          console.log("🖼️ New photo URL:", photoUrl);
          
          // Merge data
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

          // If guru data exists, merge it
          if (newGuru) {
            merged.guru = {
              ...prev.guru,
              ...newGuru,
              photo_url: photoUrl
            };
          }

          localStorage.setItem("userInfo", JSON.stringify(merged));
          console.log("💾 Updated localStorage:", merged);
          
          // Dispatch event
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('userInfoUpdated'));
        } catch (e) {
          console.error("❌ Error updating localStorage:", e);
        }
      }

      onRequestClose();
      
      // Refresh page to show updated data
      setTimeout(() => {
        console.log("🔄 Reloading page...");
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error("❌ Update profile error:", err);
      console.error("Error response:", err?.response?.data);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error ||
                          err?.message || 
                          "Terjadi kesalahan saat menyimpan profil";
      
      MySwal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: errorMessage,
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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => !saving && onRequestClose()}
      overlayClassName="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-4"
      className="bg-white rounded-lg max-w-xl w-full shadow-lg outline-none max-h-[90vh] overflow-y-auto"
    >
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-lg font-semibold">Edit Profil</h3>
        <button 
          onClick={() => !saving && onRequestClose()} 
          className="p-1 rounded hover:bg-gray-100"
          disabled={saving}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("❌ Failed to load image:", previewUrl);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2 ${previewUrl ? 'hidden' : ''}`}
              style={previewUrl ? { display: 'none' } : {}}
            >
              No Photo
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-gray-50 border rounded hover:bg-gray-100 transition-colors">
              <Camera className="w-4 h-4" />
              <span className="text-sm">Ganti Foto</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFile} 
                className="hidden"
                disabled={saving}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG, WebP)</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nama <span className="text-red-500">*</span>
          </label>
          <input 
            name="nama" 
            value={form.nama} 
            onChange={handleChange} 
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input 
            name="email" 
            type="email"
            value={form.email} 
            onChange={handleChange} 
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            disabled={saving}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">No. HP</label>
            <input 
              name="no_hp" 
              value={form.no_hp} 
              onChange={handleChange} 
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NIP</label>
            <input 
              name="nip" 
              value={form.nip} 
              onChange={handleChange} 
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={() => !saving && onRequestClose()} 
            className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className={`px-4 py-2 rounded text-white transition-colors flex items-center gap-2 ${
              saving 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700"
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
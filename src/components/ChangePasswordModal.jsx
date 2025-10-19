// src/components/ChangePasswordModal.jsx
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { X, Loader, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { changeMyPassword } from "../_services/profile";

const MySwal = withReactContent(Swal);

// Accessibility - sesuaikan root id jika berbeda
Modal.setAppElement("#root");

export default function ChangePasswordModal({ isOpen, onRequestClose }) {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (isOpen) {
      setForm({ 
        old_password: "", 
        new_password: "", 
        new_password_confirmation: "" 
      });
      setShowPasswords({ old: false, new: false, confirm: false });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.old_password) {
      return MySwal.fire({ 
        icon: "warning", 
        title: "Peringatan",
        text: "Password lama harus diisi" 
      });
    }

    if (!form.new_password || form.new_password.length < 8) {
      return MySwal.fire({ 
        icon: "warning", 
        title: "Peringatan",
        text: "Password baru minimal 8 karakter" 
      });
    }

    if (form.new_password !== form.new_password_confirmation) {
      return MySwal.fire({ 
        icon: "warning", 
        title: "Peringatan",
        text: "Konfirmasi password tidak cocok" 
      });
    }

    setSaving(true);
    
    try {
      console.log("Sending password change request...");
      
      // Send request with proper field names matching backend
      const response = await changeMyPassword({
        old_password: form.old_password,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation,
      });

      console.log("Password change response:", response);

      MySwal.fire({ 
        icon: "success", 
        title: "Berhasil!",
        text: "Password berhasil diubah",
        timer: 2000,
        showConfirmButton: false
      });

      // Reset form and close modal
      setForm({ 
        old_password: "", 
        new_password: "", 
        new_password_confirmation: "" 
      });
      
      onRequestClose();

    } catch (err) {
      console.error("Password change error:", err);
      console.error("Error response:", err?.response?.data);

      let errorMessage = "Terjadi kesalahan";
      
      if (err?.response?.status === 422) {
        errorMessage = "Password lama salah";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      MySwal.fire({
        icon: "error",
        title: "Gagal Mengubah Password",
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => !saving && onRequestClose()}
      overlayClassName="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-4"
      className="bg-white rounded-lg max-w-md w-full shadow-lg outline-none"
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ganti Password</h3>
        <button 
          onClick={() => !saving && onRequestClose()} 
          className="p-1 rounded hover:bg-gray-100"
          disabled={saving}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Password Saat Ini <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.old ? "text" : "password"}
              name="old_password"
              value={form.old_password}
              onChange={handleChange}
              className="w-full border px-3 py-2 pr-10 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Masukkan password lama"
              required
              disabled={saving}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('old')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={saving}
            >
              {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Password Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              className="w-full border px-3 py-2 pr-10 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Minimal 8 karakter"
              required
              disabled={saving}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={saving}
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password harus minimal 8 karakter</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Konfirmasi Password Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="new_password_confirmation"
              value={form.new_password_confirmation}
              onChange={handleChange}
              className="w-full border px-3 py-2 pr-10 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Ketik ulang password baru"
              required
              disabled={saving}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={saving}
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {form.new_password && form.new_password_confirmation && 
         form.new_password !== form.new_password_confirmation && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            Password tidak cocok
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
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
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            {saving ? "Memproses..." : "Ganti Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
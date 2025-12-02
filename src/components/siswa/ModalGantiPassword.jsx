// src/components/siswa/ModalGantiPassword.jsx
import React, { useState } from "react";
import { X, Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function ModalGantiPassword({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.old_password) {
      setError("Password lama harus diisi");
      return false;
    }
    if (!formData.new_password) {
      setError("Password baru harus diisi");
      return false;
    }
    if (formData.new_password.length < 6) {
      setError("Password baru minimal 6 karakter");
      return false;
    }
    if (formData.new_password !== formData.new_password_confirmation) {
      setError("Konfirmasi password tidak cocok");
      return false;
    }
    if (formData.old_password === formData.new_password) {
      setError("Password baru harus berbeda dengan password lama");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await onSuccess(formData);
      
      // Reset form
      setFormData({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      onClose();
    } catch (err) {
      console.error("Error changing password:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Gagal mengubah password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFormData({
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Ganti Password</h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Lama
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? "text" : "password"}
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                placeholder="Masukkan password lama"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("old")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.old ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Masukkan password baru (min. 6 karakter)"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.new_password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {formData.new_password.length >= 6 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={formData.new_password.length >= 6 ? "text-green-600" : "text-gray-500"}>
                    Minimal 6 karakter
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="new_password_confirmation"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                placeholder="Masukkan ulang password baru"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.new_password_confirmation && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs">
                  {formData.new_password === formData.new_password_confirmation ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Password cocok</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Password tidak cocok</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Ganti Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
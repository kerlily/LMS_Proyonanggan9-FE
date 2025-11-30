// src/components/KehadiranSikapModal.jsx
import React, { useState, useEffect } from "react";
import { X, Save, UserCheck } from "lucide-react";

export default function KehadiranSikapModal({ 
  open, 
  onClose, 
  siswa, 
  existingKehadiran,
  existingSikap,
  onSave 
}) {
  const [formData, setFormData] = useState({
    ijin: 0,
    sakit: 0,
    alpa: 0,
    catatan_kehadiran: "",
    nilai_sikap: "",
    deskripsi_sikap: ""
  });

  useEffect(() => {
    if (open) {
      setFormData({
        ijin: existingKehadiran?.ijin || 0,
        sakit: existingKehadiran?.sakit || 0,
        alpa: existingKehadiran?.alpa || 0,
        catatan_kehadiran: existingKehadiran?.catatan || "",
        nilai_sikap: existingSikap?.nilai || "",
        deskripsi_sikap: existingSikap?.deskripsi || ""
      });
    }
  }, [open, existingKehadiran, existingSikap]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  const totalKehadiran = parseInt(formData.ijin) + parseInt(formData.sakit) + parseInt(formData.alpa);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Input Kehadiran & Sikap</h2>
                <p className="text-blue-100 text-sm mt-1">{siswa?.nama}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-3">Ketidakhadiran</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ijin
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.ijin}
                  onChange={(e) => handleChange("ijin", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sakit
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sakit}
                  onChange={(e) => handleChange("sakit", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alpa
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.alpa}
                  onChange={(e) => handleChange("alpa", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-3 p-2 bg-white rounded border border-amber-300">
              <span className="text-sm text-gray-600">Total Ketidakhadiran: </span>
              <span className="font-bold text-amber-900">{totalKehadiran} hari</span>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                value={formData.catatan_kehadiran}
                onChange={(e) => handleChange("catatan_kehadiran", e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Catatan kehadiran (opsional)"
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">Nilai Sikap</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nilai <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nilai_sikap}
                onChange={(e) => handleChange("nilai_sikap", e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Pilih Nilai --</option>
                <option value="A">A - Sangat Baik</option>
                <option value="B">B - Baik</option>
                <option value="C">C - Cukup</option>
                <option value="D">D - Kurang</option>
                <option value="E">E - Sangat Kurang</option>
              </select>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.deskripsi_sikap}
                onChange={(e) => handleChange("deskripsi_sikap", e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsi sikap siswa (opsional)"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
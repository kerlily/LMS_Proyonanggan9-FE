// src/pages/guru/hitung_nilai/NilaiSikapForm.jsx
import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";

const NILAI_OPTIONS = [
  { value: "A", label: "A - Sangat Baik", color: "green" },
  { value: "B", label: "B - Baik", color: "blue" },
  { value: "C", label: "C - Cukup", color: "yellow" },
  { value: "D", label: "D - Kurang", color: "orange" },
  { value: "E", label: "E - Sangat Kurang", color: "red" },
];

export default function NilaiSikapForm({ open, onClose, row, semester, onSave }) {
  const [nilai, setNilai] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!row) return;
    
    setNilai(row.nilai || "");
    setDeskripsi(row.deskripsi || "");
    setErrors({});
  }, [row]);

  if (!open || !row) return null;

  const validate = () => {
    const e = {};
    
    if (!nilai) {
      e.nilai = "Pilih nilai sikap";
    }
    
    if (deskripsi && deskripsi.length > 1000) {
      e.deskripsi = "Deskripsi maksimal 1000 karakter";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSave(row.siswa_id, nilai, deskripsi);
  };

  const handleCancel = () => {
    setNilai("");
    setDeskripsi("");
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={handleCancel}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Input Nilai Sikap
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {row.nama} - Semester {semester.nama}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSave} className="px-6 py-6">
            <div className="space-y-6">
              {/* Nilai Sikap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nilai Sikap <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {NILAI_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        nilai === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="nilai"
                        value={option.value}
                        checked={nilai === option.value}
                        onChange={(e) => {
                          setNilai(e.target.value);
                          setErrors((p) => ({ ...p, nilai: null }));
                        }}
                        className={`h-4 w-4 text-${option.color}-600 focus:ring-${option.color}-500`}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.nilai && (
                  <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.nilai}</span>
                  </div>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi / Catatan
                  <span className="ml-2 text-xs text-gray-500">
                    ({deskripsi.length}/1000 karakter)
                  </span>
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => {
                    setDeskripsi(e.target.value);
                    setErrors((p) => ({ ...p, deskripsi: null }));
                  }}
                  rows={5}
                  maxLength={1000}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.deskripsi ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: Siswa menunjukkan sikap yang baik, sopan santun, dan bertanggung jawab..."
                />
                {errors.deskripsi && (
                  <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.deskripsi}</span>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Panduan Penilaian Sikap:
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li><strong>A (Sangat Baik):</strong> Selalu menunjukkan sikap positif, teladan bagi teman</li>
                  <li><strong>B (Baik):</strong> Sering menunjukkan sikap positif</li>
                  <li><strong>C (Cukup):</strong> Kadang-kadang menunjukkan sikap positif</li>
                  <li><strong>D (Kurang):</strong> Jarang menunjukkan sikap positif</li>
                  <li><strong>E (Sangat Kurang):</strong> Tidak menunjukkan sikap positif</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
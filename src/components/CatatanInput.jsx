// src/components/CatatanInput.jsx
import React, { useState, useEffect } from "react";
import { MessageSquare, Save, AlertCircle } from "lucide-react";

/**
 * Component untuk input catatan nilai
 * Mode:
 *  - "manual": langsung tersimpan ke tabel nilai akhir
 *  - "nilai_detail": tersimpan ke tabel catatan_mapel_siswa (butuhkan strukturId)
 *
 * Props:
 *  - mode = "manual" | "nilai_detail"
 *  - siswaId
 *  - mapelId
 *  - strukturId (required untuk mode "nilai_detail")
 *  - initialValue
 *  - onSave: async function(payload) => {}
 *  - disabled
 *  - placeholder
 */
export default function CatatanInput({
  mode = "manual",
  siswaId,
  mapelId,
  strukturId,
  initialValue = "",
  onSave,
  disabled = false,
  placeholder = "Tulis catatan akademik siswa di mapel ini..."
}) {
  const [catatan, setCatatan] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setCatatan(initialValue);
    setHasChanges(false);
  }, [initialValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setCatatan(val);
    setHasChanges(val !== (initialValue ?? ""));
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    if (!onSave || typeof onSave !== "function") {
      console.error("onSave prop is required and must be a function.");
      return;
    }
    if (mode === "nilai_detail" && !strukturId) {
      console.error("strukturId is required when mode === 'nilai_detail'.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        siswa_id: siswaId,
        mapel_id: mapelId,
        struktur_nilai_mapel_id: strukturId ?? null,
        catatan: (catatan ?? "").trim() || null,
        mode
      };

      // onSave should handle API call and return a promise
      await onSave(payload);

      // jika berhasil, tandai tidak ada perubahan lagi
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving catatan:", error);
      // Anda bisa tambahkan Swal atau toast di sini jika ingin notifikasi
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MessageSquare className="w-4 h-4" />
        <span>Catatan Akademik</span>
        {mode === "nilai_detail" && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            (1 catatan untuk seluruh mapel)
          </span>
        )}
      </div>

      <textarea
        value={catatan}
        onChange={handleChange}
        disabled={disabled || saving}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
        rows={3}
      />

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {mode === "manual" && <span>💡 Catatan akan tersimpan langsung di nilai akhir</span>}
          {mode === "nilai_detail" && <span>💡 Catatan akan muncul saat generate nilai akhir</span>}
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        )}
      </div>

      {mode === "nilai_detail" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <strong>Penting:</strong> Catatan ini akan digunakan saat Anda klik "Generate Nilai Akhir".
            Anda bisa mengisi catatan sebelum atau sesudah input nilai formatif.
          </div>
        </div>
      )}
    </div>
  );
}

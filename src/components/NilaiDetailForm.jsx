// src/components/NilaiDetailForm.jsx
import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";

export default function NilaiDetailForm({ open, onClose, row, struktur, onSave }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !row || !struktur) return;

    const initial = {};

    let nilaiData = row.nilai_data;
    if (Array.isArray(nilaiData)) {
      nilaiData = {};
    }

    if (struktur.struktur?.lingkup_materi) {
      struktur.struktur.lingkup_materi.forEach((lm) => {
        const lmKey = lm.lm_key;
        
        if (!initial[lmKey]) {
          initial[lmKey] = {};
        }

        lm.formatif.forEach((fmt) => {
          const existing = nilaiData[lmKey]?.[fmt.kolom_key];
          initial[lmKey][fmt.kolom_key] = existing !== undefined && existing !== null ? String(existing) : "";
        });
      });

      const aslimKey = struktur.struktur.aslim?.kolom_key;
      const asasKey = struktur.struktur.asas?.kolom_key;
      
      if (aslimKey) {
        const aslimValue = nilaiData[aslimKey];
        initial[aslimKey] = aslimValue !== undefined && aslimValue !== null ? String(aslimValue) : "";
      }
      
      if (asasKey) {
        const asasValue = nilaiData[asasKey];
        initial[asasKey] = asasValue !== undefined && asasValue !== null ? String(asasValue) : "";
      }
    }
    
    setValues(initial);
    setErrors({});
  }, [open, row, struktur]);

  if (!open || !row) return null;

  const onChange = (key, value) => {
    const regex = /^\d*(\.\d{0,2})?$/;
    if (value !== "" && !regex.test(value)) return;

    const numValue = parseFloat(value);
    const cappedValue = !isNaN(numValue) && numValue > 100 ? "100" : value;

    setValues(prev => {
      let newValues;
      try {
        newValues = typeof structuredClone === "function" ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
      } catch (err) {
        newValues = { ...prev };
        console.warn("structuredClone failed, using shallow copy:", err);
      }

      if (key.includes(".")) {
        const firstDot = key.indexOf(".");
        const lmKey = key.slice(0, firstDot);
        const kolomKey = key.slice(firstDot + 1);

        if (!newValues[lmKey]) newValues[lmKey] = {};
        newValues[lmKey][kolomKey] = cappedValue;
      } else {
        newValues[key] = cappedValue;
      }

      return newValues;
    });

    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    
    if (struktur.struktur?.lingkup_materi) {
      struktur.struktur.lingkup_materi.forEach((lm) => {
        lm.formatif.forEach((fmt) => {
          const key = `${lm.lm_key}.${fmt.kolom_key}`;
          const val = values[lm.lm_key]?.[fmt.kolom_key] || "";
          
          if (val !== "") {
            const numVal = parseFloat(val);
            if (isNaN(numVal) || numVal < 0 || numVal > 100) {
              e[key] = "Nilai harus 0-100";
            }
          }
        });
      });

      const aslimKey = struktur.struktur.aslim?.kolom_key;
      const asasKey = struktur.struktur.asas?.kolom_key;
      
      [aslimKey, asasKey].filter(Boolean).forEach(key => {
        const val = values[key] || "";
        if (val !== "") {
          const numVal = parseFloat(val);
          if (isNaN(numVal) || numVal < 0 || numVal > 100) {
            e[key] = "Nilai harus 0-100";
          }
        }
      });
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const nilaiData = {};

    if (struktur.struktur?.lingkup_materi) {
      struktur.struktur.lingkup_materi.forEach((lm) => {
        nilaiData[lm.lm_key] = {};

        lm.formatif.forEach((fmt) => {
          const val = values[lm.lm_key]?.[fmt.kolom_key] || "";
          nilaiData[lm.lm_key][fmt.kolom_key] = val !== "" ? parseFloat(val) : null;
        });
      });
    }

    const aslimKey = struktur.struktur?.aslim?.kolom_key;
    if (aslimKey) {
      const val = values[aslimKey] || "";
      nilaiData[aslimKey] = val !== "" ? parseFloat(val) : null;
    }

    const asasKey = struktur.struktur?.asas?.kolom_key;
    if (asasKey) {
      const val = values[asasKey] || "";
      nilaiData[asasKey] = val !== "" ? parseFloat(val) : null;
    }

    try {
      await onSave({
        siswa_id: row.siswa_id,
        nilai_data: nilaiData,
      });
    } catch (err) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl z-10">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Input Nilai Detail
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {row.siswa_nama} - {struktur.mapel?.nama}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSave} className="px-6 py-6">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Lingkup Materi dengan Formatif */}
              {struktur.struktur?.lingkup_materi?.map((lm) => (
                <div key={lm.lm_key} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">
                    {lm.lm_label}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lm.formatif.map((fmt) => {
                      const key = `${lm.lm_key}.${fmt.kolom_key}`;
                      const val = values[lm.lm_key]?.[fmt.kolom_key] || "";
                      
                      return (
                        <div key={fmt.kolom_key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {fmt.kolom_label}
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={val}
                            onChange={(e) => onChange(key, e.target.value)}
                            disabled={saving}
                            className={`w-full border rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                              errors[key] ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="0-100"
                          />
                          {errors[key] && (
                            <div className="mt-1 flex items-center gap-1 text-red-600 text-xs">
                              <AlertCircle className="w-3 h-3" />
                              <span>{errors[key]}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* ASLIM & ASAS */}
              {struktur.struktur?.aslim && struktur.struktur?.asas && (
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-lg mb-3 text-blue-900">
                    Ujian Semester
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ASLIM */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {struktur.struktur.aslim.kolom_label}
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={values[struktur.struktur.aslim.kolom_key] || ""}
                        onChange={(e) => onChange(struktur.struktur.aslim.kolom_key, e.target.value)}
                        disabled={saving}
                        className={`w-full border rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          errors[struktur.struktur.aslim.kolom_key] ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="0-100"
                      />
                      {errors[struktur.struktur.aslim.kolom_key] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors[struktur.struktur.aslim.kolom_key]}</span>
                        </div>
                      )}
                    </div>

                    {/* ASAS */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {struktur.struktur.asas.kolom_label}
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={values[struktur.struktur.asas.kolom_key] || ""}
                        onChange={(e) => onChange(struktur.struktur.asas.kolom_key, e.target.value)}
                        disabled={saving}
                        className={`w-full border rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          errors[struktur.struktur.asas.kolom_key] ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="0-100"
                      />
                      {errors[struktur.struktur.asas.kolom_key] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors[struktur.struktur.asas.kolom_key]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Tips:</strong> Kolom yang dikosongkan akan di-skip saat menyimpan. 
                    Anda bisa input nilai sebagian dulu, lalu melengkapi nanti.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
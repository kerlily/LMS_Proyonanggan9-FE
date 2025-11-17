// src/pages/guru/hitung_nilai/RawNilaiForm.jsx
import React, { useEffect, useState } from "react";

const RawNilaiForm = ({ open, onClose, row, struktur, onSave }) => {
  const [values, setValues] = useState({}); // { lmKey: { kolomKey: value } }
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!row || !struktur) return;
    // initialize from row.nilai_data and struktur shape
    const initial = {};
    struktur.struktur.forEach((lm) => {
      const lmKey = lm.lm_key;
      initial[lmKey] = {};
      lm.kolom.forEach((kol) => {
        const k = kol.kolom_key;
        const existing = row.nilai_data && row.nilai_data[lmKey] ? row.nilai_data[lmKey][k] : "";
        initial[lmKey][k] = existing === null || existing === undefined ? "" : existing;
      });
    });
    setValues(initial);
    setErrors({});
  }, [row, struktur]);

  if (!open || !row) return null;

  const onChange = (lmKey, kolKey, raw) => {
    const v = raw === "" ? "" : Number(raw);
    setValues((p) => ({
      ...p,
      [lmKey]: {
        ...(p[lmKey] || {}),
        [kolKey]: v,
      },
    }));
    setErrors((p) => ({ ...p, [`${lmKey}.${kolKey}`]: null }));
  };

  const validate = () => {
    const e = {};
    struktur.struktur.forEach((lm) => {
      lm.kolom.forEach((kol) => {
        const val = values[lm.lm_key][kol.kolom_key];
        if (val === "" || val === null || val === undefined) {
          // allow empty (teacher might not fill all now) -> do not error
        } else if (isNaN(val) || val < 0 || val > 100) {
          e[`${lm.lm_key}.${kol.kolom_key}`] = "Nilai 0–100";
        }
      });
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // call onSave with structure same as backend expects: nilai_data { lmKey: { kolKey: value } }
    onSave(row.siswa_id, values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="fixed inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Input Nilai — {row.siswa_nama}</h3>
          <button onClick={onClose} className="text-gray-600 px-2 py-1">Tutup</button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {struktur.struktur.map((lm) => (
            <div key={lm.lm_key} className="border rounded p-3">
              <div className="font-medium mb-2 text-lg">{lm.lm_label}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {lm.kolom.map((kol) => {
                  const key = `${lm.lm_key}.${kol.kolom_key}`;
                  const val = values[lm.lm_key] ? values[lm.lm_key][kol.kolom_key] : "";
                  return (
                    <div key={key}>
                      <label className="text-sm font-medium block mb-1">{kol.kolom_label}</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100}
                        value={val ?? ""}
                        onChange={(ev) => onChange(lm.lm_key, kol.kolom_key, ev.target.value)}
                        className="w-full border rounded px-3 py-2 text-lg"
                        aria-label={`${row.siswa_nama} ${lm.lm_label} ${kol.kolom_label}`}
                      />
                      {errors[key] && <div className="text-red-600 text-sm mt-1">{errors[key]}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Batal</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RawNilaiForm;

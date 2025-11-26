// src/test/TestNilaiForm/TestNilaiDetailForm.jsx
import React, { useEffect, useState } from "react";

export default function TestNilaiDetailForm({ open, onClose, row, struktur, onSave }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open || !row || !struktur) return;

    console.log("🔥 Form opened with:", { row, struktur });
    
    // FIX: Handle array empty case
    let nilaiData = row.nilai_data;
    if (Array.isArray(nilaiData)) {
      console.log("🔄 Converting array to object");
      nilaiData = {};
    }
    
    console.log("🔍 Processed nilai_data:", nilaiData);

    const initial = {};

    // Initialize Lingkup Materi
    if (struktur.struktur?.lingkup_materi) {
      struktur.struktur.lingkup_materi.forEach((lm) => {
        const lmKey = lm.lm_key;
        
        if (!initial[lmKey]) {
          initial[lmKey] = {};
        }

        lm.formatif.forEach((fmt) => {
          const existing = nilaiData[lmKey]?.[fmt.kolom_key];
          initial[lmKey][fmt.kolom_key] = existing !== undefined && existing !== null ? existing : "";
        });
      });
    }

    // Initialize ASLIM & ASAS
    const aslimKey = struktur.struktur?.aslim?.kolom_key;
    const asasKey = struktur.struktur?.asas?.kolom_key;
    
    if (aslimKey) {
      initial[aslimKey] = nilaiData[aslimKey] !== undefined && nilaiData[aslimKey] !== null ? nilaiData[aslimKey] : "";
    }
    
    if (asasKey) {
      initial[asasKey] = nilaiData[asasKey] !== undefined && nilaiData[asasKey] !== null ? nilaiData[asasKey] : "";
    }
    
    console.log("🔥 FINAL INITIAL VALUES:", initial);
    setValues(initial);
    setErrors({});
  }, [open, row, struktur]);

  const onChange = (key, value) => {
    console.log("✏️ onChange:", { key, value });

    if (key.includes(".")) {
      const parts = key.split(".");
      const lmKey = parts[0];
      const kolomKey = parts[1];

      setValues(prev => ({
        ...prev,
        [lmKey]: {
          ...(prev[lmKey] || {}),
          [kolomKey]: value
        }
      }));
    } else {
      setValues(prev => ({
        ...prev,
        [key]: value
      }));
    }

    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    
    if (struktur.struktur?.lingkup_materi) {
      struktur.struktur.lingkup_materi.forEach((lm) => {
        lm.formatif.forEach((fmt) => {
          const key = `${lm.lm_key}.${fmt.kolom_key}`;
          const val = values[lm.lm_key]?.[fmt.kolom_key];
          
          if (val !== "" && val !== null && val !== undefined) {
            const numVal = Number(val);
            if (isNaN(numVal) || numVal < 0 || numVal > 100) {
              e[key] = "Nilai harus 0-100";
            }
          }
        });
      });

      // Validate ASLIM & ASAS
      const aslimKey = struktur.struktur.aslim?.kolom_key;
      const asasKey = struktur.struktur.asas?.kolom_key;
      
      [aslimKey, asasKey].filter(Boolean).forEach(key => {
        const val = values[key];
        if (val !== "" && val !== null && val !== undefined) {
          const numVal = Number(val);
          if (isNaN(numVal) || numVal < 0 || numVal > 100) {
            e[key] = "Nilai harus 0-100";
          }
        }
      });
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) {
      alert("Ada error validasi, periksa kembali inputan!");
      return;
    }

    console.log("💾 Saving with values:", values);

    const nilaiData = {};

    // Process Lingkup Materi
    if (struktur.struktur?.lingkup_materi) {
      struktur.struktur.lingkup_materi.forEach((lm) => {
        nilaiData[lm.lm_key] = {};

        lm.formatif.forEach((fmt) => {
          const val = values[lm.lm_key]?.[fmt.kolom_key];
          nilaiData[lm.lm_key][fmt.kolom_key] = 
            val !== "" && val !== null && val !== undefined ? Number(val) : null;
        });
      });
    }

    // Process ASLIM & ASAS
    const aslimKey = struktur.struktur?.aslim?.kolom_key;
    const asasKey = struktur.struktur?.asas?.kolom_key;
    
    if (aslimKey) {
      nilaiData[aslimKey] = 
        values[aslimKey] !== "" && values[aslimKey] !== null && values[aslimKey] !== undefined 
          ? Number(values[aslimKey]) 
          : null;
    }
    
    if (asasKey) {
      nilaiData[asasKey] = 
        values[asasKey] !== "" && values[asasKey] !== null && values[asasKey] !== undefined 
          ? Number(values[asasKey]) 
          : null;
    }

    console.log("🔥 FINAL nilaiData TO SAVE:", nilaiData);

    onSave({
      siswa_id: row.siswa_id,
      nilai_data: nilaiData
    });
  };

  if (!open || !row) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "90vh",
        overflow: "auto"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "10px",
          borderBottom: "1px solid #ddd"
        }}>
          <h2>Input Nilai - {row.siswa_nama}</h2>
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Lingkup Materi */}
          {struktur.struktur?.lingkup_materi?.map((lm) => (
            <div key={lm.lm_key} style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              background: "#f9f9f9"
            }}>
              <h3 style={{ margin: "0 0 10px 0" }}>{lm.lm_label}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                {lm.formatif.map((fmt) => {
                  const key = `${lm.lm_key}.${fmt.kolom_key}`;
                  const val = values[lm.lm_key]?.[fmt.kolom_key];
                  
                  return (
                    <div key={fmt.kolom_key}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                        {fmt.kolom_label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={val === "" || val === null || val === undefined ? "" : val}
                        onChange={(e) => onChange(key, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: errors[key] ? "1px solid red" : "1px solid #ccc",
                          borderRadius: "4px"
                        }}
                        placeholder="0-100"
                      />
                      {errors[key] && (
                        <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                          {errors[key]}
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
            <div style={{
              border: "2px solid #b3d9ff",
              padding: "15px",
              marginBottom: "15px",
              background: "#e6f2ff"
            }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#0066cc" }}>Ujian Semester</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                {/* ASLIM */}
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    {struktur.struktur.aslim.kolom_label} (UTS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={values[struktur.struktur.aslim.kolom_key] === "" || 
                           values[struktur.struktur.aslim.kolom_key] === null || 
                           values[struktur.struktur.aslim.kolom_key] === undefined 
                           ? "" 
                           : values[struktur.struktur.aslim.kolom_key]}
                    onChange={(e) => onChange(struktur.struktur.aslim.kolom_key, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors[struktur.struktur.aslim.kolom_key] ? "1px solid red" : "1px solid #ccc",
                      borderRadius: "4px"
                    }}
                    placeholder="0-100"
                  />
                  {errors[struktur.struktur.aslim.kolom_key] && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                      {errors[struktur.struktur.aslim.kolom_key]}
                    </div>
                  )}
                </div>

                {/* ASAS */}
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    {struktur.struktur.asas.kolom_label} (UAS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={values[struktur.struktur.asas.kolom_key] === "" || 
                           values[struktur.struktur.asas.kolom_key] === null || 
                           values[struktur.struktur.asas.kolom_key] === undefined 
                           ? "" 
                           : values[struktur.struktur.asas.kolom_key]}
                    onChange={(e) => onChange(struktur.struktur.asas.kolom_key, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors[struktur.struktur.asas.kolom_key] ? "1px solid red" : "1px solid #ccc",
                      borderRadius: "4px"
                    }}
                    placeholder="0-100"
                  />
                  {errors[struktur.struktur.asas.kolom_key] && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                      {errors[struktur.struktur.asas.kolom_key]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
            paddingTop: "15px",
            borderTop: "1px solid #ddd"
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
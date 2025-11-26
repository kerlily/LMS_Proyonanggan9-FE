// src/test/TestNilaiForm/TestNilaiForm.jsx
import React, { useEffect, useState } from "react";
import { getNilaiDetail, postNilaiDetailBulk } from "../../_services/nilaiDetail";
import TestNilaiDetailForm from "./TestNilaiDetailForm";

export default function TestNilaiForm() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // Hardcode untuk testing - ganti dengan ID yang sesuai
  const KELAS_ID = 1;
  const STRUKTUR_ID = 19;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("📥 Fetching data...");
      
      const response = await getNilaiDetail(KELAS_ID, STRUKTUR_ID);
      console.log("✅ Data received:", response);
      
      const data = response.data || [];
      console.log("📊 Processed data:", data);
      
      setRows(data);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      alert("Gagal mengambil data: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (row) => {
    console.log("🖊️ Opening form for:", row);
    setSelectedRow(row);
    setFormOpen(true);
  };

  const handleSave = async (saveData) => {
    console.log("💾 Saving data:", saveData);
    
    try {
      const payload = {
        data: [{
          siswa_id: saveData.siswa_id,
          nilai_data: saveData.nilai_data
        }]
      };
      
      console.log("📤 Sending payload:", payload);
      
      const response = await postNilaiDetailBulk(KELAS_ID, STRUKTUR_ID, payload);
      console.log("✅ Save successful:", response);
      
      alert("Data berhasil disimpan!");
      setFormOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("❌ Error saving:", error);
      alert("Gagal menyimpan: " + (error.response?.data?.message || error.message));
    }
  };

  // Hardcode struktur untuk testing - sesuaikan dengan struktur di database
  const testStruktur = {
    id: STRUKTUR_ID,
    mapel: { nama: "MATEMATIKA" },
    struktur: {
      lingkup_materi: [
        {
          lm_key: "lm1",
          lm_label: "Lingkup Materi 1",
          formatif: [
            { kolom_key: "formatif1", kolom_label: "Formatif 1" },
            { kolom_key: "formatif2", kolom_label: "Formatif 2" }
          ]
        },
        {
          lm_key: "lm2", 
          lm_label: "Lingkup Materi 2",
          formatif: [
            { kolom_key: "formatif1", kolom_label: "Formatif 1" },
            { kolom_key: "formatif2", kolom_label: "Formatif 2" }
          ]
        }
      ],
      aslim: {
        kolom_key: "aslim_uts",
        kolom_label: "ASLIM (UTS)"
      },
      asas: {
        kolom_key: "asas_uas", 
        kolom_label: "ASAS (UAS)"
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>TEST FORM NILAI - SIMPLE VERSION</h1>
      <p>Kelas ID: {KELAS_ID} | Struktur ID: {STRUKTUR_ID}</p>
      
      <button 
        onClick={fetchData}
        style={{ 
          padding: "10px 15px", 
          background: "#007bff", 
          color: "white", 
          border: "none", 
          borderRadius: "5px",
          marginBottom: "20px"
        }}
      >
        {loading ? "Loading..." : "Refresh Data"}
      </button>

      <div style={{ marginBottom: "20px" }}>
        <h2>Daftar Siswa ({rows.length})</h2>
        {rows.length === 0 ? (
          <p>No data found</p>
        ) : (
          <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>No</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Nama Siswa</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Nilai Data</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.siswa_id}>
                  <td style={{ padding: "10px" }}>{index + 1}</td>
                  <td style={{ padding: "10px" }}>{row.siswa_nama}</td>
                  <td style={{ padding: "10px" }}>
                    <pre style={{ fontSize: "12px" }}>
                      {JSON.stringify(row.nilai_data, null, 2)}
                    </pre>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <button 
                      onClick={() => handleOpenForm(row)}
                      style={{ 
                        padding: "5px 10px", 
                        background: "#28a745", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "3px" 
                      }}
                    >
                      Input Nilai
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formOpen && selectedRow && (
        <TestNilaiDetailForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          row={selectedRow}
          struktur={testStruktur}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
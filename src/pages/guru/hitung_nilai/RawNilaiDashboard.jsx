// src/pages/guru/hitung_nilai/RawNilaiDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getWaliKelasMe,
  getStrukturNilaiByKelas,
  getNilaiDetail,
  saveBulkNilai,
  generateNilaiAkhir,
} from "../../../_services/nilais";
import RawNilaiForm from "./RawNilaiForm";

const HeaderCard = ({ title, value }) => (
  <div className="bg-white p-3 rounded shadow-sm">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-1 text-2xl font-semibold">{value}</div>
  </div>
);

const RawNilaiDashboard = () => {
  const [loading, setLoading] = useState(false);

  // wali kelas assignments
  const [assignments, setAssignments] = useState([]); // array of objects (each has kelas)
  const [selectedAssignment, setSelectedAssignment] = useState(null); // object
  const [kelasId, setKelasId] = useState(null);

  // struktur list for selected kelas
  const [strukturList, setStrukturList] = useState([]);
  const [selectedStruktur, setSelectedStruktur] = useState(null);

  // nilai data rows
  const [rows, setRows] = useState([]); // [{siswa_id, siswa_nama, nilai_data}]
  const [edited, setEdited] = useState({}); // { siswa_id: nilai_data }
  const [saving, setSaving] = useState(false);

  // modal per siswa
  const [openRow, setOpenRow] = useState(null);

  // generate results
  const [generating, setGenerating] = useState(false);
  const [generateSummary, setGenerateSummary] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await getWaliKelasMe();
      const data = res.data || [];
      setAssignments(data);
      if (data.length === 1) {
        setSelectedAssignment(data[0]);
        setKelasId(data[0].kelas_id);
        fetchStruktur(data[0].kelas_id);
      }
    } catch (err) {
      console.error("fetchAssignments", err);
      alert("Gagal mengambil data wali-kelas. Cek console.");
    } finally {
      setLoading(false);
    }
  };

  const onSelectAssignment = (id) => {
    const a = assignments.find((x) => x.id === Number(id));
    setSelectedAssignment(a || null);
    const kId = a ? a.kelas_id : null;
    setKelasId(kId);
    setSelectedStruktur(null);
    setStrukturList([]);
    setRows([]);
    setEdited({});
    if (kId) fetchStruktur(kId);
  };

  const fetchStruktur = async (kId) => {
    try {
      setLoading(true);
      const res = await getStrukturNilaiByKelas(kId);
      const list = res.data || [];
      setStrukturList(list);
      if (list.length === 1) {
        setSelectedStruktur(list[0]);
        fetchNilaiDetail(kId, list[0].id);
      }
    } catch (err) {
      console.error("fetchStruktur", err);
      alert("Gagal mengambil struktur nilai");
    } finally {
      setLoading(false);
    }
  };

  const onSelectStruktur = (id) => {
    const s = strukturList.find((x) => String(x.id) === String(id));
    setSelectedStruktur(s || null);
    setRows([]);
    setEdited({});
    if (s) fetchNilaiDetail(kelasId, s.id);
  };

  const fetchNilaiDetail = async (kId, strukturId) => {
    if (!kId || !strukturId) return;
    try {
      setLoading(true);
      const res = await getNilaiDetail(kId, strukturId);
      const payload = res.data || {};
      const data = payload.data || [];
      setRows(data);
      setEdited({});
    } catch (err) {
      console.error("fetchNilaiDetail", err);
      alert("Gagal mengambil data nilai detail");
    } finally {
      setLoading(false);
    }
  };

  const openForm = (row) => {
    setOpenRow(row);
  };

  const handleSaveRow = (siswaId, nilaiData) => {
    // update edited map and rows preview
    setEdited((p) => ({ ...p, [siswaId]: nilaiData }));
    // also update rows so list shows changes (non-persisted)
    setRows((prev) =>
      prev.map((r) => (r.siswa_id === siswaId ? { ...r, nilai_data: nilaiData } : r))
    );
    setOpenRow(null);
  };

  const handleSaveAll = async () => {
    if (!selectedStruktur || !kelasId) {
      alert("Pilih kelas dan struktur terlebih dahulu.");
      return;
    }
    // prepare payload array. Merge edited with existing rows: for any siswa, send nilai_data (even if empty)
    const payloadArray = rows.map((r) => {
      const siswaId = r.siswa_id;
      const nilai_data = edited[siswaId] ? edited[siswaId] : r.nilai_data ? r.nilai_data : {};
      return {
        siswa_id: siswaId,
        nilai_data,
      };
    });

    // only send students with any non-empty nilai_data? We send all to be safe.
    try {
      setSaving(true);
      await saveBulkNilai(kelasId, selectedStruktur.id, { data: payloadArray });
      alert("Berhasil menyimpan semua nilai.");
      // clear edited and refresh
      setEdited({});
      fetchNilaiDetail(kelasId, selectedStruktur.id);
    } catch (err) {
      console.error("saveBulkNilai", err);
      alert("Gagal menyimpan. Cek console.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedStruktur || !kelasId) {
      alert("Pilih kelas & struktur terlebih dahulu.");
      return;
    }
    if (!confirm("Generate nilai akhir akan menyimpan nilai akhir ke tabel nilai. Lanjutkan?")) return;
    try {
      setGenerating(true);
      setGenerateSummary(null);
      const res = await generateNilaiAkhir(kelasId, selectedStruktur.id);
      const payload = res.data || {};
      setGenerateSummary(payload.summary || null);
      alert("Generate selesai. Lihat ringkasan di bawah.");
      // optionally refresh rows & maybe master nilai table later
      fetchNilaiDetail(kelasId, selectedStruktur.id);
    } catch (err) {
      console.error("generateNilaiAkhir", err);
      alert("Gagal generate. Cek console.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Input Nilai — Wali Kelas</h1>
          <div className="text-sm text-gray-500">Pilih kelas & mapel, lalu isi nilai. UI dirancang untuk guru.</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pilih Kelas</label>
          <select
            value={selectedAssignment ? selectedAssignment.id : ""}
            onChange={(e) => onSelectAssignment(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Pilih Kelas --</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.kelas?.nama ?? `Kelas ${a.kelas_id}`} — Tahun {a.tahun_ajaran?.nama ?? a.tahun_ajaran_id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Pilih Mapel / Struktur</label>
          <select
            value={selectedStruktur ? selectedStruktur.id : ""}
            onChange={(e) => onSelectStruktur(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={!selectedAssignment}
          >
            <option value="">-- Pilih Mapel --</option>
            {strukturList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.mapel?.nama ?? `Mapel ${s.mapel_id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleSaveAll}
            className="px-4 py-3 bg-green-600 text-white rounded w-full"
            disabled={saving || !selectedStruktur}
          >
            {saving ? "Menyimpan..." : "Simpan Semua"}
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-3 bg-blue-600 text-white rounded w-full"
            disabled={generating || !selectedStruktur}
          >
            {generating ? "Generating..." : "Generate Nilai Akhir"}
          </button>
        </div>
      </div>

      {/* info / struktur preview */}
      {selectedStruktur && (
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="mb-2 font-medium">Struktur: {selectedStruktur.mapel?.nama ?? "—"}</div>
          <div className="text-sm text-gray-600">
            {selectedStruktur.struktur.map((lm) => (
              <div key={lm.lm_key} className="mb-2">
                <div className="font-semibold">{lm.lm_label}</div>
                <div className="text-sm text-gray-700">
                  {lm.kolom.map((k) => k.kolom_label).join(" • ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* list siswa */}
      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Nama Siswa</th>
              <th className="px-4 py-2 text-left">Status Nilai</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  {loading ? "Loading..." : "Belum ada data. Pilih struktur lalu load."}
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const hasAny = r.nilai_data && Object.keys(r.nilai_data).length > 0;
                return (
                  <tr key={r.siswa_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{r.siswa_nama}</td>
                    <td className="px-4 py-3">
                      {hasAny ? (
                        <div className="text-green-700 font-medium">Ada nilai</div>
                      ) : (
                        <div className="text-gray-500">Kosong</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openForm(r)}
                        className="px-3 py-1 border rounded bg-white"
                      >
                        Input / Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* generate summary */}
      {generateSummary && (
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="font-semibold mb-2">Hasil Generate</div>
          <div>Success: {generateSummary.success}</div>
          <div>Failed: {generateSummary.failed}</div>
          {generateSummary.details && generateSummary.details.length > 0 && (
            <div className="mt-2">
              <div className="font-medium">Detail error:</div>
              <ul className="list-disc list-inside">
                {generateSummary.details.map((d) => (
                  <li key={d.siswa_id}>
                    Siswa ID {d.siswa_id}: {d.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* modal */}
      {openRow && selectedStruktur && (
        <RawNilaiForm
          open={!!openRow}
          onClose={() => setOpenRow(null)}
          row={openRow}
          struktur={selectedStruktur}
          onSave={handleSaveRow}
        />
      )}
    </div>
  );
};

export default RawNilaiDashboard;

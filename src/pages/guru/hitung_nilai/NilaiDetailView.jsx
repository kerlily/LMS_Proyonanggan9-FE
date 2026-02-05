/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/pages/guru/hitung_nilai/NilaiDetailView.jsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Search, FileSpreadsheet } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GuruLayout from "../../../components/layout/GuruLayout";
import NilaiTable from "../../../components/NilaiTable";
import { LoadingSpinner, TableLoadingSkeleton } from "../../../components/LoadingSkeleton";
import { showByGuru, getSemesterByTahunAjaran } from "../../../_services/waliKelas";
import { getStrukturNilai, getNilaiDetail } from "../../../_services/nilaiDetail";
import api from "../../../_api";

export default function NilaiDetailView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false); 
  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [kelasId, setKelasId] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [strukturList, setStrukturList] = useState([]);
  const [selectedStruktur, setSelectedStruktur] = useState(null);
  const [nilaiData, setNilaiData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Check if came from dashboard with pre-selected data
  useEffect(() => {
    const state = location.state;
    if (state?.kelasId && state?.semesterId && state?.strukturId) {
      setKelasId(state.kelasId);
    }
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (kelasId && selectedSemester) {
      fetchStruktur();
    }
  }, [kelasId, selectedSemester]);

  useEffect(() => {
    if (selectedStruktur?.id && kelasId) {
      fetchNilaiData();
    }
  }, [selectedStruktur, kelasId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const resYear = await api.get("/tahun-ajaran/active");
      const yearData = resYear.data?.data || resYear.data;
      setTahunAjaran(yearData);

      const resWali = await showByGuru(yearData?.id);
      const data = resWali.data || [];
      setAssignments(data);

      // Check if came from dashboard with state
      const state = location.state;
      
      if (state?.kelasId) {
        // Find and auto-select assignment based on kelasId dari state
        const matchedAssignment = data.find(a => a.kelas_id === state.kelasId);
        if (matchedAssignment) {
          setSelectedAssignment(matchedAssignment);
          setKelasId(matchedAssignment.kelas_id);
        }
      } else if (data.length === 1) {
        // Auto-select jika hanya 1 kelas
        setSelectedAssignment(data[0]);
        setKelasId(data[0].kelas_id);
      }

      if (yearData?.id) {
        const resSem = await getSemesterByTahunAjaran(yearData.id);
        const semList = resSem.data?.data ?? resSem.data ?? [];
        setSemesters(Array.isArray(semList) ? semList : []);

        if (state?.semesterId) {
          // Auto-select semester dari state
          const matchedSemester = semList.find(s => s.id === state.semesterId);
          if (matchedSemester) {
           setSelectedSemester(matchedSemester);
          }
        } else {
          // Fallback ke active semester
          const activeSem = semList.find((s) => s.is_active);
          if (activeSem) {
            setSelectedSemester(activeSem);
          }
        }
      }
    } catch (err) {
      console.error("❌ fetchInitialData error:", err);
      setError(err?.response?.data?.message || "Gagal memuat data awal");
    } finally {
      setLoading(false);
    }
  };

  const fetchStruktur = async () => {
    if (!kelasId || !selectedSemester) return;

    try {
      setLoading(true);
      setError(null);
      setNilaiData([]); // Clear old data

      const res = await getStrukturNilai(kelasId, {
        semester_id: selectedSemester.id,
      });
      const payload = res?.data ?? res;
      const list = Array.isArray(payload)
        ? payload
        : payload?.data ?? payload ?? [];
      
      const validList = Array.isArray(list) ? list : [];
      setStrukturList(validList);

      // Check if came from dashboard with strukturId
      const state = location.state;
      
      if (state?.strukturId) {
        // Auto-select struktur dari state
        const matchedStruktur = validList.find(s => s.id === state.strukturId);
        if (matchedStruktur) {
         setSelectedStruktur(matchedStruktur);
          // Clear state setelah digunakan agar tidak conflict dengan manual selection
          window.history.replaceState({}, document.title);
        }
      } else if (validList.length === 1) {
        // Fallback: Auto-select jika hanya 1 struktur
        setSelectedStruktur(validList[0]);
      }
    } catch (err) {
      console.error("❌ fetchStruktur error:", err);
      setError("Gagal mengambil struktur nilai");
      setStrukturList([]);
      setNilaiData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNilaiData = async () => {
    if (!kelasId || !selectedStruktur?.id) return;

    try {
      setLoadingTable(true); // Use separate loading state
      setError(null);

      const res = await getNilaiDetail(kelasId, selectedStruktur.id);
      const payload = res?.data ?? res;

      // Update struktur jika ada di response
      if (payload?.struktur) {
        setSelectedStruktur((prev) => ({
          ...prev,
          ...payload.struktur,
        }));
      }

      // Extract rows
      const rowsArray = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      // Normalize nilai_data
      const normalizeRow = (r) => {
        const nd = r?.nilai_data;
        let nilaiObj = {};

        if (nd == null) {
          nilaiObj = {};
        } else if (typeof nd === "string") {
          try {
            nilaiObj = JSON.parse(nd);
          } catch (e) {
            console.warn("⚠️ Failed parse nilai_data for siswa:", r.siswa_id, e);
            nilaiObj = {};
          }
        } else if (Array.isArray(nd)) {
          nilaiObj = {};
        } else if (typeof nd === "object") {
          nilaiObj = nd;
        }

        return { ...r, nilai_data: nilaiObj };
      };

      const finalRows = rowsArray.map(normalizeRow);
      setNilaiData(finalRows);
    } catch (err) {
      console.error("❌ fetchNilaiData error:", err);
      setError("Gagal mengambil data nilai: " + (err?.response?.data?.message || err.message));
      setNilaiData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  const onSelectAssignment = (id) => {
    const a = assignments.find((x) => x.id === Number(id));
    setSelectedAssignment(a || null);
    setKelasId(a ? a.kelas_id : null);
    resetData();
  };

  const onSelectSemester = (id) => {
    const sem = semesters.find((s) => s.id === Number(id));
    setSelectedSemester(sem);
    resetData();
  };

  const onSelectStruktur = (id) => {
    const s = strukturList.find((x) => String(x.id) === String(id));
    setSelectedStruktur(s || null);
    setNilaiData([]);
    setError(null); // Clear error when changing struktur
  };

  const resetData = () => {
    setSelectedStruktur(null);
    setStrukturList([]);
    setNilaiData([]);
    setError(null);
  };

  // Filter siswa berdasarkan search
  const filteredData = nilaiData.filter((row) =>
    row.siswa_nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const kelasName = selectedAssignment?.kelas?.nama || "—";
  const mapelName = selectedStruktur?.mapel?.nama || "—";

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/guru/nilai-detail"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8" />
                  Data Nilai Siswa
                </h1>
                <p className="text-indigo-100">
                  Tampilan data nilai dalam format tabel
                </p>
              </div>
            </div>
            {tahunAjaran && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-xs text-indigo-100">Tahun Ajaran</div>
                <div className="text-lg font-bold">{tahunAjaran.nama}</div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
            Filter Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kelas
              </label>
              <select
                value={selectedAssignment?.id || ""}
                onChange={(e) => onSelectAssignment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Pilih Kelas --</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.kelas?.nama ?? `Kelas ${a.kelas_id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Semester
              </label>
              <select
                value={selectedSemester?.id || ""}
                onChange={(e) => onSelectSemester(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={!kelasId}
              >
                <option value="">-- Pilih Semester --</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} {s.is_active && "(Aktif)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Mapel
              </label>
              <select
                value={selectedStruktur?.id || ""}
                onChange={(e) => onSelectStruktur(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={!selectedSemester}
              >
                <option value="">-- Pilih Mapel --</option>
                {strukturList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.mapel?.nama ?? `Mapel ${s.mapel_id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Siswa
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nama siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={!selectedStruktur}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingTable && <TableLoadingSkeleton rows={8} columns={10} />}

        {/* Table */}
        {!loadingTable && !loading && selectedStruktur && (
          <NilaiTable
            data={filteredData}
            struktur={selectedStruktur}
            kelas={{ nama: kelasName }}
            mapel={{ nama: mapelName }}
            semester={selectedSemester}
          />
        )}

        {/* Empty State */}
        {!loadingTable && !loading && !selectedStruktur && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Pilih Data untuk Ditampilkan
            </h3>
            <p className="text-gray-500">
              Pilih kelas, semester, dan mapel untuk melihat data nilai siswa
            </p>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
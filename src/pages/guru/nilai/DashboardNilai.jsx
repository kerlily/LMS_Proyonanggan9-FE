// src/pages/guru/nilai/DashboardNilai.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AlertCircle, RefreshCw } from "lucide-react";
import GuruLayout from "../../../components/layout/GuruLayout";
import FilterKelasNilai from "../../../components/FilterKelasNilai";
import TabelNilaiSiswa from "../../../components/TabelNilaiSiswa";
import NilaiStatsCards from "../../../components/StatsCard";
import { getNilaiByKelas, storeNilai } from "../../../_services/nilai";
import { showByGuru, getSemesterByTahunAjaran } from "../../../_services/waliKelas";
import api from "../../../_api";

export default function DashboardNilai() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  // Filter states
  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  
  // Data state
  const [nilaiData, setNilaiData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch semesters when tahun ajaran changes
  useEffect(() => {
    if (tahunAjaran?.id) {
      fetchSemesters();
    }
  }, [tahunAjaran]);

  // Fetch nilai when both kelas and semester are selected
  useEffect(() => {
    if (selectedAssignment && selectedSemester) {
      fetchNilaiData();
    } else {
      setNilaiData([]);
    }
  }, [selectedAssignment, selectedSemester]);

  const fetchInitialData = async () => {
    try {
      setLoadingInitial(true);
      setError(null);

      // Fetch active tahun ajaran
      const resYear = await api.get("/tahun-ajaran/active");
      const yearData = resYear.data?.data || resYear.data;
      setTahunAjaran(yearData);

      // Fetch wali kelas assignments
      const resWali = await showByGuru(yearData?.id);
      const data = resWali.data || [];
      setAssignments(data);

      // Auto-select if only one assignment
      if (data.length === 1) {
        setSelectedAssignment(data[0]);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err?.response?.data?.message || "Gagal memuat data awal");
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchSemesters = async () => {
    if (!tahunAjaran?.id) return;

    try {
      const resSem = await getSemesterByTahunAjaran(tahunAjaran.id);
      const semList = resSem.data?.data ?? resSem.data ?? [];
      setSemesters(Array.isArray(semList) ? semList : []);

      // Auto-select active semester
      const activeSem = (Array.isArray(semList) ? semList : []).find(s => s.is_active);
      if (activeSem) {
        setSelectedSemester(activeSem);
      } else if (semList.length > 0) {
        setSelectedSemester(semList[0]);
      }
    } catch (err) {
      console.error("Error fetching semesters:", err);
      setSemesters([]);
    }
  };

  const fetchNilaiData = async () => {
    if (!selectedAssignment || !selectedSemester) return;

    try {
      setLoading(true);
      setError(null);

      const kelasId = selectedAssignment.kelas_id;
      const response = await getNilaiByKelas(kelasId, {
        semester_id: selectedSemester.id
      });

      const data = response.data?.data || response.data || [];
      setNilaiData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching nilai:", err);
      setError(err?.response?.data?.message || "Gagal memuat data nilai");
      setNilaiData([]);
    } finally {
      setLoading(false);
    }
  };

  const onSelectAssignment = (id) => {
    const a = assignments.find((x) => x.id === Number(id));
    setSelectedAssignment(a || null);
    setNilaiData([]);
    setError(null);
  };

  const onSelectSemester = (id) => {
    const sem = semesters.find(s => s.id === Number(id));
    setSelectedSemester(sem || null);
    setNilaiData([]);
    setError(null);
  };

  const handleUpdateNilai = async (nilaiObj) => {
    try {
      const payload = {
        siswa_id: nilaiObj.siswa_id,
        mapel_id: nilaiObj.mapel_id,
        semester_id: selectedSemester.id,
        nilai: nilaiObj.nilai === null || nilaiObj.nilai === "" ? null : Number(nilaiObj.nilai),
        catatan: nilaiObj.catatan || "-",
      };

      // Both create and update use POST (as per backend requirement)
      await storeNilai(selectedAssignment.kelas_id, payload);

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Nilai ${nilaiObj.mapel_nama} untuk ${nilaiObj.siswa_nama} berhasil disimpan`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh data
      await fetchNilaiData();
    } catch (error) {
      console.error("Error updating nilai:", error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error?.response?.data?.message || "Gagal menyimpan nilai",
      });
    }
  };

  const handleGoToNilaiSikap = () => {
    navigate("/guru/nilai-sikap");
  };

  const handleRefresh = () => {
    if (selectedAssignment && selectedSemester) {
      fetchNilaiData();
    }
  };

  const kelasName = selectedAssignment?.kelas?.nama || "—";

  if (loadingInitial) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Nilai Akhir</h1>
              <p className="text-blue-100">
                Kelola nilai akhir siswa per mata pelajaran dan semester
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading || !selectedAssignment || !selectedSemester}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleGoToNilaiSikap}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Nilai Sikap & Ketidakhadiran
              </button>
            </div>
          </div>
        </div>

        {/* Tahun Ajaran Info */}
        {tahunAjaran && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-amber-700 font-medium">Tahun Ajaran Aktif</div>
                <div className="text-lg font-bold text-amber-900">{tahunAjaran.nama}</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <FilterKelasNilai
          assignments={assignments}
          selectedAssignment={selectedAssignment}
          onSelectAssignment={onSelectAssignment}
          semesters={semesters}
          selectedSemester={selectedSemester}
          onSelectSemester={onSelectSemester}
          loading={loading}
        />

        {/* Stats */}
        {selectedAssignment && selectedSemester && nilaiData.length > 0 && (
          <NilaiStatsCards data={nilaiData} />
        )}

        {/* Content Info */}
        {selectedAssignment && selectedSemester && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Daftar Nilai - {kelasName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSemester.nama} • Tahun Ajaran {tahunAjaran?.nama}
                </p>
              </div>
            </div>

            {/* Table */}
            <TabelNilaiSiswa
              data={nilaiData}
              onUpdateNilai={handleUpdateNilai}
              loading={loading}
              semesterId={selectedSemester.id}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !selectedAssignment && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pilih Kelas untuk Memulai
            </h3>
            <p className="text-gray-600">
              Pilih kelas dan semester untuk melihat dan mengelola nilai siswa
            </p>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
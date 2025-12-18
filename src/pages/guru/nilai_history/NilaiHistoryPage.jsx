// src/pages/guru/nilai_history/NilaiHistoryPage.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  History,
  ChevronLeft,
  AlertCircle,
  School,
  Loader2,
  TrendingUp,
} from "lucide-react";

import GuruLayout from "../../../components/layout/GuruLayout";
import NilaiAkhirHistoryCard from "../../../components/guru/NilaiHistoryCard";
import SemesterNilaiList from "../../../components/guru/SemesterNilaiList";
import SiswaNilaiModal from "../../../components/guru/SiswaNilaiModal";

import { showByGuru } from "../../../_services/waliKelas";
import {
  getNilaiHistory,
  getNilaiHistoryDetail,
} from "../../../_services/nilaiHistory";

export default function NilaiHistoryPage() {
  const [loading, setLoading] = useState(true);

  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState(null);

  const [historyData, setHistoryData] = useState(null);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);

  // modal detail siswa
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  /* ===================== LOAD KELAS ===================== */
  useEffect(() => {
    loadKelasList();
  }, []);

  const loadKelasList = async () => {
    try {
      setLoading(true);
      const res = await showByGuru();
      const kelas = res.data || [];

      if (kelas.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Tidak Ada Kelas",
          text: "Anda belum menjadi wali kelas. Silakan hubungi admin.",
        });
        return;
      }

      setKelasList(kelas);

      // auto select kalau cuma 1 kelas
      if (kelas.length === 1) {
        handleSelectKelas(kelas[0].kelas);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Gagal memuat kelas",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===================== SELECT KELAS ===================== */
  const handleSelectKelas = async (kelas) => {
    try {
      setLoading(true);
      setSelectedKelas(kelas);
      setSelectedTahunAjaran(null);
      setHistoryData(null);

      const res = await getNilaiHistory(kelas.id);
      setHistoryData(res.data);

      if (res.data?.tahun_ajaran_list?.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Belum Ada Data",
          text: `Belum ada nilai untuk kelas ${kelas.nama}`,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Gagal memuat history nilai",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===================== NAVIGATION ===================== */
  const handleViewTahunAjaran = (tahun) => {
    setSelectedTahunAjaran(tahun);
  };

  const handleBackToTahunList = () => {
    setSelectedTahunAjaran(null);
  };

  const handleBackToKelasList = () => {
    setSelectedKelas(null);
    setSelectedTahunAjaran(null);
    setHistoryData(null);
  };

  /* ===================== DETAIL SISWA ===================== */
  const handleViewDetailSiswa = async (mapelData) => {
    try {
      setModalOpen(true);
      setModalLoading(true);
      setModalData(null);

      const params = {
        kelas_id: selectedKelas.id,
        mapel_id: mapelData.mapel.id,
        semester_id: mapelData.semester.semester.id,
        tahun_ajaran_id: selectedTahunAjaran.tahun_ajaran.id,
      };

      const res = await getNilaiHistoryDetail(params);
      setModalData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Gagal memuat detail siswa",
      });
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  /* ===================== LOADING ===================== */
  if (loading && !historyData) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>
      </GuruLayout>
    );
  }

  /* ===================== VIEW: PILIH KELAS ===================== */
  if (!selectedKelas) {
    return (
      <GuruLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <History className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">History Nilai Akhir</h1>
              <p className="text-sm text-slate-600">
                Lihat nilai dari tahun ajaran sebelumnya
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {kelasList.map((wk) => (
              <button
                key={wk.id}
                onClick={() => handleSelectKelas(wk.kelas)}
               className="bg-white p-6 rounded-xl border border-slate-300 hover:border-indigo-500 text-left"
>
                <div className="flex gap-4">
                  <School className="text-indigo-600" />
                  <div>
                    <h3 className="font-bold">{wk.kelas.nama}</h3>
                    <p className="text-sm text-slate-600">
                      Tingkat {wk.kelas.tingkat} {wk.kelas.section}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </GuruLayout>
    );
  }

  /* ===================== VIEW: TAHUN AJARAN ===================== */
  if (!selectedTahunAjaran) {
    return (
      <GuruLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <button
            onClick={handleBackToKelasList}
            className="flex items-center gap-2 text-indigo-600"
          >
            <ChevronLeft /> Kembali
          </button>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyData?.tahun_ajaran_list?.map((tahun, i) => (
              <NilaiAkhirHistoryCard
                key={i}
                tahunAjaran={tahun}
                onClick={() => handleViewTahunAjaran(tahun)}
              />
            ))}
          </div>
        </div>
      </GuruLayout>
    );
  }

  /* ===================== VIEW: DETAIL ===================== */
  return (
    <GuruLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={handleBackToTahunList}
          className="flex items-center gap-2 text-indigo-600"
        >
          <ChevronLeft /> Kembali ke Tahun Ajaran
        </button>

        <SemesterNilaiList
          semesterList={selectedTahunAjaran.semester_list}
          onViewDetail={handleViewDetailSiswa}
        />

        <SiswaNilaiModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          data={modalData}
          loading={modalLoading}
        />
      </div>
    </GuruLayout>
  );
}

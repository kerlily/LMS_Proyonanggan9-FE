// src/_services/nilaiHistory.js
import api from "../_api";

/**
 * Get nilai detail history untuk semua tahun ajaran yang diampu guru
 * @param {number} kelasId - ID kelas
 * @returns {Promise}
 */
export const getNilaiDetailHistory = (kelasId) => {
  return api.get("/wali-kelas/nilai-detail/history", {
    params: { kelas_id: kelasId }
  });
};

/**
 * Get nilai AKHIR history untuk semua tahun ajaran yang diampu guru
 * @param {number} kelasId - ID kelas
 * @returns {Promise}
 */
export const getNilaiHistory = (kelasId) => {
  return api.get("/wali-kelas/nilai-history", {
    params: { kelas_id: kelasId }
  });
};

/**
 * Get detail nilai siswa per mapel
 * @param {object} params - { kelas_id, mapel_id, semester_id, tahun_ajaran_id }
 * @returns {Promise}
 */
export const getNilaiHistoryDetail = (params) => {
  return api.get("/wali-kelas/nilai-history/detail", { params });
};

export default {
  getNilaiDetailHistory,
  getNilaiHistory,
  getNilaiHistoryDetail,
};
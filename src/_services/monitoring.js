// src/_services/monitoring.js
import api from "../_api";

/**
 * Get monitoring overview semua kelas
 * @param {object} params - { semester_id, tahun_ajaran_id, kelas_id, guru_id, completion_below }
 * @returns {Promise}
 */
export const getMonitoring = (params = {}) => {
  return api.get("/admin/nilai-akhir/monitoring", { params });
};

/**
 * Get detail siswa yang belum punya nilai di kelas tertentu
 * @param {number} kelasId - ID kelas
 * @param {object} params - { semester_id, tahun_ajaran_id, mapel_id }
 * @returns {Promise}
 */
export const getMissingDetail = (kelasId, params = {}) => {
  return api.get(`/admin/nilai-akhir/monitoring/kelas/${kelasId}/missing`, { params });
};

export default {
  getMonitoring,
  getMissingDetail,
};
import api from "../_api";

/**
 * Jadwal Service
 * Service untuk manage jadwal sekolah (slot-based system)
 */

const jadwalService = {
  /**
   * Get jadwal untuk kelas tertentu
   * @param {number} kelasId - ID kelas
   * @param {object} params - Query params (semester_id, tahun_ajaran_id)
   * @returns {Promise}
   */
  getJadwalByKelas: (kelasId, params = {}) => {
    return api.get(`/kelas/${kelasId}/jadwal`, { params });
  },

  /**
   * Create jadwal baru untuk kelas
   * @param {number} kelasId - ID kelas
   * @param {object} data - Jadwal data (nama, semester_id, tahun_ajaran_id, slots)
   * @returns {Promise}
   */
  createJadwal: (kelasId, data) => {
    return api.post(`/kelas/${kelasId}/jadwal`, data);
  },

  /**
   * Update jadwal existing
   * @param {number} kelasId - ID kelas
   * @param {number} jadwalId - ID jadwal
   * @param {object} data - Updated jadwal data
   * @returns {Promise}
   */
  updateJadwal: (kelasId, jadwalId, data) => {
    return api.put(`/kelas/${kelasId}/jadwal/${jadwalId}`, data);
  },

  /**
   * Delete jadwal
   * @param {number} kelasId - ID kelas
   * @param {number} jadwalId - ID jadwal
   * @returns {Promise}
   */
  deleteJadwal: (kelasId, jadwalId) => {
    return api.delete(`/kelas/${kelasId}/jadwal/${jadwalId}`);
  },

  /**
   * Get tahun ajaran aktif
   * @returns {Promise}
   */
  getTahunAjaranAktif: () => {
    return api.get("/tahun-ajaran/active");
  },

  /**
   * Get all mapel (untuk dropdown)
   * @returns {Promise}
   */
  getAllMapel: () => {
    return api.get("/mapel/all");
  },

  /**
   * Get wali kelas list (kelas yang diampu guru login)
   * @returns {Promise}
   */
  getWaliKelasList: () => {
    return api.get("/wali-kelas/me");
  },
};

export default jadwalService;
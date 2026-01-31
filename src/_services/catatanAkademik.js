// src/_services/catatanAkademik.js
import api from "../_api";

/**
 * Get list struktur nilai yang tersedia untuk input catatan
 * (Semua struktur di kelas & semester, tidak perlu ada nilai detail)
 */
export const getAvailableStruktur = (kelasId, params = {}) => {
  return api.get(`/kelas/${kelasId}/struktur-nilai/available-for-catatan`, { params });
};

/**
 * Get existing catatan untuk satu struktur
 */
export const getCatatanByStruktur = (kelasId, strukturId) => {
  return api.get(`/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan`);
};

/**
 * Save catatan untuk banyak siswa sekaligus
 */
export const saveBulkCatatan = (kelasId, strukturId, catatanData) => {
  return api.post(
    `/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan/bulk`,
    { catatan_data: catatanData }
  );
};

/**
 * Save catatan untuk satu siswa
 */
export const saveSingleCatatan = (kelasId, strukturId, siswaId, catatan) => {
  return api.post(
    `/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan/single`,
    { siswa_id: siswaId, catatan }
  );
};

/**
 * Delete catatan siswa
 */
export const deleteCatatan = (kelasId, strukturId, siswaId) => {
  return api.delete(
    `/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan/${siswaId}`
  );
};

/**
 * Get catatan siswa untuk rapor (admin/guru)
 */
export const getCatatanBySiswa = (siswaId, params = {}) => {
  return api.get(`/siswa/${siswaId}/catatan-akademik`, { params });
};

export default {
  getAvailableStruktur,
  getCatatanByStruktur,
  saveBulkCatatan,
  saveSingleCatatan,
  deleteCatatan,
  getCatatanBySiswa,
};
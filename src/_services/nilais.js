// src/_services/nilai.js
import api from "../_api";

/**
 * GET /wali-kelas/me
 * returns array of assignments (kelas yg diampu)
 */
export const getWaliKelasMe = () => api.get("/wali-kelas/me");

/**
 * GET /kelas/{kelas_id}/struktur-nilai
 * returns array of struktur objects (with struktur array inside)
 */
export const getStrukturNilaiByKelas = (kelasId, params = {}) =>
  api.get(`/kelas/${kelasId}/struktur-nilai`, { params });

/**
 * GET /kelas/{kelas_id}/struktur-nilai/{struktur_id}/nilai-detail
 * returns { struktur, data: [...] }
 */
export const getNilaiDetail = (kelasId, strukturId) =>
  api.get(`/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail`);

/**
 * POST /kelas/{kelas_id}/struktur-nilai/{struktur_id}/nilai-detail/bulk
 * payload: { data: [ { siswa_id, nilai_data: { lmKey: { kolomKey: value }}} ] }
 */
export const saveBulkNilai = (kelasId, strukturId, payload) =>
  api.post(`/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail/bulk`, payload);

/**
 * POST /kelas/{kelas_id}/struktur-nilai/{struktur_id}/generate
 * generate nilai akhir
 */
export const generateNilaiAkhir = (kelasId, strukturId) =>
  api.post(`/kelas/${kelasId}/struktur-nilai/${strukturId}/generate`);

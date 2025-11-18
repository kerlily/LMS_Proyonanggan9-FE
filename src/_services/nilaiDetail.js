// src/_services/nilaiDetail.js
import api from "../_api";

/**
 * GET /kelas/{kelas_id}/struktur-nilai?semester_id={semester_id}
 * Get all struktur for a kelas (optionally filtered by semester)
 */
export async function getStrukturNilai(kelasId, params = {}) {
  const url = `/kelas/${kelasId}/struktur-nilai`;
  const res = await api.get(url, { params });
  return res.data;
}

/**
 * GET /kelas/{kelas_id}/struktur-nilai/{struktur_id}
 * Get single struktur detail
 */
export async function getStrukturById(kelasId, strukturId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}`;
  const res = await api.get(url);
  return res.data;
}

/**
 * GET /kelas/{kelas_id}/struktur-nilai/mapel/{mapel_id}/semester/{semester_id}
 * Get struktur by mapel and semester
 */
export async function getStrukturByMapelSemester(kelasId, mapelId, semesterId) {
  const url = `/kelas/${kelasId}/struktur-nilai/mapel/${mapelId}/semester/${semesterId}`;
  const res = await api.get(url);
  return res.data;
}

/**
 * GET /kelas/{kelas_id}/struktur-nilai/{struktur_id}/nilai-detail
 * Get nilai detail for all students in a struktur
 */
export async function getNilaiDetail(kelasId, strukturId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail`;
  const res = await api.get(url);
  return res.data;
}

/**
 * POST /kelas/{kelas_id}/struktur-nilai/{struktur_id}/nilai-detail/bulk
 * Save bulk nilai detail
 */
export async function postNilaiDetailBulk(kelasId, strukturId, payload) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail/bulk`;
  const res = await api.post(url, payload);
  return res.data;
}

/**
 * POST /kelas/{kelas_id}/struktur-nilai/{struktur_id}/generate-nilai-akhir
 * Generate final grades from detail scores
 */
export async function generateNilaiAkhir(kelasId, strukturId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/generate-nilai-akhir`;
  const res = await api.post(url);
  return res.data;
}

/**
 * GET /kelas/{kelas_id}/struktur-nilai/{struktur_id}/siswa/{siswa_id}
 * Get detail nilai for specific student
 */
export async function getSiswaDetail(kelasId, strukturId, siswaId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/siswa/${siswaId}`;
  const res = await api.get(url);
  return res.data;
}

export default {
  getStrukturNilai,
  getStrukturById,
  getStrukturByMapelSemester,
  getNilaiDetail,
  postNilaiDetailBulk,
  generateNilaiAkhir,
  getSiswaDetail,
};
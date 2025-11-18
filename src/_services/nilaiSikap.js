// src/_services/nilaiSikap.js
import api from "../_api";

/**
 * GET /kelas/{kelas_id}/nilai-sikap?semester_id={semester_id}
 * Get nilai sikap for all students in a class
 */
export async function getNilaiSikap(kelasId, params = {}) {
  const url = `/kelas/${kelasId}/nilai-sikap`;
  const res = await api.get(url, { params });
  return res.data;
}

/**
 * POST /kelas/{kelas_id}/nilai-sikap
 * Store/update single nilai sikap
 */
export async function storeNilaiSikap(kelasId, payload) {
  const url = `/kelas/${kelasId}/nilai-sikap`;
  const res = await api.post(url, payload);
  return res.data;
}

/**
 * POST /kelas/{kelas_id}/nilai-sikap/bulk
 * Bulk store nilai sikap
 */
export async function bulkStoreNilaiSikap(kelasId, payload) {
  const url = `/kelas/${kelasId}/nilai-sikap/bulk`;
  const res = await api.post(url, payload);
  return res.data;
}

/**
 * DELETE /kelas/{kelas_id}/nilai-sikap/{id}
 * Delete nilai sikap
 */
export async function deleteNilaiSikap(kelasId, id) {
  const url = `/kelas/${kelasId}/nilai-sikap/${id}`;
  const res = await api.delete(url);
  return res.data;
}

/**
 * GET /siswa/me/nilai-sikap
 * Get nilai sikap for logged in student
 */
export async function getNilaiSikapMe() {
  const url = `/siswa/me/nilai-sikap`;
  const res = await api.get(url);
  return res.data;
}

export default {
  getNilaiSikap,
  storeNilaiSikap,
  bulkStoreNilaiSikap,
  deleteNilaiSikap,
  getNilaiSikapMe,
};
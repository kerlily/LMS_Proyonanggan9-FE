// src/_services/kelasMapel.js
import api from "../_api";

/**
 * Helper wrapper to catch 401/403/404 but rethrow other errors
 */
async function safeGet(path, params = {}) {
  try {
    return await api.get(path, { params });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 403 || status === 401) {
      // return null to indicate "not available / permission"
      return null;
    }
    throw err;
  }
}

/**
 * Ambil semua mapel (admin)
 * Endpoint: GET /admin/mapel
 */
export const getAllMapels = () => {
  return api.get("/admin/mapel");
};

/**
 * Ambil available mapels untuk kelas (admin)
 * Endpoint: GET /admin/kelas/{kelas_id}/mapel/available
 */
export const getAvailableMapelsForKelas = (kelasId) => {
  return api.get(`/admin/kelas/${kelasId}/mapel/available`);
};

/**
 * Compute assigned mapels = allMapels - availableMapels
 * Karena backend tidak menyediakan GET assigned langsung, kita hitung di client.
 *
 * NOTE: fungsi ini akan me-return axios response-like object dengan .data = array assigned mapels
 */
export const getKelasMapels = async (kelasId) => {
  // 1) ambil all mapels (admin)
  const allRes = await safeGet("/admin/mapel");
  if (!allRes) {
    const e = new Error("Tidak dapat mengambil daftar semua mapel (require admin).");
    e.isNotFound = true;
    throw e;
  }
  // extract array
  const allMapels = Array.isArray(allRes.data)
    ? allRes.data
    : (allRes.data?.data ?? allRes.data?.mapels ?? allRes.data ?? []);

  // 2) ambil available untuk kelas
  const avRes = await safeGet(`/admin/kelas/${kelasId}/mapel/available`);
  // if avRes is null -> maybe permission denied; we can't compute -> throw to caller
  if (avRes === null) {
    const e = new Error("Tidak dapat mengambil daftar available mapel (permission/404).");
    e.isNotFound = true;
    throw e;
  }
  const avail = avRes.data?.available_mapels ?? avRes.data?.mapels ?? avRes.data?.data ?? avRes.data ?? [];

  // build sets and compute assigned
  const availIds = new Set((avail || []).map((m) => Number(m.id)));
  const assigned = (allMapels || []).filter((m) => !availIds.has(Number(m.id)));

  // return object similar shape to previous aRes usage
  return { data: assigned };
};

/* other actions (attach, detach, assign, copy) unchanged */
export const attachMapelToKelas = (kelasId, mapelId) => api.post(`/admin/kelas/${kelasId}/mapel/${mapelId}`);
export const detachMapelFromKelas = (kelasId, mapelId) => api.delete(`/admin/kelas/${kelasId}/mapel/${mapelId}`);
export const assignMapelsToKelas = (kelasId, mapelIds) => api.post(`/admin/kelas/${kelasId}/mapel`, { mapel_ids: mapelIds });
export const copyMapelsFromKelas = (kelasId, sourceKelasId) => api.post(`/admin/kelas/${kelasId}/mapel/copy-from/${sourceKelasId}`);

export default {
  getKelasMapels,
  getAvailableMapelsForKelas,
  getAllMapels,
  attachMapelToKelas,
  detachMapelFromKelas,
  assignMapelsToKelas,
  copyMapelsFromKelas,
};

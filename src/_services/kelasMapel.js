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
 * Because backend does not provide assigned directly, we compute in client.
 */
export const getKelasMapels = async (kelasId) => {
  const allRes = await safeGet("/admin/mapel");
  if (!allRes) {
    const e = new Error("Tidak dapat mengambil daftar semua mapel (require admin).");
    e.isNotFound = true;
    throw e;
  }
  const allMapels = Array.isArray(allRes.data)
    ? allRes.data
    : (allRes.data?.data ?? allRes.data?.mapels ?? allRes.data ?? []);

  const avRes = await safeGet(`/admin/kelas/${kelasId}/mapel/available`);
  if (avRes === null) {
    const e = new Error("Tidak dapat mengambil daftar available mapel (permission/404).");
    e.isNotFound = true;
    throw e;
  }
  const avail = avRes.data?.available_mapels ?? avRes.data?.mapels ?? avRes.data?.data ?? avRes.data ?? [];

  const availIds = new Set((avail || []).map((m) => Number(m.id)));
  const assigned = (allMapels || []).filter((m) => !availIds.has(Number(m.id)));

  return { data: assigned };
};

/**
 * GET statistics for kelas-mapel
 * Endpoint: GET /admin/kelas-mapel/statistics
 * Returns backend response or null if 401/403/404 (safeGet behavior).
 */
export const getStatistics = (params = {}) => {
  return safeGet("/admin/kelas-mapel/statistics", params);
};

/* other actions (attach, detach, assign, copy) unchanged */
export const attachMapelToKelas = (kelasId, mapelId) => api.post(`/admin/kelas/${kelasId}/mapel/${mapelId}`);
export const detachMapelFromKelas = (kelasId, mapelId) => api.delete(`/admin/kelas/${kelasId}/mapel/${mapelId}`);
export const assignMapelsToKelas = (kelasId, mapelIds) => api.post(`/admin/kelas/${kelasId}/mapel`, { mapel_ids: mapelIds });
export const copyMapelsFromKelas = (kelasId, sourceKelasId) => api.post(`/admin/kelas/${kelasId}/mapel/copy-from/${sourceKelasId}`);

/**
 * Ambil mapel per kelas (public)
 * Endpoint: GET /kelas/{kelas_id}/mapel
 */
export const getMapelsByKelas = (kelasId) => {
  return api.get(`/kelas/${kelasId}/mapel`);
};

/**
 * Ambil mapel yang bisa dibuat struktur nilai
 * Endpoint: GET /kelas/{kelas_id}/semester/{semester_id}/available-mapels
 */
export const getAvailableMapelForStruktur = (kelasId, semesterId) => {
  return api.get(`/kelas/${kelasId}/semester/${semesterId}/available-mapels`);
};

export default {
  getKelasMapels,
  getAvailableMapelsForKelas,
  getAllMapels,
  getStatistics,
  attachMapelToKelas,
  detachMapelFromKelas,
  assignMapelsToKelas,
  copyMapelsFromKelas,
  getMapelsByKelas,
  getAvailableMapelForStruktur,
};

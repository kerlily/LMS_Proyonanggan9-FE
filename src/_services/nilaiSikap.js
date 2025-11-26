// src/_services/nilaiSikap.js
import api from "../_api";

export async function getNilaiSikap(kelasId, params = {}) {
  const url = `/kelas/${kelasId}/nilai-sikap`;
  const res = await api.get(url, { params });
  return res.data;
}

export async function storeNilaiSikap(kelasId, payload) {
  const url = `/kelas/${kelasId}/nilai-sikap`;
  const res = await api.post(url, payload);
  return res.data;
}

export async function bulkStoreNilaiSikap(kelasId, payload) {
  const url = `/kelas/${kelasId}/nilai-sikap/bulk`;
  const res = await api.post(url, payload);
  return res.data;
}

export async function deleteNilaiSikap(kelasId, id) {
  const url = `/kelas/${kelasId}/nilai-sikap/${id}`;
  const res = await api.delete(url);
  return res.data;
}

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
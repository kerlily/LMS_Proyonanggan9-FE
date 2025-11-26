// src/_services/ketidakhadiran.js
import api from "../_api";

export async function getKetidakhadiran(kelasId, params = {}) {
  const url = `/kelas/${kelasId}/ketidakhadiran`;
  const res = await api.get(url, { params });
  return res.data;
}

export async function storeKetidakhadiran(kelasId, payload) {
  const url = `/kelas/${kelasId}/ketidakhadiran`;
  const res = await api.post(url, payload);
  return res.data;
}

export async function bulkStoreKetidakhadiran(kelasId, payload) {
  const url = `/kelas/${kelasId}/ketidakhadiran/bulk`;
  const res = await api.post(url, payload);
  return res.data;
}

export async function incrementKetidakhadiran(kelasId, siswaId, payload) {
  const url = `/kelas/${kelasId}/ketidakhadiran/${siswaId}/increment`;
  const res = await api.post(url, payload);
  return res.data;
}

export async function deleteKetidakhadiran(kelasId, id) {
  const url = `/kelas/${kelasId}/ketidakhadiran/${id}`;
  const res = await api.delete(url);
  return res.data;
}

export async function getKetidakhadiranMe() {
  const url = `/siswa/me/ketidakhadiran`;
  const res = await api.get(url);
  return res.data;
}

export default {
  getKetidakhadiran,
  storeKetidakhadiran,
  bulkStoreKetidakhadiran,
  incrementKetidakhadiran,
  deleteKetidakhadiran,
  getKetidakhadiranMe,
};
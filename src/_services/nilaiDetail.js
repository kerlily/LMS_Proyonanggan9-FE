// src/_services/nilaiDetail.js - UPDATED WITH STRUKTUR CRUD
import api from "../_api";

// STRUKTUR NILAI CRUD
export async function getStrukturNilai(kelasId, params = {}) {
  const url = `/kelas/${kelasId}/struktur-nilai`;
  const res = await api.get(url, { params });
  return res.data;
}

export async function getStrukturById(kelasId, strukturId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}`;
  const res = await api.get(url);
  return res.data;
}

export async function getStrukturByMapelSemester(kelasId, mapelId, semesterId) {
  const url = `/kelas/${kelasId}/struktur-nilai/mapel/${mapelId}/semester/${semesterId}`;
  const res = await api.get(url);
  return res.data;
}

export const createStruktur = (kelasId, payload) => {
  return api.post(`/kelas/${kelasId}/struktur-nilai`, payload);
};

export const updateStruktur = (kelasId, id, payload) => {
  return api.put(`/kelas/${kelasId}/struktur-nilai/${id}`, payload);
};

export const deleteStruktur = (kelasId, id) => {
  return api.delete(`/kelas/${kelasId}/struktur-nilai/${id}`);
};

export const getAvailableMapels = (kelasId, semesterId) => {
  return api.get(`/kelas/${kelasId}/semester/${semesterId}/available-mapels`);
};

// NILAI DETAIL
export async function getNilaiDetail(kelasId, strukturId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail`;
  const res = await api.get(url);
  return res.data;
}

export async function postNilaiDetailSingle(kelasId, strukturId, payload) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail/single`;
  const res = await api.post(url, payload);
  return res.data;
}

export async function postNilaiDetailBulk(kelasId, strukturId, payload) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail/bulk`;
  const res = await api.post(url, payload);
  return res.data;
}

export async function getProgress(kelasId, strukturId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/progress`;
  const res = await api.get(url);
  return res.data;
}

export async function generateNilaiAkhir(kelasId, strukturId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/generate-nilai-akhir`;
  const res = await api.post(url);
  return res.data;
}

export async function getSiswaDetail(kelasId, strukturId, siswaId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/siswa/${siswaId}`;
  const res = await api.get(url);
  return res.data;
}

export default {
  getStrukturNilai,
  getStrukturById,
  getStrukturByMapelSemester,
  createStruktur,
  updateStruktur,
  deleteStruktur,
  getAvailableMapels,
  getNilaiDetail,
  postNilaiDetailSingle,
  postNilaiDetailBulk,
  getProgress,
  generateNilaiAkhir,
  getSiswaDetail,
};
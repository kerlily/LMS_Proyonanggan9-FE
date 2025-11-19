// src/_services/nilaiDetail.js
import api from "../_api";

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

export async function getNilaiDetail(kelasId, strukturId) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail`;
  const res = await api.get(url);
  return res.data;
}

// ✅ NEW: Save single nilai
export async function postNilaiDetailSingle(kelasId, strukturId, payload) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail/single`;
  const res = await api.post(url, payload);
  return res.data;
}

// ✅ UPDATED: Bulk save (partial OK)
export async function postNilaiDetailBulk(kelasId, strukturId, payload) {
  const url = `/kelas/${kelasId}/struktur-nilai/${strukturId}/nilai-detail/bulk`;
  const res = await api.post(url, payload);
  return res.data;
}

// ✅ NEW: Get progress
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
  getNilaiDetail,
  postNilaiDetailSingle,
  postNilaiDetailBulk,
  getProgress,
  generateNilaiAkhir,
  getSiswaDetail,
};
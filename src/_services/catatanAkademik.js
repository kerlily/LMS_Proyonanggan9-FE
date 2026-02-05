// src/_services/catatanAkademik.js
import api from "../_api";

export const getCatatanByMapel = (kelasId, params = {}) => {
  return api.get(`/kelas/${kelasId}/catatan-akademik`, { params });
};

export const saveBulkCatatan = (kelasId, data) => {
  return api.post(`/kelas/${kelasId}/catatan-akademik/bulk`, data);
};

export const getAvailableStruktur = (kelasId, params = {}) => {
  return api.get(`/kelas/${kelasId}/struktur-nilai/available-for-catatan`, { params });
};


export const getCatatanByStruktur = (kelasId, strukturId) => {
  return api.get(`/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan`);
};


export const saveSingleCatatan = (kelasId, strukturId, siswaId, catatan) => {
  return api.post(
    `/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan/single`,
    { siswa_id: siswaId, catatan }
  );
};


export const deleteCatatan = (kelasId, strukturId, siswaId) => {
  return api.delete(
    `/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan/${siswaId}`
  );
};


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
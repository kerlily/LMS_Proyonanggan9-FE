// src/_services/catatanAkademik.js
import api from "../_api";

export const getCatatanByStruktur = (kelasId, strukturId) => {
  return api.get(`/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan`);
};

export const saveBulkCatatan = (kelasId, strukturId, catatanData) => {
  return api.post(
    `/kelas/${kelasId}/struktur-nilai/${strukturId}/catatan/bulk`,
    { catatan_data: catatanData }
  );
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
  getCatatanByStruktur,
  saveBulkCatatan,
  saveSingleCatatan,
  deleteCatatan,
  getCatatanBySiswa,
};
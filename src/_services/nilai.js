
// src/_services/nilai.js
import api from "../_api";

export const downloadTemplate = (kelasId, semesterId) => {
  return api.get(`/kelas/${kelasId}/semester/${semesterId}/download-template`, {
    responseType: "blob",
  });
};

export const importNilai = (kelasId, semesterId, formData, dryRun = false) => {
  const params = dryRun ? { dry_run: 1 } : {};
  return api.post(`/kelas/${kelasId}/semester/${semesterId}/import-nilai`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    params,
  });
};

export const getNilaiByKelas = (kelasId, params = {}) => {
  return api.get(`/kelas/${kelasId}/nilaiKelas`, { params });
};


export const storeNilai = (kelasId, payload) => {
  return api.post(`/kelas/${kelasId}/nilai`, payload);
};

export const updateNilai = (kelasId, nilaiId, payload) => {
  return api.put(`/kelas/${kelasId}/nilai/${nilaiId}`, payload);
};

export const indexByKelas = (kelasId) => {
  return api.get(`/kelas/${kelasId}/nilaiKelas`);
};

export default {
  downloadTemplate,
  importNilai,
  getNilaiByKelas,
  storeNilai,
  updateNilai,
  indexByKelas,
};

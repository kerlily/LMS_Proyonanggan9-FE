// src/_services/waliKelas.js
import api from "../_api";

export const getMyWaliKelas = () => {
  return api.get("/guru/my-wali-kelas");
};

export const getSemesterByTahunAjaran = (tahunAjaranId) => {
  return api.get(`/tahun-ajaran/${tahunAjaranId}/semester`);
};

export const showByGuru = (tahunAjaranId = null) => {
  const config = tahunAjaranId ? { params: { tahun_ajaran_id: tahunAjaranId } } : {};
  return api.get("/wali-kelas/me", config);
};

export default {
  getMyWaliKelas,
  getSemesterByTahunAjaran,
  showByGuru,
};
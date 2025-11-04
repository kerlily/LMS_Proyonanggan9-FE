// src/_services/admin.js
import api from "../_api";

///// SISWA /////
export const createSiswa = (payload) => {
  // payload: { nama, tahun_lahir, kelas_id, ... }
  return api.post("/admin/siswa", payload);
};

export const updateSiswa = (id, payload) => {
  // backend menggunakan POST untuk update (sesuai rute Anda)
  return api.post(`/admin/siswa/${id}`, payload);
};

export const deleteSiswa = (id) => {
  return api.delete(`/admin/siswa/${id}`);
};

export const listSiswa = (params = {}) => {
  // params: { page, q, kelas_id, sort }
  return api.get("/admin/siswa", { params });
};

export const showSiswa = (id) => {
  return api.get(`/admin/siswa/${id}`);
};

///// GURU /////
export const createGuru = (formData) => {
  // formData: FormData with fields: nama,email,password,nip? no_hp? ,photo(file)
  // Note: you said there is no 'nip' in JSON siswa — that's fine; guru may or may not include it.
  return api.post("/admin/guru", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const showGuru = (id) => api.get(`/admin/guru/${id}`);
export const updateGuru = (id, formData) =>
  api.post(`/admin/guru/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" }});
export const deleteGuru = (id) => api.delete(`/admin/guru/${id}`);
export const resetGuruPassword = (id, payload = {}) => api.post(`/admin/guru/${id}/reset-password`, payload);


export const listGuru = (params = {}) => {
  // try admin route first, fallback to /guru
  return api.get("/admin/guru", { params }).catch((err) => {
    // if 404 or not found, fallback
    if (err?.response?.status === 404) return api.get("/guru", { params });
    throw err;
  });
};

export const getGuruList = (params = {}) => {
  return listGuru(params);
};

///// KELAS /////
export const getKelasList = (params = {}) => {
  return api.get("/admin/kelas-mapel/statistics", { params })
    .then(res => {
      // normalisasi: komponen biasanya membaca res.data atau res.data.data
      // kita kembalikan object shape supaya komponen yang sudah expecting res.data tetap work:
      // res.data -> array
      return { data: res?.data?.statistics ?? res?.data?.data ?? res?.data ?? [] };
    });
};

///// WALI KELAS /////
export const listWaliKelas = (params = {}) => {
  return api.get("/admin/wali-kelas", { params });
};

export const showWaliByKelas = (kelas_id) => {
  return api.get(`/admin/wali-kelas/kelas/${kelas_id}`);
};

export const assignWaliKelas = (payload) => {
  // payload: { guru_id, kelas_id, tahun_ajaran_id? }
  return api.post("/admin/wali-kelas/assign", payload);
};

export const unassignWali = (id) => {
  return api.post(`/admin/wali-kelas/unassign/${id}`);
};

///// TAHUN AJARAN /////
export const changeTahunAjaran = (payload) => {
  // payload depends on backend (e.g. { tahun_ajaran_id: X }) or empty
  return api.post("/admin/tahun-ajaran/change", payload);
};

///// RESET PASSWORD /////
export const resetSiswaPassword = (id, payload = {}) => {
  return api.post(`/admin/siswa/${id}/reset-password`, payload);
};

///// BERITA & GALLERY (admin + guru) /////
export const createBerita = (formData) => api.post("/beritas", formData);
export const updateBerita = (id, formData) => api.post(`/beritas/${id}`, formData);
export const deleteBerita = (id) => api.delete(`/beritas/${id}`);

export const createGallery = (formData) => api.post("/galleries", formData);
export const updateGallery = (id, formData) => api.post(`/galleries/${id}`, formData);
export const deleteGallery = (id) => api.delete(`/galleries/${id}`);

///// NILAI (admin + guru) /////
export const getNilaiForSiswa = (siswa_id) => api.get(`/admin/siswa/${siswa_id}/nilai`);
export const getNilaiForSiswaBySemester = (siswa_id, semester_id) =>
  api.get(`/admin/siswa/${siswa_id}/nilai/semester/${semester_id}`);
export const getNilaiDetail = (siswa_id, nilai_id) => api.get(`/admin/siswa/${siswa_id}/nilai/${nilai_id}`);

///// Export default (optional convenience) /////
export default {
  // siswa
  createSiswa,
  updateSiswa,
  deleteSiswa,
  listSiswa,
  showSiswa,
  // guru
  createGuru,
  listGuru,
  getGuruList,
  // kelas
  getKelasList,
  // wali kelas
  listWaliKelas,
  showWaliByKelas,
  assignWaliKelas,
  unassignWali,
  // tahun ajaran
  changeTahunAjaran,
  // reset pw
  resetGuruPassword,
  resetSiswaPassword,
  // berita/gallery
  createBerita,
  updateBerita,
  deleteBerita,
  createGallery,
  updateGallery,
  deleteGallery,
  // nilai
  getNilaiForSiswa,
  getNilaiForSiswaBySemester,
  getNilaiDetail,
};

// src/_services/berita.js
import api from "../_api";

// Get berita public (hanya published)
export const getBeritas = (params = {}) =>
  api.get(`/beritas`, { params })
    .then(res => {
      return res.data?.beritas ?? res.data;
    });

// Get semua berita (published + draft) untuk guru/admin
export const getAllBeritas = (params = {}) =>
  api.get(`/beritas/all`, { params })
    .then(res => {
      return res.data?.beritas ?? res.data;
    });

// Get single berita
export const getBeritaById = (id) =>
  api.get(`/beritas/${id}`)
    .then(res => {
      return res.data?.berita ?? res.data?.data ?? res.data;
    });

// Create berita
export const createBerita = (payload) =>
  api.post(`/beritas`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);

// Update berita
export const updateBerita = (id, payload) => {
  if (payload instanceof FormData) {
    // PERBAIKAN: Tambahkan _method untuk method spoofing Laravel
    payload.append('_method', 'PUT');
    
    return api.post(`/beritas/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  }

  // Jika JSON biasa, gunakan PUT
  return api.put(`/beritas/${id}`, payload).then(res => res.data);
};

// Delete berita
export const deleteBerita = (id) =>
  api.delete(`/beritas/${id}`).then(res => res.data);

export default {
  getBeritas,
  getAllBeritas,
  getBeritaById,
  createBerita,
  updateBerita,
  deleteBerita,
};
// src/_services/gallery.js
import api from "../_api";

// Get semua galleries
export const getGalleries = (params = {}) =>
  api.get(`/galleries`, { params })
    .then(res => {
      return res.data?.galleries ?? res.data?.data ?? res.data;
    });

// Get single gallery
export const getGalleryById = (id) =>
  api.get(`/galleries/${id}`)
    .then(res => {
      return res.data?.gallery ?? res.data?.data ?? res.data;
    });

// Create gallery
export const createGallery = (payload) => {
  const formData = new FormData();
  formData.append('image', payload);
  
  return api.post(`/galleries`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};

// Update gallery
export const updateGallery = (id, payload) => {
  const formData = new FormData();
  formData.append('image', payload);
  formData.append('_method', 'PUT');
  
  return api.post(`/galleries/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);
};

// Delete gallery
export const deleteGallery = (id) =>
  api.delete(`/galleries/${id}`).then(res => res.data);

export default {
  getGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
};
// src/_services/mapel.js
import api from "../_api";

export const listMapel = (params = {}) => {
  // params: { page, per_page, search }
  return api.get("/admin/mapel", { params });
};

export const createMapel = (payload) => {
  // payload: { nama, kode }  
  return api.post("/admin/mapel", payload);
};

export const updateMapel = (id, payload) => {
  // payload: { nama, kode }
  // controller expects PUT but Laravel route might accept POST; try PUT
  return api.put(`/admin/mapel/${id}`, payload);
};

export const deleteMapel = (id) => {
  return api.delete(`/admin/mapel/${id}`);
};

export const getMapelAll = () => {
  return api.get("/mapel/all");
};

export const getMapel = (id) => {
  return api.get(`/admin/mapel/${id}`);
};

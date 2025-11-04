// src/_services/adminUser.js
import api from "../_api";

export const listAdmin = (params = {}) => {
  return api.get("/admin/admins", { params });
};

export const showAdmin = (id) => {
  return api.get(`/admin/admins/${id}`);
};

export const createAdmin = (payload) => {
  return api.post("/admin/admins", payload);
};

export const updateAdmin = (id, payload) => {
  return api.put(`/admin/admins/${id}`, payload);
};

export const deleteAdmin = (id) => {
  return api.delete(`/admin/admins/${id}`);
};

export const resetAdminPassword = (id, payload = {}) => {
  return api.post(`/admin/admins/${id}/reset-password`, payload);
};

export default {
  listAdmin,
  showAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
};
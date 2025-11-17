// src/_services/log.js
import api from "../_api"; // sesuaikan path kalau instance-mu di lokasi lain

/**
 * params: { page, per_page, search, log_name, date_from, date_to, causer_id, causer_type }
 */
export const listLogs = (params = {}) => {
  return api.get("/admin/activity-logs", { params });
};

export const getLog = (id) => {
  return api.get(`/admin/activity-logs/${id}`);
};

/**
 * Optional: if backend menyediakan /admin/activity-logs/stats
 * kalau tidak ada, caller harus fallback.
 */
export const getStats = () => {
  return api.get("/admin/activity-logs/stats");
};

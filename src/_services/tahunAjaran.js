// src/_services/tahunAjaran.js
import api from "../_api";

/**
 * Service wrapper untuk tahun ajaran
 */

// list semua tahun ajaran (GET /tahun-ajaran)
export const listTahunAjaran = (params = {}) => api.get("/admin/tahun-ajaran", { params });

// show single (GET /tahun-ajaran/{id})
export const showTahunAjaran = (id) => api.get(`/admin/tahun-ajaran/${id}`);

// create (POST /tahun-ajaran)
// payload: { name: "2027/2028", is_active: 1 }
export const createTahunAjaran = (payload) => api.post("/admin/tahun-ajaran", payload);

// update (PUT /tahun-ajaran/{id})
export const updateTahunAjaran = (id, payload) => api.put(`/admin/tahun-ajaran/${id}`, payload);

// delete (DELETE /tahun-ajaran/{id})
export const deleteTahunAjaran = (id) => api.delete(`/admin/tahun-ajaran/${id}`);

// change academic year (promote) (POST /tahun-ajaran/change)
// payload: { copy_wali: true, repeat_student_ids: [], name: "2027/2028" }
export const changeAcademicYear = (payload) => api.post("/admin/tahun-ajaran/change", payload);

// optionally get active year (if needed)
export const getActiveYear = () => api.get("/admin/tahun-ajaran/active");

export const toggleSemester = (semesterId) => {
  return api.post(`/admin/semester/${semesterId}/toggle-active`);
};

export default {
  listTahunAjaran,
  showTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  changeAcademicYear,
  getActiveYear,
    toggleSemester,
};

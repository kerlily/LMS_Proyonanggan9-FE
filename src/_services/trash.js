// src/_services/trash.js
import api from "../_api";

/**
 * Helper function untuk format days ago
 * Menghindari desimal seperti "0.004432160706018519 days ago"
 */
export const formatDaysAgo = (days) => {
  if (!days && days !== 0) return null;
  
  // Bulatkan ke integer
  const roundedDays = Math.floor(days);
  
  // Jika kurang dari 1 hari
  if (roundedDays === 0) return 'Hari ini';
  
  // Jika 1 hari
  if (roundedDays === 1) return '1 hari yang lalu';
  
  // Selainnya
  return `${roundedDays} hari yang lalu`;
};

/**
 * Trash Management Service
 * Handle semua operasi soft delete (restore & permanent delete)
 */

// ===========================
// DASHBOARD & STATS
// ===========================

/**
 * Get trash statistics
 * GET /api/admin/trash/stats
 */
export const getTrashStats = () => {
  return api.get("/admin/trash/stats");
};

// ===========================
// USERS TRASH
// ===========================

/**
 * Get all trashed users (guru/admin)
 * GET /api/admin/trash/users
 * @param {object} params - { page, per_page, search }
 */
export const getTrashedUsers = (params = {}) => {
  return api.get("/admin/trash/users", { params });
};

/**
 * Restore single user
 * POST /api/admin/trash/users/{id}/restore
 */
export const restoreUser = (id) => {
  return api.post(`/admin/trash/users/${id}/restore`);
};

/**
 * Permanent delete user
 * DELETE /api/admin/trash/users/{id}/force
 */
export const forceDeleteUser = (id) => {
  return api.delete(`/admin/trash/users/${id}/force`);
};

// ===========================
// SISWA TRASH
// ===========================

/**
 * Get all trashed siswa
 * GET /api/admin/trash/siswa
 * @param {object} params - { page, per_page, search }
 */
export const getTrashedSiswa = (params = {}) => {
  return api.get("/admin/trash/siswa", { params });
};

/**
 * Restore single siswa
 * POST /api/admin/trash/siswa/{id}/restore
 */
export const restoreSiswa = (id) => {
  return api.post(`/admin/trash/siswa/${id}/restore`);
};

/**
 * Permanent delete siswa
 * DELETE /api/admin/trash/siswa/{id}/force
 * PERHATIAN: Ini akan menghapus semua data nilai siswa juga!
 */
export const forceDeleteSiswa = (id) => {
  return api.delete(`/admin/trash/siswa/${id}/force`);
};

// ===========================
// BULK OPERATIONS
// ===========================

/**
 * Bulk restore multiple records
 * POST /api/admin/trash/bulk-restore
 * @param {string} model - 'users' | 'siswa' | 'guru' | 'kelas'
 * @param {array} ids - Array of IDs to restore
 */
export const bulkRestore = (model, ids) => {
  return api.post("/admin/trash/bulk-restore", {
    model,
    ids,
  });
};

export default {
  // Stats
  getTrashStats,
  
  // Users
  getTrashedUsers,
  restoreUser,
  forceDeleteUser,
  
  // Siswa
  getTrashedSiswa,
  restoreSiswa,
  forceDeleteSiswa,
  
  // Bulk
  bulkRestore,
};
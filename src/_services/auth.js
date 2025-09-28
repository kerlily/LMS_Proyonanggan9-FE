// src/_services/auth.js
import api from "../_api";

/**
 * Service auth untuk admin/guru (pola Project-Akhir)
 * - Exports named functions: login, logout, register (opsional)
 * - Menyimpan token/user ke localStorage keys: token, access_token, userInfo, user
 */

export const login = async ({ email, password }) => {
  try {
    // Pastikan endpoint sesuai backend Anda: /login atau /auth/login
    const { data } = await api.post("/login", { email, password });

    // Toleransi berbagai nama token/user dari backend
    const token = data.access_token ?? data.token ?? null;
    const user = data.user ?? data.userInfo ?? null;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
    }
    if (user) {
      try {
        localStorage.setItem("userInfo", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.warn("auth.login: gagal menyimpan user ke localStorage", e);
      }
    }

    return data;
  } catch (error) {
    console.error("auth.login error:", error);
    throw error;
  }
};

export const logout = async () => {
    localStorage.removeItem("token");
     localStorage.removeItem("userInfo");
     // opsional: panggil endpoint logout di server
     try {
       await api.post("/siswa/logout");
     } catch (err) {
       console.warn("logoutSiswa error (ignored):", err?.message || err);
     }
};

/**
 * Optional: register function jika Anda butuh
 */
export const register = async ({ name, email, password }) => {
  try {
    const { data } = await api.post("/register", { name, email, password });
    return data;
  } catch (error) {
    console.error("auth.register error:", error);
    throw error;
  }
};

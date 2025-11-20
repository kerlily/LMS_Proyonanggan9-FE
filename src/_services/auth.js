// src/_services/auth.js
import api from "../_api";

/**
 * login untuk admin/guru
 * FIXED: Clear token siswa dulu, lalu set token admin/guru
 */
export const login = async ({ email, password }) => {
  try {
    // STEP 1: Bersihkan token siswa jika ada
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");

    // STEP 2: Login
    const { data } = await api.post("/auth/login", { email, password });

    const token = data.access_token ?? data.token ?? null;
    const user = data.user ?? data.userInfo ?? null;

    // STEP 3: Set token admin/guru (BUKAN siswa_token)
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
    }
    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
    }

    return data;
  } catch (err) {
    console.error("auth.login error:", err);
    throw err;
  }
};

/**
 * logout untuk admin/guru
 * FIXED: Clear SEMUA token termasuk siswa
 */
export const logout = async () => {
  // Clear SEMUA token dulu
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("user");
  localStorage.removeItem("siswa_token");
  localStorage.removeItem("siswa_userInfo");
  
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.warn("Logout API call failed (ignored):", err?.message || err);
  }
};
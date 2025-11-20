// src/_services/siswa.js
import api from "../_api";

/**
 * loginSiswa
 * FIXED: HANYA set siswa_token, JANGAN set token biasa
 */
export const loginSiswa = async ({ nama, kelas_id, password }) => {
  try {
    console.log("🔐 Starting loginSiswa...");
    
    // STEP 1: Bersihkan SEMUA token lama terlebih dahulu
    console.log("🧹 Clearing old tokens...");
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");

    // STEP 2: Kirim request login
    const body = {
      nama: nama ?? "",
      kelas_id: Number(kelas_id),
      password: password ?? "",
    };

    console.log("📤 Sending login request:", { nama, kelas_id });
    const { data } = await api.post("/siswa/login", body);
    console.log("📥 Login response received:", data);

    // STEP 3: Save token siswa dengan key yang spesifik
    const token = data.access_token ?? data.token ?? null;
    const user = data.user ?? data.userInfo ?? null;

    if (token) {
      console.log("💾 Saving siswa_token...");
      // PENTING: HANYA set siswa_token, JANGAN set token biasa!
      localStorage.setItem("siswa_token", token);
      console.log("✅ Token saved successfully");
      
      // Verify immediately
      const saved = localStorage.getItem("siswa_token");
      console.log("🔍 Verification - Token exists:", saved ? "YES" : "NO");
    } else {
      console.error("❌ No token in response!");
    }
    
    if (user) {
      try {
        const userWithRole = { ...user, userType: 'siswa' };
        localStorage.setItem("siswa_userInfo", JSON.stringify(userWithRole));
        console.log("✅ User info saved successfully");
      } catch (e) {
        console.warn("⚠️ Gagal menyimpan userInfo:", e);
      }
    } else {
      console.error("❌ No user in response!");
    }

    return data;
  } catch (error) {
    console.error("❌ loginSiswa error:", error);
    console.error("Error details:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message
    });
    throw error;
  }
};

/**
 * logoutSiswa
 * FIXED: Clear token siswa dan pastikan tidak ada token tersisa
 */
export const logoutSiswa = async () => {
  // Clear semua token siswa DULU sebelum API call
  localStorage.removeItem("siswa_token");
  localStorage.removeItem("siswa_userInfo");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("user");
  
  // Panggil endpoint logout (optional, bisa gagal jika token invalid)
  try {
    await api.post("/siswa/logout");
  } catch (err) {
    // Ignore error karena token sudah di-clear
    console.warn("logoutSiswa API call failed (ignored):", err?.message || err);
  }
};

export const getKelas = () => {
  console.log("📚 Fetching kelas list...");
  
  // Check tokens saat ini
  const siswaToken = localStorage.getItem("siswa_token");
  const regularToken = localStorage.getItem("token");
  
  console.log("Current tokens:", {
    siswa_token: siswaToken ? "EXISTS" : "NULL",
    token: regularToken ? "EXISTS" : "NULL"
  });
  
  return api.get("/kelas");
};

export const getSiswaByKelas = (kelasId) => api.get(`/kelas/${kelasId}/siswa`);
export const getNilaiMe = () => api.get("/siswa/me/nilai");
export const changePassword = (payload) => api.post("/siswa/me/password", payload);
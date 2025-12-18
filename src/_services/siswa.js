// src/_services/siswa.js
import api from "../_api";

/**
 * Login siswa
 * Token akan berlaku 14 hari
 */
export const loginSiswa = async ({ nama, kelas_id, password }) => {
  try {
    // STEP 1: Bersihkan token admin/guru jika ada
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");
    localStorage.removeItem("token_expires_at");

    // STEP 2: Validasi input
    const body = {
      nama: nama ?? "",
      kelas_id: Number(kelas_id),
      password: password ?? "",
    };

    // STEP 3: Login request
    const { data } = await api.post("/siswa/login", body);

    // STEP 4: Validasi response
    if (!data.success) {
      throw new Error(data.message || "Login siswa failed");
    }

    const token = data.access_token ?? data.token ?? null;
    const user = data.user ?? data.userInfo ?? null;

    // STEP 5: Simpan token siswa
    if (token) {
      localStorage.setItem("siswa_token", token);
      localStorage.setItem("token", token); // For backward compatibility
      
      // OPTIONAL: Simpan info expiry
      if (data.expires_in) {
        const expiryTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem("siswa_token_expires_at", expiryTime);
      }
      
      console.log(`✅ Siswa logged in. Token valid for ${data.expires_in_days || 14} days`);
    }

    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("siswa_userInfo", JSON.stringify(user));
    }

    return data;
  } catch (error) {
    console.error("❌ loginSiswa error:", error);
    throw error;
  }
};

/**
 * Logout siswa
 * Menghapus token dan notify server
 */
export const logoutSiswa = async () => {
  try {
    // Notify server untuk blacklist token
    await api.post("/siswa/logout");
    console.log("✅ Siswa logout successful");
  } catch (err) {
    console.warn("⚠️ logoutSiswa error (ignored):", err?.message || err);
  } finally {
    // Clear client-side tokens
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");
    localStorage.removeItem("siswa_token_expires_at");
  }
};

/**
 * Refresh token siswa
 * Dipanggil otomatis oleh axios interceptor, tapi bisa juga manual
 */
export const refreshSiswaToken = async () => {
  try {
    const currentToken = localStorage.getItem("siswa_token");
    
    if (!currentToken) {
      throw new Error("No siswa token to refresh");
    }

    const { data } = await api.post("/siswa/refresh");

    if (!data.success) {
      throw new Error(data.message || "Refresh failed");
    }

    const newToken = data.access_token ?? data.token;
    const user = data.user ?? data.userInfo;

    if (newToken) {
      localStorage.setItem("siswa_token", newToken);
      localStorage.setItem("token", newToken);
      
      if (data.expires_in) {
        const expiryTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem("siswa_token_expires_at", expiryTime);
      }
      
      console.log(`✅ Siswa token refreshed. Valid for ${data.expires_in_days || 14} days`);
    }

    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("siswa_userInfo", JSON.stringify(user));
    }

    return data;
  } catch (err) {
    console.error("❌ Siswa token refresh failed:", err);
    throw err;
  }
};

/**
 * Check siswa token validity
 */
export const checkSiswaToken = async () => {
  try {
    const { data } = await api.get("/siswa/check-token");
    
    if (data.success && data.valid) {
      console.log(`ℹ️ Siswa token valid for ${data.remaining_days} more days`);
      return data;
    }
    
    return null;
  } catch (err) {
    console.error("❌ Check siswa token failed:", err);
    return null;
  }
};

/**
 * Get current siswa info
 */
export const getCurrentSiswa = async () => {
  try {
    const { data } = await api.get("/siswa/me");
    
    if (data.success) {
      const siswa = data.data ?? data.user;
      
      if (siswa) {
        localStorage.setItem("userInfo", JSON.stringify(siswa));
        localStorage.setItem("siswa_userInfo", JSON.stringify(siswa));
      }
      
      return siswa;
    }
    
    return null;
  } catch (err) {
    console.error("❌ Get current siswa failed:", err);
    throw err;
  }
};

/**
 * Check if siswa is authenticated
 */
export const isSiswaAuthenticated = () => {
  const token = localStorage.getItem("siswa_token");
  return !!token;
};

/**
 * Get stored siswa info
 */
export const getStoredSiswa = () => {
  try {
    const siswaStr = localStorage.getItem("siswa_userInfo") || localStorage.getItem("userInfo");
    return siswaStr ? JSON.parse(siswaStr) : null;
  } catch (err) {
    console.error("❌ Failed to parse stored siswa:", err);
    return null;
  }
};

/**
 * Check siswa token expiry (local check)
 */
export const isSiswaTokenExpiringSoon = () => {
  const expiryTime = localStorage.getItem("siswa_token_expires_at");
  
  if (!expiryTime) {
    return false;
  }
  
  const now = Date.now();
  const expiry = parseInt(expiryTime, 10);
  const oneDayInMs = 24 * 60 * 60 * 1000;
  
  return (expiry - now) < oneDayInMs;
};

// ===================================
// EXISTING API CALLS (tidak berubah)
// ===================================

export const getKelas = () => api.get("/kelas");

export const getSiswaByKelas = (kelasId) => api.get(`/kelas/${kelasId}/siswa`);

export const getNilaiMe = () => api.get("/siswa/me/nilai");

export const getKetidakhadiranMe = () => api.get("/siswa/me/ketidakhadiran");

export const getNilaiSikapMe = () => api.get("/siswa/me/nilai-sikap");

export const changePassword = (payload) => api.post("/siswa/me/password", payload);
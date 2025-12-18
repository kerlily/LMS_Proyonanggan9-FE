// src/_services/auth.js
import api from "../_api";

/**
 * Login untuk admin/guru
 * Token akan berlaku 14 hari
 */
export const login = async ({ email, password }) => {
  try {
    // STEP 1: Bersihkan semua token lama
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");

    // STEP 2: Login request
    const { data } = await api.post("/auth/login", { email, password });

    // STEP 3: Validasi response
    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    const token = data.access_token ?? data.token ?? null;
    const user = data.user ?? data.userInfo ?? null;

    // STEP 4: Simpan token admin/guru (BUKAN siswa_token)
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
      
      // OPTIONAL: Simpan info expiry untuk monitoring
      if (data.expires_in) {
        const expiryTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem("token_expires_at", expiryTime);
      }
      
      console.log(`✅ Admin/Guru logged in. Token valid for ${data.expires_in_days || 14} days`);
    }

    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
    }

    return data;
  } catch (err) {
    console.error("❌ auth.login error:", err);
    throw err;
  }
};

/**
 * Logout untuk admin/guru
 * Menghapus token dan notify server
 */
export const logout = async () => {
  try {
    // Notify server untuk blacklist token
    await api.post("/auth/logout");
    console.log("✅ Logout successful");
  } catch (err) {
    console.warn("⚠️ Logout API call failed (ignored):", err?.message || err);
  } finally {
    // Clear SEMUA token dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expires_at");
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");
  }
};

/**
 * Refresh token admin/guru
 * Dipanggil otomatis oleh axios interceptor, tapi bisa juga manual
 */
export const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem("token") || localStorage.getItem("access_token");
    
    if (!currentToken) {
      throw new Error("No token to refresh");
    }

    const { data } = await api.post("/auth/refresh");

    if (!data.success) {
      throw new Error(data.message || "Refresh failed");
    }

    const newToken = data.access_token ?? data.token;
    const user = data.user ?? data.userInfo;

    if (newToken) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("access_token", newToken);
      
      if (data.expires_in) {
        const expiryTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem("token_expires_at", expiryTime);
      }
      
      console.log(`✅ Token refreshed. Valid for ${data.expires_in_days || 14} days`);
    }

    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
    }

    return data;
  } catch (err) {
    console.error("❌ Token refresh failed:", err);
    throw err;
  }
};

/**
 * Check token validity
 * Berguna untuk monitoring atau debugging
 */
export const checkToken = async () => {
  try {
    const { data } = await api.get("/auth/check-token");
    
    if (data.success && data.valid) {
      console.log(`ℹ️ Token valid for ${data.remaining_days} more days`);
      return data;
    }
    
    return null;
  } catch (err) {
    console.error("❌ Check token failed:", err);
    return null;
  }
};

/**
 * Get current user info
 * Fetch dari server untuk memastikan data terbaru
 */
export const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/auth/me");
    
    if (data.success) {
      const user = data.data ?? data.user;
      
      if (user) {
        localStorage.setItem("userInfo", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      return user;
    }
    
    return null;
  } catch (err) {
    console.error("❌ Get current user failed:", err);
    throw err;
  }
};

/**
 * Check if user is authenticated
 * Hanya check localStorage, tidak hit API
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  return !!token;
};

/**
 * Get stored user info
 * Ambil dari localStorage tanpa hit API
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem("userInfo") || localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("❌ Failed to parse stored user:", err);
    return null;
  }
};

/**
 * Check token expiry (local check)
 * Return true jika token akan expired dalam waktu dekat
 */
export const isTokenExpiringSoon = () => {
  const expiryTime = localStorage.getItem("token_expires_at");
  
  if (!expiryTime) {
    return false; // Tidak tahu kapan expire, assume masih valid
  }
  
  const now = Date.now();
  const expiry = parseInt(expiryTime, 10);
  const oneDayInMs = 24 * 60 * 60 * 1000;
  
  // Return true jika kurang dari 1 hari lagi
  return (expiry - now) < oneDayInMs;
};
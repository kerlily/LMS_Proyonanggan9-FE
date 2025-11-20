// src/_api/index.js (ATAU src/_api/axios.js - pastikan hanya ada 1 file!)
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});

// Helper function untuk clear semua token
const clearAllTokens = () => {
  console.log("🧹 Clearing all tokens...");
  localStorage.removeItem("siswa_token");
  localStorage.removeItem("siswa_userInfo");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("user");
};

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    // FIXED: Gunakan token yang spesifik berdasarkan endpoint
    const isSiswaEndpoint = config.url?.includes('/siswa');
    
    let finalToken = null;
    
    if (isSiswaEndpoint) {
      // Untuk endpoint siswa, HANYA gunakan siswa_token
      finalToken = localStorage.getItem("siswa_token");
      
      if (!finalToken) {
        console.warn("⚠️ No siswa_token for siswa endpoint:", config.url);
      } else {
        console.log("✅ Using siswa_token for:", config.url);
      }
    } else {
      // Untuk endpoint admin/guru, HANYA gunakan token (bukan siswa_token)
      finalToken = localStorage.getItem("token") || localStorage.getItem("access_token");
      
      if (finalToken) {
        console.log("✅ Using admin/guru token for:", config.url);
      }
    }
    
    if (finalToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${finalToken}`;
    } else {
      // Jangan attach Authorization header jika tidak ada token
      // Untuk public endpoints seperti /api/kelas
      if (config.headers?.Authorization) {
        delete config.headers.Authorization;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    // JANGAN clear token pada response sukses!
    return response;
  },
  (error) => {
    console.error("🔴 Axios response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      const isSiswaEndpoint = error.config?.url?.includes('/siswa');
      
      // PENTING: Jangan clear token jika ini request dari login page
      const isLoginRequest = error.config?.url?.includes('/login');
      
      if (!isLoginRequest) {
        console.warn("⚠️ Got 401 error, clearing tokens...");
        clearAllTokens();
        
        console.log("🔄 Redirecting to login...");
        // Redirect berdasarkan endpoint
        if (isSiswaEndpoint) {
          window.location.href = '/siswa/login';
        } else {
          window.location.href = '/admin/login';
        }
      } else {
        console.log("⚠️ Login request failed (401), NOT clearing tokens");
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
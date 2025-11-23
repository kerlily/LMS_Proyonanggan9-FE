// src/_api/index.js (ATAU src/_api/axios.js - pastikan hanya ada 1 file!)
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});


api.interceptors.request.use(
  (config) => {
    // Jangan otomatis menghapus token di interceptor.
    const url = config.url || "";
    const isLoginRequest = url.includes("/login");
    if (isLoginRequest) {
      // tidak perlu Authorization header untuk login endpoints
      return config;
    }

    const isSiswaEndpoint = 
      url.startsWith("/siswa") || url.startsWith("siswa");
    const isPublicKelasList = url.includes("/kelas") && !url.includes("/siswa");

    let finalToken = null;
    if (isSiswaEndpoint) {
      finalToken = localStorage.getItem("siswa_token");
      if (!finalToken) {
        // hanya log; jangan hapus token lain
        console.warn(`⚠️ No siswa_token for siswa endpoint: ${url}`);
      }
    } else {
      // untuk admin/guru endpoint
      finalToken = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!finalToken && !isPublicKelasList) {
        console.warn(`⚠️ No admin token for protected endpoint: ${url}`);
      }
    }

    if (finalToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - jangan clear token pada response sukses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔴 Axios response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Hanya clear token jika 401 dan Anda memang ingin memaksa logout
    if (error.response?.status === 401) {
      // optional: only clear the relevant token, do not aggressively clear everything
      // clearAllTokens(); // <-- jangan otomatis panggil kecuali Anda ingin logout global
    }

    return Promise.reject(error);
  }
);
export default api;
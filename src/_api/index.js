// src/_api/axios.js or src/_api/index.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false, // kita pakai JWT di localStorage
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    // Priority: siswa_token > token > access_token
    const siswaToken = localStorage.getItem("siswa_token");
    const token = localStorage.getItem("token");
    const accessToken = localStorage.getItem("access_token");
    
    // Gunakan token yang ada (siswa punya priority)
    const finalToken = siswaToken || token || accessToken;
    
    if (finalToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${finalToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika 401 dan ada response dari server
    if (error.response?.status === 401) {
      // Check apakah ini siswa atau admin/guru berdasarkan URL
      const isSiswaEndpoint = error.config?.url?.includes('/siswa/');
      
      // Clear token yang sesuai
      if (isSiswaEndpoint) {
        localStorage.removeItem("siswa_token");
        localStorage.removeItem("siswa_userInfo");
      }
      
      // Always clear generic tokens on 401
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("user");
      
      // Optional: redirect ke login
      // Uncomment jika ingin auto-redirect
      if (isSiswaEndpoint) {
        window.location.href = '/siswa/login';
      } else {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
// src/_api/index.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});

// Flag untuk mencegah multiple refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

// Function untuk notify semua subscribers setelah token di-refresh
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// Function untuk add subscriber yang menunggu refresh
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const isLoginRequest = url.includes("/login");
    
    // Skip auth header untuk login requests
    if (isLoginRequest) {
      return config;
    }

    // Tentukan endpoint siswa atau admin/guru
    const isSiswaEndpoint = 
      url.startsWith("/siswa") || url.startsWith("siswa");
    const isPublicEndpoint = 
      url.includes("/kelas") && !url.includes("/siswa") ||
      url.includes("/beritas") ||
      url.includes("/public") ||
      url.includes("/galleries") ||
      url.includes("/mapel/all");

    let finalToken = null;
    
    if (isSiswaEndpoint) {
      // Gunakan siswa_token untuk endpoint siswa
      finalToken = localStorage.getItem("siswa_token");
      if (!finalToken) {
        console.warn(`⚠️ No siswa_token for siswa endpoint: ${url}`);
      }
    } else {
      // Gunakan token admin/guru untuk endpoint lainnya
      finalToken = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!finalToken && !isPublicEndpoint) {
        console.warn(`⚠️ No admin token for protected endpoint: ${url}`);
      }
    }

    // Set Authorization header jika ada token
    if (finalToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR dengan Auto-Refresh
api.interceptors.response.use(
  (response) => {
    // Check jika ada token baru dari header (auto-refresh dari backend middleware)
    const newToken = response.headers['authorization'];
    const wasRefreshed = response.headers['x-token-refreshed'];
    
    if (wasRefreshed === 'true' && newToken) {
      const token = newToken.replace('Bearer ', '');
      const url = response.config.url || "";
      const isSiswaEndpoint = 
        url.startsWith("/siswa") || url.startsWith("siswa");
      
      // Update token yang sesuai
      if (isSiswaEndpoint) {
        localStorage.setItem("siswa_token", token);
        console.log("✅ Siswa token auto-refreshed");
      } else {
        localStorage.setItem("token", token);
        localStorage.setItem("access_token", token);
        console.log("✅ Admin token auto-refreshed");
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorCode = error.response?.data?.error_code;
    const status = error.response?.status;
    
    console.error("🔴 Axios response error:", {
      url: originalRequest?.url,
      status,
      errorCode,
      message: error.response?.data?.message || error.message
    });

    // Handle 401 dengan TOKEN_EXPIRED
    if (status === 401 && errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      const url = originalRequest.url || "";
      const isSiswaEndpoint = 
        url.startsWith("/siswa") || url.startsWith("siswa");
      
      // Jika sudah ada refresh yang berjalan, tunggu hasil
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let newToken;
        
        if (isSiswaEndpoint) {
          // Refresh siswa token
          const siswaToken = localStorage.getItem("siswa_token");
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/siswa/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${siswaToken}`,
                Accept: "application/json"
              }
            }
          );
          
          newToken = refreshResponse.data.access_token || refreshResponse.data.token;
          localStorage.setItem("siswa_token", newToken);
          console.log("✅ Siswa token refreshed successfully");
        } else {
          // Refresh admin/guru token
          const adminToken = localStorage.getItem("token") || localStorage.getItem("access_token");
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
                Accept: "application/json"
              }
            }
          );
          
          newToken = refreshResponse.data.access_token || refreshResponse.data.token;
          localStorage.setItem("token", newToken);
          localStorage.setItem("access_token", newToken);
          console.log("✅ Admin token refreshed successfully");
        }

        isRefreshing = false;
        onRefreshed(newToken);

        // Retry original request dengan token baru
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        
        console.error("❌ Token refresh failed:", refreshError);
        
        // Clear tokens dan redirect ke login
        if (isSiswaEndpoint) {
          localStorage.removeItem("siswa_token");
          localStorage.removeItem("userInfo");
          // Redirect siswa ke halaman login siswa
          if (window.location.pathname !== "/siswa/login") {
            window.location.href = "/siswa/login";
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("userInfo");
          localStorage.removeItem("user");
          // Redirect admin/guru ke halaman login
          if (window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle 401 tanpa TOKEN_EXPIRED (invalid token, dll)
    if (status === 401 && errorCode !== 'TOKEN_EXPIRED') {
      const url = originalRequest?.url || "";
      const isSiswaEndpoint = 
        url.startsWith("/siswa") || url.startsWith("siswa");
      
      // Clear tokens yang sesuai
      if (isSiswaEndpoint) {
        localStorage.removeItem("siswa_token");
        localStorage.removeItem("userInfo");
        if (window.location.pathname !== "/siswa/login") {
          window.location.href = "/siswa/login";
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
// src/_services/siswa.js
import api from "../_api";

/**
 * loginSiswa
 * FIXED: Clear semua token dari admin/guru sebelum login siswa
 */
export const loginSiswa = async ({ nama, kelas_id, password }) => {
  try {
    // PENTING: Bersihkan semua token lama dari admin/guru
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");

    const body = {
      nama: nama ?? "",
      kelas_id: Number(kelas_id),
      password: password ?? "",
    };

    const { data } = await api.post("/siswa/login", body);

    // Save token dengan prefix siswa_ untuk avoid conflict
    const token = data.access_token ?? data.token ?? null;
    const user = data.user ?? data.userInfo ?? null;

    if (token) {
      // Gunakan key yang unik untuk siswa
      localStorage.setItem("siswa_token", token);
      localStorage.setItem("token", token); // backward compatibility
    }
    
    if (user) {
      try {
        // Tambahkan flag bahwa ini siswa
        const userWithRole = { ...user, userType: 'siswa' };
        localStorage.setItem("siswa_userInfo", JSON.stringify(userWithRole));
        localStorage.setItem("userInfo", JSON.stringify(userWithRole));
      } catch (e) {
        console.warn("Gagal menyimpan userInfo:", e);
      }
    }

    return data;
  } catch (error) {
    console.error("loginSiswa error:", error);
    throw error;
  }
};

/**
 * logoutSiswa
 * FIXED: Clear semua token siswa dengan proper cleanup
 */
export const logoutSiswa = async () => {
  // Clear semua token siswa
  localStorage.removeItem("siswa_token");
  localStorage.removeItem("siswa_userInfo");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("user");
  // Panggil endpoint logout (optional, akan gagal jika token invalid)
  try {
    await api.post("/siswa/logout");
  } catch (err) {
    console.warn("logoutSiswa API call failed (ignored):", err?.message || err);
  }

};

export const getKelas = () => api.get("/kelas");

export const getSiswaByKelas = (kelasId) => api.get(`/kelas/${kelasId}/siswa`);
export const getNilaiMe = () => api.get("/siswa/me/nilai");
export const changePassword = (payload) => api.post("/siswa/me/password", payload);
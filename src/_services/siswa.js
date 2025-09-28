// src/_services/siswa.js
import api from "../_api";

/**
 * loginSiswa
 * Mengirim payload { nama, kelas_id, password }
 * Menyimpan token + user sesuai konvensi project Anda (token, userInfo)
 */
export const loginSiswa = async ({ nama, kelas_id, password }) => {
  try {
    const body = {
      nama: nama ?? "",
      kelas_id: Number(kelas_id),
      password: password ?? "",
    };

    const { data } = await api.post("/siswa/login", body);

    // toleransi nama token/user dari backend
    const token = data.access_token ?? data.token ?? null;
    const user = data.user ?? data.userInfo ?? null;

    if (token) {
      localStorage.setItem("token", token);
    }
    if (user) {
      try {
        localStorage.setItem("userInfo", JSON.stringify(user));
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

export const logoutSiswa = async () => {
   localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    // opsional: panggil endpoint logout di server
    try {
      await api.post("/siswa/logout");
    } catch (err) {
      console.warn("logoutSiswa error (ignored):", err?.message || err);
    }
};

export const getKelas = () => api.get("/kelas");
export const getSiswaByKelas = (kelasId) => api.get(`/kelas/${kelasId}/siswa`);
export const getNilaiMe = () => api.get("/siswa/me/nilai");
export const changePassword = (payload) => api.post("/siswa/me/password", payload);

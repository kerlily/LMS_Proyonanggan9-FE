// src/_services/kelas.js
import api from "../_api";

/**
 * getKelasList:
 * - Utama: panggil /admin/mapel/statistics dan kembalikan { data: [...] }
 * - Fallback: jika gagal atau response beda shape, coba /kelas
 */
export const getKelasList = async (params = {}) => {
  try {
    // panggil statistik mapel per kelas (admin endpoint yang sudah ada)
    const res = await api.get("/admin/mapel/statistics", { params });

    // expected: res.data.statistics -> array of { id, nama, tingkat, section, ... }
    const stats = res.data?.statistics ?? null;
    if (Array.isArray(stats)) {
      // normalisasi: ubah ke format yang dipakai komponen (array of kelas)
      const kelasArr = stats.map((s) => ({
        id: s.id,
        nama: s.nama,
        tingkat: s.tingkat ?? null,
        section: s.section ?? null,
        mapel_count: s.mapel_count ?? 0,
        status: s.status ?? null,
      }));
      return { data: kelasArr };
    }

    // jika bukan format terduga, kembalikan res langsung (caller akan handle)
    return res;
  } catch (err) {
    // jika statistik gagal (mis. permission), coba fallback ke /kelas (public)
    try {
      const res2 = await api.get("/kelas", { params });
      // normalisasi: jika backend mengembalikan array or pagination
      if (Array.isArray(res2.data)) return { data: res2.data };
      if (Array.isArray(res2.data?.data)) return { data: res2.data.data };
      return res2;
    } catch (err2) {
      // berikan error ke caller untuk ditangani
        console.error("getKelasList fallback error:", err2);
      throw err; // prefer error awal
    }
  }
};

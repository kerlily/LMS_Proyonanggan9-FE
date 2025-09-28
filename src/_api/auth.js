import api from "./axios";

// Login siswa
export const siswaLogin = (payload) => {
  // jika payload punya 'name', map ke 'nama' otomatis
  const body = { ...payload };
  if (body.name && !body.nama) {
    body.nama = body.name;
    delete body.name;
  }
  return api.post("/siswa/login", body);
};

// Logout siswa (akan mengirim Authorization header jika token ada)
export const siswaLogout = () => api.post("/siswa/logout");

// Get kelas list (endpoint yang sudah Anda tambahkan di Laravel)
export const getKelas = () => api.get("/kelas");

// Get siswa by kelas (endpoint yang sudah Anda tambahkan)
export const getSiswaByKelas = (kelasId) => api.get(`/kelas/${kelasId}/siswa`);

// Get nilai siswa (after login)
export const getNilaiMe = () => api.get("/siswa/me/nilai");

// Change password (placeholder - adjust endpoint if perlu)
export const changePassword = (data) => api.post("/siswa/me/password", data);

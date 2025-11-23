// src/pages/public/studentLogin.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { getKelas, getSiswaByKelas } from "../../_services/siswa";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

/**
 * StudentLogin
 * - pilih kelas -> fetch siswa
 * - pilih nama -> nama auto terisi
 * - masukkan password -> login
 */
export default function StudentLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const [kelasList, setKelasList] = useState([]);
  const [kelasId, setKelasId] = useState("");
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState("");
  const [namaValue, setNamaValue] = useState("");
  const [password, setPassword] = useState("");

  const [loadingKelas, setLoadingKelas] = useState(false);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState(null);

  const { user, loginSiswa } = useContext(AuthContext);

  const getSiswaName = (s) =>
    s?.nama || s?.name || s?.full_name || s?.fullname || s?.username || "";

  const handleLoadKelas = async () => {
  setLoadingKelas(true);
  try {
    const res = await getKelas();
    setKelasList(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Gagal ambil kelas:", err);
  } finally {
    setLoadingKelas(false);
  }
};

  // load kelas otomatis saat komponen mount
  useEffect(() => {
    handleLoadKelas();
  }, []);

useEffect(() => {
  // only redirect when there is a logged-in siswa with a siswa token
  if (!user) return;

  // deteksi token siswa di localStorage (fallback bila AuthProvider belum set token)
  const siswaToken = localStorage.getItem("siswa_token");
  const genericToken = localStorage.getItem("token") || localStorage.getItem("access_token");

  // Deteksi apakah user adalah murid.
  // Preferensi: periksa property role, kalau tidak ada, cek key unik siswa seperti kelas_id, nis, dll.
  const isSiswa = user?.role === "siswa" || Boolean(user?.kelas_id) || Boolean(user?.siswa_id);

  // hanya redirect kalau benar murid dan ada siswa token (atau generic token)
  if (isSiswa && (siswaToken || genericToken)) {
    // use navigate but DO NOT include navigate in deps to avoid re-run from unstable ref
    if (location.pathname !== "/siswa/dashboard") {
      navigate("/siswa/dashboard", { replace: true });
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user, location.pathname]);


 

  useEffect(() => {
    // reset saat ganti kelas
    setSiswaList([]);
    setSelectedSiswaId("");
    setNamaValue("");
    setPassword("");
    setError(null);

    if (!kelasId) return;

    setLoadingSiswa(true);
    getSiswaByKelas(kelasId)
      .then((res) => setSiswaList(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Gagal ambil siswa:", err);
        setSiswaList([]);
      })
      .finally(() => setLoadingSiswa(false));
  }, [kelasId]);

  const onSelectSiswa = (e) => {
    const id = e.target.value;
    setSelectedSiswaId(id);
    setError(null);
    if (!id) {
      setNamaValue("");
      return;
    }
    const s = siswaList.find((x) => String(x.id) === String(id));
    setNamaValue(getSiswaName(s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!kelasId) return setError("Silakan pilih kelas.");
    if (!namaValue) return setError("Silakan pilih nama siswa.");
    if (!password) return setError("Silakan masukkan password.");

    setLoadingLogin(true);
    try {
      await loginSiswa({ nama: namaValue, kelas_id: Number(kelasId), password });
    } catch (err) {
      console.error("Login error:", err);
      const serverMsg = err?.response?.data ?? err?.message ?? "Login gagal";
      setError(serverMsg?.message || JSON.stringify(serverMsg));
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center">
      {/* Header Image for Mobile */}
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-4 text-center">
          Login Murid
        </h1>
        <p className="text-gray-600 mb-6 text-center text-sm sm:text-base">
          Masuk untuk melihat nilai dan pelajaran
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              Pilih Kelas
            </label>
            <select
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
              required
              disabled={loadingKelas}
            >
              <option value="">{loadingKelas ? "Memuat kelas..." : "-- Pilih Kelas --"}</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>

          </div>

          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              Pilih Nama
            </label>
            <select
              value={selectedSiswaId}
              onChange={onSelectSiswa}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm sm:text-base"
              disabled={!kelasId || loadingSiswa}
              required
            >
              <option value="">{loadingSiswa ? "Memuat nama..." : "-- Pilih Nama --"}</option>
              {siswaList.map((s) => (
                <option key={s.id} value={s.id}>
                  {getSiswaName(s)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm sm:text-base"
                placeholder="Masukkan kata sandi"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">
              {error}
              
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              role="button"
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 text-sm sm:text-base inline-flex items-center justify-center text-center"
            >
              kembali
            </Link>
            <button
              type="submit"
              disabled={loadingLogin}
              className={`flex-1 py-3 rounded-lg text-white font-semibold text-sm sm:text-base ${
                loadingLogin ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              } transition duration-300`}
            >
              {loadingLogin ? "Memproses..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
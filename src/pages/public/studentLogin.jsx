// src/pages/public/studentLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // jika tidak pakai lucide, hapus ikon / button
import { loginSiswa, getKelas, getSiswaByKelas } from "../../_services/siswa";

/**
 * StudentLogin
 * - pilih kelas -> fetch siswa
 * - pilih nama -> nama auto terisi
 * - masukkan password -> login
 */
export default function StudentLogin() {
  const navigate = useNavigate();
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

  const getSiswaName = (s) =>
    s?.nama || s?.name || s?.full_name || s?.fullname || s?.username || "";

  useEffect(() => {
    // jika sudah login redirect
    const u = localStorage.getItem("userInfo");
    if (u) {
      navigate("/siswa/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    (async () => {
      setLoadingKelas(true);
      try {
        const res = await getKelas();
        setKelasList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Gagal ambil kelas:", err);
      } finally {
        setLoadingKelas(false);
      }
    })();
  }, []);

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
      navigate("/siswa/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const serverMsg = err?.response?.data ?? err?.message ?? "Login gagal";
      setError(serverMsg?.message || JSON.stringify(serverMsg));
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#1cc5ae] text-white">
        <div className="max-w-md text-center p-8">
          <h2 className="text-3xl font-bold">LMS Sekolah</h2>
          <p className="mt-2">Masuk sebagai siswa untuk melihat nilai</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Login Siswa</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Pilih Kelas</label>
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                required
              >
                <option value="">{loadingKelas ? "Memuat..." : "-- Pilih Kelas --"}</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama || k.name || (k.tingkat ? `${k.tingkat} ${k.nama || k.name}` : `${k.kelas || k.name}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Pilih Nama</label>
              <select
                value={selectedSiswaId}
                onChange={onSelectSiswa}
                className="w-full px-4 py-2 border rounded"
                disabled={!kelasId || loadingSiswa}
                required
              >
                <option value="">{loadingSiswa ? "Memuat siswa..." : "-- Pilih Nama --"}</option>
                {siswaList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getSiswaName(s)}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setKelasId("");
                  setSiswaList([]);
                  setSelectedSiswaId("");
                  setNamaValue("");
                  setPassword("");
                  setError(null);
                }}
                className="flex-1 py-2 border rounded"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={loadingLogin}
                className={`flex-1 py-2 rounded text-white ${loadingLogin ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loadingLogin ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

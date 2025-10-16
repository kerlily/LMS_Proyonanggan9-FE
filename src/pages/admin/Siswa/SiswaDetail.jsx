// src/pages/admin/Siswa/SiswaDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import AdminLayout from "../../../components/layout/AdminLayout";
import api from "../../../_api";
import { showSiswa, deleteSiswa } from "../../../_services/admin";

function Row({ label, children }) {
  return (
    <div className="flex gap-6 py-3 border-b border-gray-200 last:border-b-0">
      <div className="w-40 text-sm font-medium text-gray-700">{label}</div>
      <div className="flex-1 text-sm text-gray-900">{children}</div>
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function SiswaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [siswa, setSiswa] = useState(null);
  const [kelasSaatIni, setKelasSaatIni] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [academic, setAcademic] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await showSiswa(id);
        const data = res?.data ?? {};
        const s = data.siswa ?? null;
        if (!s) {
          throw new Error("Data siswa tidak ditemukan");
        }
        if (!mounted) return;
        setSiswa(s);
        setKelasSaatIni(data.kelas_saat_ini ?? null);
        setRiwayat(Array.isArray(data.riwayat_kelas) ? data.riwayat_kelas : []);
        setAcademic(Array.isArray(data.academic_records) ? data.academic_records : []);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.message || e.message || "Gagal memuat data siswa");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => (mounted = false);
  }, [id]);

  const handleDelete = async () => {
    if (!siswa) return;
    const answer = await Swal.fire({
      title: `Hapus siswa "${siswa.nama}"?`,
      text: "Semua data terkait (nilai, riwayat) akan dihapus. Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!answer.isConfirmed) return;

    try {
      await deleteSiswa(id);
      await Swal.fire({ icon: "success", title: "Berhasil", text: "Siswa dihapus." });
      navigate("/admin/siswa");
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || e.message || "Gagal menghapus siswa.";
      Swal.fire({ icon: "error", title: "Gagal", text: message });
    }
  };

  const handleResetPassword = async () => {
    if (!siswa) return;
    const { value: formValues } = await Swal.fire({
      title: `Reset password untuk "${siswa.nama}"`,
      html:
        `<input id="swal-new" class="swal2-input" placeholder="Password baru">` +
        `<input id="swal-confirm" class="swal2-input" placeholder="Konfirmasi password">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reset",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const newPass = document.getElementById("swal-new")?.value ?? "";
        const conf = document.getElementById("swal-confirm")?.value ?? "";
        if (!newPass) {
          Swal.showValidationMessage("Masukkan password baru");
          return false;
        }
        if (newPass !== conf) {
          Swal.showValidationMessage("Password dan konfirmasi tidak cocok");
          return false;
        }
        return { new_password: newPass, new_password_confirmation: conf };
      },
    });

    if (!formValues) return;

    try {
      const res = await api.post(`/admin/siswa/${id}/reset-password`, formValues);
      const data = res?.data ?? {};
      const possiblePwd = data.raw_password ?? data.new_password ?? null;
      const successMsg = data.message ?? "Password berhasil direset.";

      await Swal.fire({
        icon: "success",
        title: "Sukses",
        html: possiblePwd
          ? `${successMsg}<br/><br/><b>Password baru:</b> <code>${possiblePwd}</code>`
          : `${successMsg}`,
      });
    } catch (e) {
      console.error("reset password error:", e);
      const message = e?.response?.data?.message || e.message || "Gagal reset password.";
      Swal.fire({ icon: "error", title: "Gagal", text: message });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-600 animate-pulse">Memuat detail siswa...</div>
      </AdminLayout>
    );
  }

  if (err) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-red-500 font-medium">{err}</div>
      </AdminLayout>
    );
  }

  if (!siswa) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-600 font-medium">Siswa tidak ditemukan.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{siswa.nama}</h1>
            <div className="text-sm text-gray-500 mt-1">ID: {siswa.id} • Dibuat: {formatDate(siswa.created_at)}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/admin/siswa/edit/${siswa.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Edit
            </Link>
            <button
              onClick={handleResetPassword}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition duration-200"
            >
              Reset Password
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
            >
              Hapus
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              Kembali
            </button>
          </div>
        </div>

        {/* Profile & Kelas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Profil Siswa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Row label="Nama">{siswa.nama}</Row>
              <Row label="Tahun Lahir">{siswa.tahun_lahir ?? "-"}</Row>
              <Row label="Status Alumni">{siswa.is_alumni ? "Ya" : "Tidak"}</Row>
            </div>
            <div className="space-y-2">
              <Row label="Kelas Saat Ini">
                {kelasSaatIni ? (
                  <div>
                    <div className="font-semibold text-indigo-600">{kelasSaatIni.nama}</div>
                    <div className="text-xs text-gray-500">Tingkat {kelasSaatIni.tingkat} {kelasSaatIni.section ?? ""}</div>
                  </div>
                ) : (
                  <span>-</span>
                )}
              </Row>
              <Row label="Terakhir Diupdate">{formatDate(siswa.updated_at)}</Row>
            </div>
          </div>
        </div>

        {/* Riwayat Kelas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Kelas</h3>
          {riwayat.length === 0 ? (
            <div className="text-sm text-gray-500">Belum ada riwayat kelas.</div>
          ) : (
            <div className="space-y-3">
              {riwayat.map((r, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{r.kelas?.nama ?? "-"}</div>
                      <div className="text-xs text-gray-500">
                        Tahun ajaran: {r.tahun_ajaran?.nama ?? "-"} • Tingkat {r.kelas?.tingkat ?? "-"} {r.kelas?.section ?? ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academic Records */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Records</h3>
          {academic.length === 0 ? (
            <div className="text-sm text-gray-500">Belum ada data nilai.</div>
          ) : (
            <div className="space-y-4">
              {academic.map((group, gidx) => {
                const ta = group.tahun_ajaran?.nama ?? "-";
                const sem = group.semester?.nama ?? "-";
                return (
                  <div key={gidx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{ta} — Semester {sem}</div>
                        <div className="text-xs text-gray-500">
                          Jumlah mapel: {Array.isArray(group.nilai) ? group.nilai.length : 0}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left bg-gray-100 border-b border-gray-200">
                              <th className="py-3 px-4 font-semibold text-gray-700">Mata Pelajaran</th>
                              <th className="py-3 px-4 font-semibold text-gray-700 w-28">Nilai</th>
                              <th className="py-3 px-4 font-semibold text-gray-700">Catatan</th>
                              <th className="py-3 px-4 font-semibold text-gray-700">Input By</th>
                              <th className="py-3 px-4 font-semibold text-gray-700 w-40">Terakhir Update</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(group.nilai) && group.nilai.length > 0 ? (
                              group.nilai.map((n) => (
                                <tr key={n.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition">
                                  <td className="py-3 px-4">
                                    <div className="font-semibold text-gray-800">{n.mapel?.nama ?? "-"}</div>
                                    <div className="text-xs text-gray-500">{n.mapel?.kode ?? ""}</div>
                                  </td>
                                  <td className="py-3 px-4 font-medium text-indigo-600">{n.nilai ?? "-"}</td>
                                  <td className="py-3 px-4 text-gray-600">{n.catatan ?? "-"}</td>
                                  <td className="py-3 px-4 text-gray-600">{n.input_by_guru?.nama ?? "-"}</td>
                                  <td className="py-3 px-4 text-gray-600">{formatDate(n.updated_at)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">
                                  Tidak ada nilai untuk periode ini.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

       
      </div>
    </AdminLayout>
  );
}
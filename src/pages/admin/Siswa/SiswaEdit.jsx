// src/pages/admin/Siswa/SiswaEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import api from "../../../_api";
import {
  showSiswa,
  updateSiswa,
  deleteSiswa,
} from "../../../_services/admin";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function SiswaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const [siswa, setSiswa] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    tahun_lahir: "",
    kelas_id: null,
    is_alumni: false,
  });

  const [kelasOptions, setKelasOptions] = useState([]);

  // fetch siswa detail + kelas list
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await showSiswa(id);
        const data = res?.data ?? {};
        const s = data.siswa ?? res?.data ?? null;
        if (!s) throw new Error("Data siswa tidak ditemukan");

        if (!mounted) return;

        setSiswa(s);
        setForm({
          nama: s.nama ?? "",
          tahun_lahir: s.tahun_lahir ?? "",
          kelas_id: s.kelas_id ?? null,
          is_alumni: !!s.is_alumni,
        });

        // ambil daftar kelas dari statistics endpoint (dipakai sebagai options)
        try {
          const ks = await api.get("/admin/kelas-mapel/statistics");
          const stats = ks?.data?.statistics ?? ks?.data ?? [];
          if (Array.isArray(stats) && mounted) {
            const opts = stats.map((k) => ({
              id: k.id,
              label: `${k.nama} — Tingkat ${k.tingkat}${k.section ? ` ${k.section}` : ""}`,
            }));
            setKelasOptions(opts);
          }
        } catch (e) {
          // tidak fatal
          console.warn("Gagal ambil daftar kelas:", e);
          setKelasOptions([]);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e?.response?.data?.message || e.message || "Gagal memuat data siswa.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => (mounted = false);
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);

    if (!form.nama || !form.nama.trim()) {
      Swal.fire({ icon: "warning", title: "Nama wajib diisi." });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        nama: form.nama,
        tahun_lahir: form.tahun_lahir ? Number(form.tahun_lahir) : undefined,
        kelas_id: form.kelas_id || null,
        is_alumni: !!form.is_alumni,
      };

      const res = await updateSiswa(id, payload);
      const data = res?.data ?? {};
      setMsg(data.message ?? "Berhasil menyimpan.");
      Swal.fire({ icon: "success", title: "Berhasil", text: data.message ?? "Perubahan tersimpan." });

      // jika response mengembalikan siswa yang diupdate, sinkronkan local state
      const updated = data.siswa ?? data;
      if (updated) {
        setSiswa(updated);
        setForm({
          nama: updated.nama ?? form.nama,
          tahun_lahir: updated.tahun_lahir ?? form.tahun_lahir,
          kelas_id: updated.kelas_id ?? form.kelas_id,
          is_alumni: !!updated.is_alumni,
        });
      }
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || e.message || "Gagal menyimpan siswa.";
      setErr(message);
      Swal.fire({ icon: "error", title: "Gagal", text: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const answer = await Swal.fire({
      title: `Hapus siswa "${siswa?.nama}"?`,
      text: "Data nilai dan riwayat akan ikut dihapus. Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
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

  // RESET PASSWORD: open modal (SweetAlert) to ask new_password & confirmation,
  // then POST to /admin/siswa/{id}/reset-password with JSON { new_password, new_password_confirmation }
  const handleResetPassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: `Reset password untuk "${siswa?.nama}"`,
      html:
        `<input id="swal-new" class="swal2-input" placeholder="Password baru">` +
        `<input id="swal-confirm" class="swal2-input" placeholder="Konfirmasi password">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reset",
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

    if (!formValues) return; // cancelled

    try {
      // prefer service if you have it; otherwise call api directly
      // if you have resetSiswaPassword in services: await resetSiswaPassword(id, formValues);
      const res = await api.post(`/admin/siswa/${id}/reset-password`, formValues);
      const data = res?.data ?? {};

      // show returned info. backend might include raw password or just message.
      const possiblePwd =
        data.raw_password ??
        data.password ??
        data.new_password ??
        data.new_password ?? // fallback
        null;

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

  if (loading)
    {
        return (
          <AdminLayout>
        <div className="p-6">Memuat data siswa...</div>
         </AdminLayout>  
      );
    } 
  if (err && !siswa)
     {
         return (
            <AdminLayout>
        <div className="p-6 text-red-600">{err}</div>;
        </AdminLayout>
        )
        }
            

  if (!siswa)  {
    return (
    <AdminLayout>
    <div className="p-6 text-gray-600">Siswa tidak ditemukan.</div>;
    </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Edit Siswa</h1>
            <div className="text-sm text-gray-500">ID: {siswa.id}</div>
          </div>
        </div>

        {err && <div className="mb-3 text-red-600">{err}</div>}
        {msg && <div className="mb-3 text-green-600">{msg}</div>}

        <div className="bg-white p-6 rounded shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tahun Lahir</label>
            <input
              name="tahun_lahir"
              type="number"
              value={form.tahun_lahir ?? ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kelas</label>
            <select
              name="kelas_id"
              value={form.kelas_id ?? ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Pilih kelas (kosong = belum ada) --</option>
              {kelasOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_alumni"
              name="is_alumni"
              type="checkbox"
              checked={!!form.is_alumni}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="is_alumni" className="text-sm">Tandai sebagai alumni</label>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleResetPassword}
              className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Reset Password
            </button>

            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Hapus Siswa
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

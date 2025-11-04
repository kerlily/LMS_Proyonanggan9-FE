// src/pages/admin/Guru/GuruEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { showGuru, updateGuru, resetGuruPassword, deleteGuru } from "../../../_services/admin";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function GuruEdit() {
  const { id } = useParams();
  const [guru, setGuru] = useState(null);
  const [form, setForm] = useState({ nama: "", email: "", nip: "", no_hp: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await showGuru(id);
        if (!mounted) return;
        const g = res.data?.guru ?? res.data ?? res.data?.data ?? null;
        const photo_url =
          res.data?.photo_url ??
          g?.photo_url ??
          (g?.photo ? (g.photo.startsWith("http") ? g.photo : `${window.location.origin}/storage/${g.photo}`) : null);
        setGuru({ ...g, photo_url });
        setForm({
          nama: g?.nama ?? g?.user?.name ?? "",
          email: g?.user?.email ?? "",
          nip: g?.nip ?? "",
          no_hp: g?.no_hp ?? "",
        });
        setPhotoPreview(photo_url);
      } catch (e) {
        console.error(e);
        const message = e?.response?.data?.message || "Gagal memuat data guru";
        setErr(message);
        Swal.fire({ icon: "error", title: "Error", text: message });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setPhotoFile(f);
    if (f) setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const fd = new FormData();
      if (form.nama) fd.append("nama", form.nama);
      if (form.email) fd.append("email", form.email);
      if (form.nip !== undefined) fd.append("nip", form.nip);
      if (form.no_hp !== undefined) fd.append("no_hp", form.no_hp);
      if (photoFile) fd.append("photo", photoFile);

      const res = await updateGuru(id, fd);
      const message = res?.data?.message ?? "Berhasil update";
      setMsg(message);
      Swal.fire({ icon: "success", title: "Sukses", text: message });

      // update local state
      const updatedGuru = res?.data?.guru ?? res?.data ?? guru;
      const photo_url = res?.data?.photo_url ?? updatedGuru?.photo_url ?? photoPreview;
      setGuru({ ...updatedGuru, photo_url });
      setPhotoPreview(photo_url);
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || "Gagal update guru";
      setErr(message);
      Swal.fire({ icon: "error", title: "Error", text: message });
    } finally {
      setSaving(false);
    }
  };

  // Reset password using SweetAlert2 with two inputs (pw + confirm)
  const handleReset = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Reset Password Guru",
      html:
        '<input id="swal-pw" type="password" class="swal2-input" placeholder="Password baru">' +
        '<input id="swal-pw2" type="password" class="swal2-input" placeholder="Konfirmasi password">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reset Password",
      preConfirm: () => {
        const pw = document.getElementById("swal-pw")?.value ?? "";
        const pw2 = document.getElementById("swal-pw2")?.value ?? "";
        if (!pw) {
          Swal.showValidationMessage("Isi password baru");
          return false;
        }
        if (pw !== pw2) {
          Swal.showValidationMessage("Konfirmasi password tidak cocok");
          return false;
        }
        return { new_password: pw, new_password_confirmation: pw2 };
      },
    });

    if (!formValues) return; // cancelled

    try {
      const payload = formValues;
      const res = await resetGuruPassword(id, payload);
      // backend may return raw_password
      const raw = res?.data?.raw_password ?? payload.new_password;
      Swal.fire({
        icon: "success",
        title: "Password di-reset",
        html: `Password baru: <b>${raw}</b><br/><small>Salin dan beritahu guru.</small>`,
      });
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || "Gagal reset password";
      Swal.fire({ icon: "error", title: "Error", text: message });
    }
  };

  // Delete with confirm
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Hapus guru "${guru?.nama ?? ""}"?`,
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteGuru(id);
      Swal.fire({ icon: "success", title: "Terhapus", text: "Guru berhasil dihapus" });
      navigate("/admin/guru");
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || "Gagal hapus guru";
      Swal.fire({ icon: "error", title: "Error", text: message });
    }
  };


  if (loading) return (
    <AdminLayout>
      <div className="p-6">Memuat...</div>
    </AdminLayout>
  ) 

  return (
    <AdminLayout>
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        {photoPreview ? (
          <img src={photoPreview} alt="foto" className="w-20 h-20 rounded-full object-cover shadow" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">G</div>
        )}
        <div>
          <h2 className="text-xl font-semibold">{guru?.nama ?? "-"}</h2>
          <div className="text-sm text-gray-500">{guru?.user?.email ?? ""}</div>
        </div>
      </div>

      {err && <div className="mb-3 text-red-600">{err}</div>}
      {msg && <div className="mb-3 text-green-600">{msg}</div>}

      <div className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block text-sm font-medium">Nama</label>
          <input
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">NIP</label>
            <input name="nip" value={form.nip} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">No HP</label>
            <input name="no_hp" value={form.no_hp} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Ganti Foto</label>
          <input type="file" onChange={handleFile} accept="image/*" />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={handleDelete} className="px-3 py-2 bg-red-600 text-white rounded shadow">Hapus Guru</button>
          <button onClick={handleReset} className="px-3 py-2 border rounded shadow">Reset Password</button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-2 bg-green-600 text-white rounded shadow">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}

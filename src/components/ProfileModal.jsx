// src/components/ProfileModal.jsx
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { X, Camera } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { updateMyProfile } from "../_services/profile";
import api from "../_api";

const MySwal = withReactContent(Swal);

// Accessibility bind
Modal.setAppElement("#root");

export default function ProfileModal({ isOpen, onRequestClose, initialUser }) {
  const [form, setForm] = useState({
    nama: initialUser?.nama ?? initialUser?.name ?? "",
    email: initialUser?.email ?? "",
    no_hp: initialUser?.no_hp ?? "",
    nip: initialUser?.nip ?? "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUser?.photo_url ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      nama: initialUser?.nama ?? initialUser?.name ?? "",
      email: initialUser?.email ?? "",
      no_hp: initialUser?.no_hp ?? "",
      nip: initialUser?.nip ?? "",
    });
    setPreviewUrl(initialUser?.photo_url ?? null);
    setPhotoFile(null);
  }, [initialUser, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    setPhotoFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      // Backend in your screenshot expects 'name' (or 'nama'), adapt if needed
      fd.append("name", form.nama);
      fd.append("email", form.email);
      if (form.no_hp) fd.append("no_hp", form.no_hp);
      if (form.nip) fd.append("nip", form.nip);
      if (photoFile) fd.append("photo", photoFile);

      // prefer service wrapper if available
      const res = await updateMyProfile(fd);
      MySwal.fire({ icon: "success", title: "Profil diperbarui" });
      // optionally update localStorage userInfo with returned user
      const newUser = res?.data?.user ?? res?.data ?? null;
      if (newUser) {
        try {
          const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
          const prev = raw ? JSON.parse(raw) : {};
          const merged = { ...prev, ...newUser };
          localStorage.setItem("userInfo", JSON.stringify(merged));
        } catch (e) { /* ignore */ }
      }
      onRequestClose();
    } catch (err) {
      console.error("update profile err", err);
      MySwal.fire({
        icon: "error",
        title: "Gagal menyimpan profil",
        text: err?.response?.data?.message || err.message || "Terjadi kesalahan",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-4"
      className="bg-white rounded-lg max-w-xl w-full shadow-lg outline-none"
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit Profil</h3>
        <button onClick={onRequestClose} className="p-1 rounded hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400">No Photo</div>
            )}
          </div>

          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 bg-gray-50 border rounded">
              <Camera className="w-4 h-4" />
              <span className="text-sm">Ganti Foto</span>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Nama</label>
          <input name="nama" value={form.nama} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">No. HP</label>
            <input name="no_hp" value={form.no_hp} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">NIP</label>
            <input name="nip" value={form.nip} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onRequestClose} className="px-4 py-2 border rounded">Batal</button>
          <button type="submit" disabled={saving} className={`px-4 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-indigo-600"}`}>
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

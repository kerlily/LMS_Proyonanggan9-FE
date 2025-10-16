// src/components/ChangePasswordModal.jsx
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { changeMyPassword } from "../_services/profile";

const MySwal = withReactContent(Swal);

// Accessibility - sesuaikan root id jika berbeda
Modal.setAppElement("#root");

export default function ChangePasswordModal({ isOpen, onRequestClose }) {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ old_password: "", new_password: "", new_password_confirmation: "" });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.new_password || form.new_password !== form.new_password_confirmation) {
      return MySwal.fire({ icon: "warning", title: "Konfirmasi password tidak cocok" });
    }

    setSaving(true);
    try {
      await MySwal.fire({
        title: "Memproses...",
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading(),
      });

      // payload keys match backend: old_password, new_password, new_password_confirmation
      await changeMyPassword({
        old_password: form.old_password || undefined,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation,
      });

      MySwal.close();
      MySwal.fire({ icon: "success", title: "Password berhasil diubah" });
      onRequestClose();
    } catch (err) {
      MySwal.close();
      console.error("change password error:", err);
      MySwal.fire({
        icon: "error",
        title: "Gagal mengubah password",
        text: err?.response?.data?.message || err?.message || "Terjadi kesalahan",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => !saving && onRequestClose()}
      overlayClassName="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-4"
      className="bg-white rounded-lg max-w-md w-full shadow-lg outline-none"
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ganti Password</h3>
        <button onClick={() => !saving && onRequestClose()} className="p-1 rounded hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Password Saat Ini</label>
          <input
            type="password"
            name="old_password"
            value={form.old_password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Masukkan password lama (kosongkan jika tidak diperlukan)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password Baru</label>
          <input
            type="password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Konfirmasi Password Baru</label>
          <input
            type="password"
            name="new_password_confirmation"
            value={form.new_password_confirmation}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => !saving && onRequestClose()} className="px-4 py-2 border rounded">
            Batal
          </button>
          <button type="submit" disabled={saving} className={`px-4 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-amber-600"}`}>
            {saving ? "Memproses..." : "Ganti Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

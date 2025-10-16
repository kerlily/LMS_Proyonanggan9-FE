// src/pages/admin/TahunAjaran/TahunAjaranForm.jsx
import React, { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";

export default function TahunAjaranForm({ isOpen, onClose, onSaved, initial = null, submitFn }) {
  // initial: { id, nama, is_active, semesters: [...] } or null for create
  const [form, setForm] = useState({ nama: "", is_active: 0 });

  useEffect(() => {
    if (initial) {
      setForm({
        nama: initial.nama ?? "",
        is_active: initial.is_active ? 1 : 0,
      });
    } else {
      setForm({ nama: "", is_active: 0 });
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitFn(form);
      onSaved && onSaved();
      onClose();
    } catch (err) {
      // let parent handle errors or show local
      console.error("save error", err);
      alert(err?.response?.data?.message || err?.message || "Gagal menyimpan");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{initial ? "Edit Tahun Ajaran" : "Buat Tahun Ajaran"}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama</label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
              placeholder="contoh: 2027/2028"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="flex items-center gap-3">
            <input id="is_active" name="is_active" type="checkbox" checked={!!form.is_active} onChange={handleChange} />
            <label htmlFor="is_active" className="text-sm">Set aktif (is_active)</label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Batal</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2">
              <Plus className="w-4 h-4"/> {initial ? "Simpan Perubahan" : "Buat Tahun Ajaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Upload, Calendar, Eye, EyeOff, X, Newspaper, Megaphone, Paperclip, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { createBerita, updateBerita } from '../_services/berita';

const ALLOWED_ATTACHMENT_EXTENSIONS = ['pdf', 'zip', 'rar', 'doc', 'docx'];
const MAX_ATTACHMENT_MB = 20;

function getAttachmentBadgeStyle(name) {
  if (!name) return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-500' };
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    pdf:  { bg: 'bg-red-50',    text: 'text-red-700',    icon: 'text-red-500'    },
    zip:  { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' },
    rar:  { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' },
    doc:  { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-500'   },
    docx: { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-500'   },
  };
  return map[ext] ?? { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-500' };
}

export default function BeritaForm({ initialData = null, onSaved = () => {}, onCancel = () => {} }) {
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [type, setType]                 = useState('berita');
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPublished, setIsPublished]   = useState(true);
  const [publishedAt, setPublishedAt]   = useState('');
  const [saving, setSaving]             = useState(false);

  // Attachment
  const [attachmentFile, setAttachmentFile]     = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setType(initialData.type || 'berita');
      setIsPublished(!!initialData.is_published);
      setPublishedAt(initialData.published_at ? formatForInput(initialData.published_at) : '');
      setImagePreview(initialData.image_url || null);
      setImageFile(null);
      setAttachmentFile(null);
      setRemoveAttachment(false);
    } else {
      resetForm();
    }
  }, [initialData]);

  function resetForm() {
    setTitle('');
    setDescription('');
    setType('berita');
    setImageFile(null);
    setImagePreview(null);
    setIsPublished(true);
    setPublishedAt('');
    setAttachmentFile(null);
    setRemoveAttachment(false);
  }

  function formatForInput(dateStr) {
    try {
      const d   = new Date(dateStr);
      const pad = (n) => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  // ── Image ─────────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File terlalu besar', text: 'Ukuran file gambar maksimal 5MB', confirmButtonColor: '#3b82f6' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Format tidak didukung', text: 'Hanya file gambar yang diperbolehkan', confirmButtonColor: '#3b82f6' });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => { setImageFile(null); setImagePreview(null); };

  // ── Attachment ────────────────────────────────────────────────────────────
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
      Swal.fire({
        icon: 'error',
        title: 'Format tidak didukung',
        text: `File lampiran harus berformat: ${ALLOWED_ATTACHMENT_EXTENSIONS.join(', ').toUpperCase()}`,
        confirmButtonColor: '#3b82f6',
      });
      e.target.value = '';
      return;
    }
    if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File terlalu besar',
        text: `Ukuran file lampiran maksimal ${MAX_ATTACHMENT_MB}MB`,
        confirmButtonColor: '#3b82f6',
      });
      e.target.value = '';
      return;
    }

    setAttachmentFile(file);
    setRemoveAttachment(false);
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setRemoveAttachment(true);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const existingHasAttachment = initialData?.has_attachment && !removeAttachment && !attachmentFile;
  const shownAttachmentName   = attachmentFile
    ? attachmentFile.name
    : existingHasAttachment
      ? (initialData.attachment_name ?? 'File terlampir')
      : null;
  const badgeStyle = getAttachmentBadgeStyle(shownAttachmentName);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Judul diperlukan', text: 'Silakan masukkan judul berita', confirmButtonColor: '#3b82f6' });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title',        title.trim());
      formData.append('description',  description.trim() || '');
      formData.append('type',         type);
      formData.append('is_published', isPublished ? 1 : 0);

      if (imageFile)    formData.append('image',             imageFile);
      if (publishedAt)  formData.append('published_at',      new Date(publishedAt).toISOString());

      if (attachmentFile)   formData.append('attachment',        attachmentFile);
      if (removeAttachment) formData.append('remove_attachment', '1');

      if (initialData?.id) {
        await updateBerita(initialData.id, formData);
      } else {
        await createBerita(formData);
      }

      onSaved();
      resetForm();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan',
        text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan berita',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Tipe Konten */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipe Konten <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('berita')}
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
              type === 'berita' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Newspaper className="w-5 h-5" />
            <span className="font-medium">Berita</span>
          </button>
          <button
            type="button"
            onClick={() => setType('pengumuman')}
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
              type === 'pengumuman' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Megaphone className="w-5 h-5" />
            <span className="font-medium">Pengumuman</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {type === 'pengumuman'
            ? '📢 Pengumuman akan ditampilkan dengan badge merah khusus'
            : '📰 Berita akan ditampilkan di halaman berita utama'}
        </p>
      </div>

      {/* Judul */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul Berita <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Masukkan judul berita..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Tulis deskripsi berita..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-vertical"
        />
      </div>

      {/* Upload Gambar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Berita</label>
        <div className="space-y-3">
          {!imagePreview ? (
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200 cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Klik untuk upload gambar atau drag & drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG (Maks. 5MB)</p>
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </label>
          ) : (
            <>
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <Upload className="w-4 h-4" />
                Ganti Gambar
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </>
          )}
        </div>
      </div>

      {/* ── File Lampiran ──────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            File Lampiran
            <span className="text-xs font-normal text-gray-400">(opsional — PDF, ZIP, RAR, DOC, DOCX)</span>
          </div>
        </label>

        {/* Info file aktif */}
        {shownAttachmentName && (
          <div className={`flex items-center gap-3 px-4 py-3 mb-3 rounded-lg border ${badgeStyle.bg}`}
               style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <FileText className={`w-5 h-5 shrink-0 ${badgeStyle.icon}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${badgeStyle.text}`}>{shownAttachmentName}</p>
              {attachmentFile && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {(attachmentFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
              {existingHasAttachment && (
                <p className="text-xs text-gray-500 mt-0.5">File tersimpan sebelumnya</p>
              )}
            </div>
            {existingHasAttachment && initialData?.attachment_url && (
              <a href={initialData.attachment_url} target="_blank" rel="noreferrer"
                 className="text-xs text-blue-600 hover:underline shrink-0">
                Lihat
              </a>
            )}
            <button type="button" onClick={handleRemoveAttachment}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 shrink-0"
                    title="Hapus lampiran">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Area upload */}
        <label className="relative flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-colors duration-200 cursor-pointer">
          <Paperclip className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-sm text-gray-700 font-medium">
              {shownAttachmentName ? 'Ganti file lampiran' : 'Lampirkan file'}
            </p>
            <p className="text-xs text-gray-500">PDF, ZIP, RAR, DOC, DOCX — Maks. {MAX_ATTACHMENT_MB}MB</p>
          </div>
          <input
            type="file"
            accept=".pdf,.zip,.rar,.doc,.docx"
            onChange={handleAttachmentChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>

        {removeAttachment && !attachmentFile && (
          <p className="mt-2 text-xs text-orange-600">⚠️ Lampiran akan dihapus saat disimpan</p>
        )}
      </div>

      {/* Status & Tanggal Publish */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="sr-only" />
              <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${isPublished ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isPublished ? 'transform translate-x-5' : 'transform translate-x-1'}`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPublished ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
              <span className="text-sm font-medium text-gray-700">{isPublished ? 'Published' : 'Draft'}</span>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tanggal Publish (opsional)
            </div>
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menyimpan...
            </>
          ) : 'Simpan Berita'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
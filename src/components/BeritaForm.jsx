import React, { useEffect, useState } from 'react';
import { Upload, Calendar, Eye, EyeOff, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { createBerita, updateBerita } from '../_services/berita';

export default function BeritaForm({ initialData = null, onSaved = () => {}, onCancel = () => {} }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPublished, setIsPublished] = useState(true);
  const [publishedAt, setPublishedAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setIsPublished(!!initialData.is_published);
      setPublishedAt(initialData.published_at ? formatForInput(initialData.published_at) : '');
      setImagePreview(initialData.image_url || null);
      setImageFile(null);
    } else {
      resetForm();
    }
  }, [initialData]);

  function resetForm() {
    setTitle('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setIsPublished(true);
    setPublishedAt('');
  }

  function formatForInput(dateStr) {
    try {
      const d = new Date(dateStr);
      const pad = (n) => (n < 10 ? '0' + n : n);
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File terlalu besar',
        text: 'Ukuran file maksimal 5MB',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Format tidak didukung',
        text: 'Hanya file gambar yang diperbolehkan',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Judul diperlukan',
        text: 'Silakan masukkan judul berita',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim() || '');
      if (imageFile) formData.append('image', imageFile);
      formData.append('is_published', isPublished ? 1 : 0);
      if (publishedAt) {
        const iso = new Date(publishedAt).toISOString();
        formData.append('published_at', iso);
      }
if (initialData && initialData.id) {
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
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gambar Berita
        </label>
        <div className="space-y-4">
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Klik untuk upload gambar atau drag & drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG (Maks. 5MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
        </div>
      </div>

      {/* Status & Tanggal Publish */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Publish */}
        <div>
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                isPublished ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  isPublished ? 'transform translate-x-5' : 'transform translate-x-1'
                }`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPublished ? (
                <Eye className="w-4 h-4 text-blue-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </label>
        </div>

        {/* Tanggal Publish */}
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
          ) : (
            'Simpan Berita'
          )}
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
// src/components/GalleryForm.jsx
import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { createGallery, updateGallery } from '../_services/gallery';

export default function GalleryForm({ initialData = null, onSaved = () => {}, onCancel = () => {} }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData && initialData.image_url) {
      setImagePreview(initialData.image_url);
      setImageFile(null);
    } else {
      resetForm();
    }
  }, [initialData]);

  function resetForm() {
    setImageFile(null);
    setImagePreview(null);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    
    if (!imageFile && !initialData) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih gambar',
        text: 'Silakan pilih gambar terlebih dahulu',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Untuk update, harus ada file baru
    if (initialData && !imageFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih gambar baru',
        text: 'Silakan pilih gambar baru untuk update',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setSaving(true);
    try {
      if (initialData && initialData.id) {
        await updateGallery(initialData.id, imageFile);
      } else {
        await createGallery(imageFile);
      }

      onSaved();
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan',
        text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan gambar',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {initialData ? 'Pilih Gambar Baru' : 'Pilih Gambar'}
        </label>
        
        <div className="space-y-4">
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200 cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Klik untuk upload gambar
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG, GIF (Maks. 5MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={!initialData}
              />
            </div>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving || (!imageFile && !initialData)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? 'Update Gambar' : 'Upload Gambar'
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
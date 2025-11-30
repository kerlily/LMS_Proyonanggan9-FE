// src/pages/guru/gallery/GalleryDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import GalleryService from '../../../_services/gallery';
import GalleryForm from '../../../components/GalleryForm';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function GalleryDashboardAdmin() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { 
    fetchGalleries(); 
  }, []);

  const fetchGalleries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await GalleryService.getGalleries();
      setGalleries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch galleries error:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memuat gallery');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { 
    setEditing(null); 
    setShowForm(true); 
  };
  
  const openEdit = (g) => { 
    setEditing(g); 
    setShowForm(true); 
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    fetchGalleries();
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Gambar berhasil disimpan',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Gambar?',
      text: "Gambar yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      await GalleryService.deleteGallery(id);
      setGalleries((prev) => prev.filter(x => x.id !== id));
      
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Gambar berhasil dihapus',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Delete error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal menghapus gambar',
        confirmButtonColor: '#3b82f6'
      });
    }
  };



  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">Galeri Foto</h1>
              <p className="text-gray-600 mt-1">Kelola galeri foto untuk platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchGalleries}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Memuat...' : 'Refresh'}
              </button>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Upload Baru
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-800">
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Statistics */}
          {!loading && galleries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Gambar</p>
                    <p className="text-2xl font-bold text-gray-900">{galleries.length}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {galleries.map(gallery => (
                <div key={gallery.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-200">
                  <div className="relative aspect-square bg-gray-100">
                    <img 
                      src={gallery.image_url} 
                      alt={`gallery-${gallery.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(gallery)}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors duration-200"
                        title="Edit Gambar"
                      >
                        <Edit2 className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(gallery.id)}
                        className="p-2 bg-red-500/90 hover:bg-red-500 rounded-lg transition-colors duration-200"
                        title="Hapus Gambar"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>ID: {gallery.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && galleries.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum ada gambar
                </h3>
                <p className="text-gray-600 mb-4">
                  Mulai upload gambar pertama untuk galeri
                </p>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Upload Gambar Pertama
                </button>
              </div>
            </div>
          )}

          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {editing ? 'Ganti Gambar' : 'Upload Gambar Baru'}
                  </h4>
                  <button 
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <GalleryForm 
                    initialData={editing} 
                    onSaved={handleSaved} 
                    onCancel={() => {
                      setShowForm(false);
                      setEditing(null);
                    }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
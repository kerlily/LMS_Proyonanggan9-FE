// src/pages/guru/berita/BeritaDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Edit2, Trash2, X, Eye, EyeOff, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import BeritaService from '../../../_services/berita';
import BeritaForm from '../../../components/BeritaForm';
import GuruLayout from '../../../components/layout/GuruLayout';

export default function BeritaDashboard() {
  const [beritas, setBeritas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { 
    fetchBeritas(); 
  }, []);

  const fetchBeritas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BeritaService.getAllBeritas();
      setBeritas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching beritas:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memuat berita');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { 
    setEditing(null); 
    setShowForm(true); 
  };

  const openEdit = (b) => { 
    setEditing(b); 
    setShowForm(true); 
  };

  const handleSaved = () => {
    setShowForm(false);
    fetchBeritas();
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Berita berhasil disimpan',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Berita?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
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
      await BeritaService.deleteBerita(id);
      setBeritas((s) => s.filter(x => x.id !== id));
      
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Berita berhasil dihapus',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error deleting berita:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal menghapus berita',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error(e);
      return '-';
    }
  };

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">Kelola Berita</h1>
              <p className="text-gray-600 mt-1">Kelola semua berita (published dan draft)</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchBeritas}
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
                Buat Berita
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
          {!loading && beritas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Berita</p>
                    <p className="text-2xl font-bold text-gray-900">{beritas.length}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-green-600">
                      {beritas.filter(b => b.is_published).length}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Draft</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {beritas.filter(b => !b.is_published).length}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <EyeOff className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Berita Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beritas.map(berita => (
                <div key={berita.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {berita.image_url && (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <img 
                        src={berita.image_url} 
                        alt={berita.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                        {berita.title}
                      </h3>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        berita.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {berita.is_published ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {berita.description || 'Tidak ada deskripsi'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {berita.published_at ? formatDate(berita.published_at) : 'Belum dipublish'}
                      </div>
                      <div>
                        Dibuat: {formatDate(berita.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        ID: {berita.id}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(berita)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit Berita"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(berita.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Hapus Berita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && beritas.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum ada berita
                </h3>
                <p className="text-gray-600 mb-4">
                  Mulai buat berita pertama Anda untuk dibagikan
                </p>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Buat Berita Pertama
                </button>
              </div>
            </div>
          )}

          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {editing ? 'Edit Berita' : 'Buat Berita Baru'}
                  </h4>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="p-6">
                    <BeritaForm 
                      initialData={editing} 
                      onSaved={handleSaved} 
                      onCancel={() => setShowForm(false)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </GuruLayout>
  );
}
// src/components/CatatanAkademikInput.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, FileText, AlertCircle, Check, Loader2 } from 'lucide-react';
import * as catatanService from '../_services/catatanAkademik';
import api from '../_api';

/**
 * Komponen untuk input catatan akademik per siswa per mapel
 * Menampilkan SEMUA mapel di kelas (tidak harus ada struktur)
 */
const CatatanAkademikInput = ({ 
  kelasId, 
  semesterId,
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ✅ FIX: Ganti strukturList jadi mapelList
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [catatanData, setCatatanData] = useState({});

  // Fetch mapel yang tersedia untuk input catatan
  useEffect(() => {
    if (kelasId && semesterId) {
      fetchAvailableMapel();
    }
  }, [kelasId, semesterId]);

  // Fetch catatan existing ketika mapel dipilih
  useEffect(() => {
    if (selectedMapel) {
      fetchCatatanExisting();
    }
  }, [selectedMapel]);

  
  const fetchAvailableMapel = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await catatanService.getAvailableStruktur(kelasId, {
        semester_id: semesterId
      });

      const data = response.data?.data || [];
      setMapelList(Array.isArray(data) ? data : []);

      // Auto-select first mapel if only one
      if (data.length === 1) {
        setSelectedMapel(data[0]);
      }
    } catch (err) {
      console.error('Error fetching mapel:', err);
      setError(err?.response?.data?.message || 'Gagal memuat data mata pelajaran');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch catatan yang sudah ada untuk mapel yang dipilih
   */
  const fetchCatatanExisting = async () => {
    if (!selectedMapel) return;

    try {
      setLoading(true);
      setError(null);

      // Get siswa list
      const siswaResponse = await api.get(`/kelas/${kelasId}/siswa`);
      const siswaData = siswaResponse.data?.data || siswaResponse.data || [];
      setSiswaList(Array.isArray(siswaData) ? siswaData : []);

      // Get existing catatan
      const params = selectedMapel.has_struktur 
        ? { struktur_id: selectedMapel.id }
        : { 
            mapel_id: selectedMapel.mapel.id,
            semester_id: semesterId 
          };

      const catatanResponse = await catatanService.getCatatanByMapel(kelasId, params);
      const existingCatatan = catatanResponse.data?.data || {};
      
      // Convert to { siswa_id: catatan } format
      const catatanMap = {};
      Object.keys(existingCatatan).forEach(siswaId => {
        catatanMap[siswaId] = existingCatatan[siswaId]?.catatan || '';
      });

      setCatatanData(catatanMap);
    } catch (err) {
      console.error('Error fetching catatan:', err);
      setCatatanData({});
    } finally {
      setLoading(false);
    }
  };

  const handleCatatanChange = (siswaId, value) => {
    setCatatanData(prev => ({
      ...prev,
      [siswaId]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedMapel) {
      setError('Pilih mata pelajaran terlebih dahulu');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Prepare data
      const catatanArray = Object.entries(catatanData)
        .filter(([, catatan]) => catatan && catatan.trim() !== '')
        .map(([siswa_id, catatan]) => ({
          siswa_id: parseInt(siswa_id),
          catatan: catatan.trim()
        }));

      if (catatanArray.length === 0) {
        setError('Tidak ada catatan yang diisi');
        return;
      }

      const payload = {
        mapel_id: selectedMapel.mapel.id,
        catatan_data: catatanArray
      };

      // Tambahkan struktur_id atau semester_id
      if (selectedMapel.has_struktur) {
        payload.struktur_id = selectedMapel.id;
      } else {
        payload.semester_id = semesterId;
      }

      const response = await catatanService.saveBulkCatatan(kelasId, payload);

      setSuccess(response.data?.message || 'Catatan berhasil disimpan');

      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      console.error('Error saving catatan:', err);
      setError(err?.response?.data?.message || 'Gagal menyimpan catatan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Input Catatan Akademik</h2>
            <p className="text-blue-100 text-sm">Catatan per siswa per mata pelajaran</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Berhasil</h3>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !selectedMapel && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>
        )}

        {/* ✅ FIX: Ganti strukturList jadi mapelList */}
        {!loading && mapelList.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak Ada Mata Pelajaran
            </h3>
            <p className="text-gray-600">
              Belum ada mata pelajaran di kelas ini untuk semester yang dipilih
            </p>
          </div>
        )}

        {/* ✅ FIX: Ganti strukturList jadi mapelList */}
        {!loading && mapelList.length > 0 && (
          <>
            {/* Pilih Mata Pelajaran */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Mata Pelajaran *
              </label>
              <select
                value={selectedMapel?.mapel?.id || ''}
                onChange={(e) => {
                  const mapel = mapelList.find(m => m.mapel.id === parseInt(e.target.value));
                  setSelectedMapel(mapel || null);
                  setCatatanData({});
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">-- Pilih Mata Pelajaran --</option>
                {mapelList.map(mapel => (
                  <option key={mapel.mapel.id} value={mapel.mapel.id}>
                    {mapel.mapel.nama} 
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Semua mata pelajaran di kelas ini tersedia untuk input catatan
              </p>
            </div>

            {/* Info Box */}
            {selectedMapel && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 mb-1">
                      {selectedMapel.mapel?.nama}
                    </h3>
                    <p className="text-sm text-blue-700">
                      Catatan ini akan tersimpan dan dapat diedit kapan saja.
                      Catatan akan muncul di rapor siswa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading siswa */}
            {loading && selectedMapel && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}

            {/* Daftar Siswa & Input Catatan */}
            {!loading && selectedMapel && siswaList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Daftar Siswa ({siswaList.length})
                  </h3>
                  <span className="text-sm text-gray-600">
                    {Object.values(catatanData).filter(c => c && c.trim()).length} siswa memiliki catatan
                  </span>
                </div>

                <div className="space-y-3">
                  {siswaList.map((siswa, index) => (
                    <div 
                      key={siswa.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{siswa.nama}</h4>
                              {siswa.nisn && (
                                <p className="text-sm text-gray-500">NISN: {siswa.nisn}</p>
                              )}
                            </div>
                          </div>
                          
                          <textarea
                            value={catatanData[siswa.id] || ''}
                            onChange={(e) => handleCatatanChange(siswa.id, e.target.value)}
                            placeholder="Tulis catatan akademik untuk siswa ini..."
                            rows={3}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                          />
                          
                          {catatanData[siswa.id] && (
                            <p className="text-xs text-gray-500 mt-1">
                              {catatanData[siswa.id].length}/1000 karakter
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && selectedMapel && siswaList.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tidak Ada Siswa
                </h3>
                <p className="text-gray-600">
                  Belum ada siswa di kelas ini
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedMapel && siswaList.length > 0 && (
              <span>
                {Object.values(catatanData).filter(c => c && c.trim()).length} dari {siswaList.length} siswa memiliki catatan
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            
            <button
              onClick={handleSave}
              disabled={!selectedMapel || saving || siswaList.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Catatan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatatanAkademikInput;
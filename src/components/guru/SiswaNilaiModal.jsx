// src/components/guru/SiswaNilaiModal.jsx
import React from "react";
import { X, Users, CheckCircle, XCircle, TrendingUp, TrendingDown, User } from "lucide-react";

export default function SiswaNilaiModal({ isOpen, onClose, data, loading }) {
  if (!isOpen) return null;

  const getGradeColor = (nilai) => {
    if (!nilai) return 'text-slate-400';
    if (nilai >= 85) return 'text-green-600';
    if (nilai >= 70) return 'text-blue-600';
    if (nilai >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBg = (nilai) => {
    if (!nilai) return 'bg-slate-50';
    if (nilai >= 85) return 'bg-green-50';
    if (nilai >= 70) return 'bg-blue-50';
    if (nilai >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                Detail Nilai Siswa
              </h2>
              {data && (
                <div className="space-y-1 text-indigo-100">
                  <p className="text-sm">
                    <span className="font-medium">Kelas:</span> {data.kelas.nama}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Mapel:</span> {data.mapel.nama} ({data.mapel.kode})
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Semester:</span> {data.semester.nama} - {data.tahun_ajaran.nama}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Statistics */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Total Siswa</span>
                </div>
                <div className="text-2xl font-bold">{data.statistics.total_siswa}</div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Ada Nilai</span>
                </div>
                <div className="text-2xl font-bold">{data.statistics.siswa_dengan_nilai}</div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Rata-rata</span>
                </div>
                <div className="text-2xl font-bold">
                  {data.statistics.rata_rata || '-'}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium">Progress</span>
                </div>
                <div className="text-2xl font-bold">{data.statistics.completion_rate}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Memuat data siswa...</p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-3">
              {/* Siswa dengan Nilai */}
              {data.siswa_list.filter(s => s.has_nilai).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Siswa dengan Nilai ({data.statistics.siswa_dengan_nilai})
                  </h3>
                  <div className="space-y-2">
                    {data.siswa_list
                      .filter(s => s.has_nilai)
                      .sort((a, b) => (b.nilai || 0) - (a.nilai || 0))
                      .map((siswa, idx) => (
                        <div
                          key={siswa.siswa_id}
                          className={`${getGradeBg(siswa.nilai)} border-2 ${
                            siswa.nilai >= 85 ? 'border-green-200' :
                            siswa.nilai >= 70 ? 'border-blue-200' :
                            siswa.nilai >= 60 ? 'border-yellow-200' :
                            'border-red-200'
                          } rounded-xl p-4 transition-all hover:shadow-md`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-800">
                                  {siswa.siswa_nama}
                                </h4>
                                {siswa.catatan && (
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    {siswa.catatan}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${getGradeColor(siswa.nilai)}`}>
                                {siswa.nilai}
                              </div>
                              {siswa.updated_at && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(siswa.updated_at).toLocaleDateString('id-ID')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Siswa tanpa Nilai */}
              {data.statistics.siswa_tanpa_nilai > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-slate-400" />
                    Siswa Belum Ada Nilai ({data.statistics.siswa_tanpa_nilai})
                  </h3>
                  <div className="space-y-2">
                    {data.siswa_list
                      .filter(s => !s.has_nilai)
                      .map((siswa) => (
                        <div
                          key={siswa.siswa_id}
                          className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 transition-all hover:bg-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-700">
                                {siswa.siswa_nama}
                              </h4>
                              <p className="text-xs text-slate-500">Belum ada nilai</p>
                            </div>
                            <span className="text-slate-400 font-medium">-</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Tidak ada data</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
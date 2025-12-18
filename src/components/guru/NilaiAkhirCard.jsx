// src/components/guru/NilaiAkhirCard.jsx
import React from "react";
import { BookOpen, TrendingUp, TrendingDown, Users, CheckCircle, Eye } from "lucide-react";

export default function NilaiAkhirCard({ mapelData, onViewDetail }) {
  const { mapel, total_siswa, siswa_dengan_nilai, completion_rate, nilai_tertinggi, nilai_terendah, rata_rata } = mapelData;
  
  // Determine grade color based on average
  const getGradeColor = (avg) => {
    if (avg >= 85) return 'text-green-600';
    if (avg >= 70) return 'text-blue-600';
    if (avg >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const avgColorClass = getGradeColor(rata_rata);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 p-5 transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 mb-1">
            {mapel.nama}
          </h4>
          <p className="text-xs text-slate-500">{mapel.kode}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-xs text-slate-600">Total Siswa</span>
          </div>
          <div className="text-xl font-bold text-slate-800">{total_siswa}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-700">Ada Nilai</span>
          </div>
          <div className="text-xl font-bold text-green-600">{siswa_dengan_nilai}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Completion</span>
          <span className="font-bold text-indigo-600">{completion_rate}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              completion_rate === 100 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
            }`}
            style={{ width: `${completion_rate}%` }}
          />
        </div>
      </div>

      {/* Nilai Stats */}
      <div className="space-y-2 mb-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-slate-600">Tertinggi</span>
          </div>
          <span className="font-bold text-green-600">{nilai_tertinggi || '-'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-sm text-slate-600">Terendah</span>
          </div>
          <span className="font-bold text-red-600">{nilai_terendah || '-'}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-sm font-semibold text-slate-700">Rata-rata</span>
          <span className={`text-2xl font-bold ${avgColorClass}`}>
            {rata_rata || '-'}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onViewDetail(mapelData)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
      >
        <Eye className="w-4 h-4" />
        Lihat Daftar Siswa
      </button>
    </div>
  );
}
// src/components/guru/NilaiAkhirHistoryCard.jsx
import React from "react";
import { Calendar, BookOpen, TrendingUp, CheckCircle, ChevronRight } from "lucide-react";

export default function NilaiAkhirHistoryCard({ tahunAjaran, onClick }) {
  const { tahun_ajaran, semester_list } = tahunAjaran;
  
  // Hitung total mapel dari semua semester
  const totalMapel = semester_list.reduce((sum, sem) => sum + sem.mapel_list.length, 0);
  
  // Hitung rata-rata completion dari semua mapel
  const allMapels = semester_list.flatMap(sem => sem.mapel_list);
  const avgCompletion = allMapels.length > 0 
    ? Math.round(allMapels.reduce((sum, m) => sum + m.completion_rate, 0) / allMapels.length)
    : 0;

  // Hitung rata-rata nilai keseluruhan
  const avgNilai = allMapels.length > 0
    ? Math.round(allMapels.reduce((sum, m) => sum + m.rata_rata, 0) / allMapels.length * 10) / 10
    : 0;

  // Get grade color
  const getGradeColor = (avg) => {
    if (avg >= 85) return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600' };
    if (avg >= 70) return { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-600' };
    if (avg >= 60) return { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-600' };
    return { bg: 'from-red-500 to-rose-600', text: 'text-red-600' };
  };

  const gradeStyle = getGradeColor(avgNilai);

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-6 transition-all duration-200 hover:shadow-lg cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            tahun_ajaran.is_active 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25'
          }`}>
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
              {tahun_ajaran.nama}
            </h3>
            {tahun_ajaran.is_active && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                <CheckCircle className="w-3 h-3" />
                Aktif
              </span>
            )}
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-medium text-slate-600">Mapel</span>
          </div>
          <div className="text-xl font-bold text-indigo-600">{totalMapel}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-medium text-slate-600">Rata-rata</span>
          </div>
          <div className={`text-xl font-bold ${gradeStyle.text}`}>{avgNilai}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-slate-600">Progress</span>
          </div>
          <div className="text-xl font-bold text-green-600">{avgCompletion}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Completion Rate</span>
          <span className="font-bold text-indigo-600">{avgCompletion}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              avgCompletion === 100 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
            }`}
            style={{ width: `${avgCompletion}%` }}
          />
        </div>
      </div>

      {/* Semester Summary */}
      <div className="pt-4 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-600 mb-2">Semester:</p>
        <div className="flex flex-wrap gap-2">
          {semester_list.map((sem, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100"
            >
              <Calendar className="w-3 h-3" />
              {sem.semester.nama} ({sem.mapel_list.length})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
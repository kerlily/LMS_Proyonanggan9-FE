// src/components/guru/StrukturDetailList.jsx
import React from "react";
import { BookOpen, Calendar, Users, TrendingUp, Eye } from "lucide-react";

export default function StrukturDetailList({ strukturList, onViewDetail }) {
  if (!strukturList || strukturList.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Tidak ada struktur nilai untuk tahun ajaran ini</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {strukturList.map((struktur) => (
        <div 
          key={struktur.struktur_id}
          className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 p-5 transition-all duration-200 hover:shadow-lg group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                {struktur.mapel.nama}
              </h4>
              <p className="text-xs text-slate-500">{struktur.mapel.kode}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Semester Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
              <Calendar className="w-3 h-3" />
              Semester {struktur.semester.nama}
            </span>
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4" />
                <span>Total Siswa</span>
              </div>
              <span className="font-semibold text-slate-800">{struktur.total_siswa}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <TrendingUp className="w-4 h-4" />
                <span>Siswa Selesai</span>
              </div>
              <span className="font-semibold text-green-600">{struktur.siswa_selesai}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Progress</span>
              <span className="font-bold text-indigo-600">{struktur.completion_rate}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  struktur.completion_rate === 100 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                }`}
                style={{ width: `${struktur.completion_rate}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onViewDetail(struktur)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
          >
            <Eye className="w-4 h-4" />
            Lihat Detail
          </button>
        </div>
      ))}
    </div>
  );
}
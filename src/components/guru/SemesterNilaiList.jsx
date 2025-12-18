// src/components/guru/SemesterNilaiList.jsx
import React from "react";
import { Calendar, BookOpen, AlertCircle } from "lucide-react";
import NilaiAkhirCard from "./NilaiAkhirCard";

export default function SemesterNilaiList({ semesterList, onViewDetail }) {
  if (!semesterList || semesterList.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
        <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 font-medium mb-2">Belum Ada Nilai</p>
        <p className="text-slate-500 text-sm">
          Belum ada nilai untuk tahun ajaran ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {semesterList.map((semester, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {/* Semester Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Semester {semester.semester.nama}
              </h3>
              <p className="text-sm text-slate-600">
                {semester.mapel_list.length} Mata Pelajaran
              </p>
            </div>
          </div>

          {/* Mapel Grid */}
          {semester.mapel_list.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Belum ada nilai untuk semester ini</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {semester.mapel_list.map((mapelData, mapelIdx) => (
                <NilaiAkhirCard 
                  key={mapelIdx} 
                  mapelData={{ ...mapelData, semester }} 
                  onViewDetail={onViewDetail}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
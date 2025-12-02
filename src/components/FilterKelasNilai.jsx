// src/components/guru/FilterKelasNilai.jsx
import React from "react";
import { Users, Calendar } from "lucide-react";

export default function FilterKelasNilai({ 
  assignments, 
  selectedAssignment, 
  onSelectAssignment,
  semesters,
  selectedSemester,
  onSelectSemester,
  loading 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            Pilih Kelas
          </label>
          <select
            value={selectedAssignment?.id || ""}
            onChange={(e) => onSelectAssignment(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">-- Pilih Kelas --</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.kelas?.nama ?? `Kelas ${a.kelas_id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Pilih Semester
          </label>
          <select
            value={selectedSemester?.id || ""}
            onChange={(e) => onSelectSemester(e.target.value)}
            disabled={loading || !selectedAssignment}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">-- Pilih Semester --</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama} {s.is_active && "(Aktif)"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
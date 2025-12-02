// src/components/guru/StatsCard.jsx
import React from "react";

// Generic StatCard component (consistent with NilaiDetailDashboard pattern)
export function StatCard({ icon: Icon, title, value, subtitle, color = "blue" }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex p-2 rounded-lg bg-${color}-50 mb-3`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div className="text-sm text-gray-500 mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Specific stats for Nilai Dashboard
export default function NilaiStatsCards({ data }) {
  // Calculate statistics
  const totalSiswa = data.length;
  
  let totalNilai = 0;
  let countNilai = 0;
  
  data.forEach((siswa) => {
    siswa.nilai.forEach((n) => {
      const val = Number(n.nilai);
      if (!isNaN(val)) {
        totalNilai += val;
        countNilai++;
      }
    });
  });

  const avgNilai = countNilai > 0 ? (totalNilai / countNilai).toFixed(2) : "-";

  // Count by performance
  const siswaStats = data.map((siswa) => {
    const nilaiValues = siswa.nilai
      .map((n) => Number(n.nilai))
      .filter((v) => !isNaN(v));
    return nilaiValues.length > 0
      ? nilaiValues.reduce((a, b) => a + b, 0) / nilaiValues.length
      : null;
  });

  const countAbove60 = siswaStats.filter((avg) => avg !== null && avg >= 60).length;
  const count40to60 = siswaStats.filter((avg) => avg !== null && avg >= 40 && avg < 60).length;
  const countBelow40 = siswaStats.filter((avg) => avg !== null && avg < 40).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        icon={({ className }) => (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
        title="Total Siswa"
        value={totalSiswa}
        color="blue"
      />

      <StatCard
        icon={({ className }) => (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )}
        title="Rata-rata Kelas"
        value={avgNilai}
        color="green"
      />

      <StatCard
        icon={({ className }) => (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        title="Nilai ≥ 60"
        value={countAbove60}
        subtitle="Tuntas"
        color="green"
      />

      <StatCard
        icon={({ className }) => (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        title="Nilai 40-59"
        value={count40to60}
        subtitle="Perlu Perbaikan"
        color="yellow"
      />

      <StatCard
        icon={({ className }) => (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        title="Nilai < 40"
        value={countBelow40}
        subtitle="Butuh Perhatian"
        color="red"
      />
    </div>
  );
}
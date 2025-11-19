// src/components/nilai/ProgressCard.jsx
import React from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function ProgressCard({ progress }) {
  if (!progress) return null;

  const { summary, progress: studentProgress } = progress;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'empty':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status, percentage) => {
    switch (status) {
      case 'complete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            <CheckCircle className="w-3 h-3" />
            Lengkap
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            <Clock className="w-3 h-3" />
            {percentage}%
          </span>
        );
      case 'empty':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            <AlertCircle className="w-3 h-3" />
            Kosong
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Progress Input Nilai
        </h3>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summary.total_siswa}
            </div>
            <div className="text-xs text-gray-600">Total Siswa</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.complete}
            </div>
            <div className="text-xs text-gray-600">Lengkap</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {summary.partial}
            </div>
            <div className="text-xs text-gray-600">Sebagian</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {summary.empty}
            </div>
            <div className="text-xs text-gray-600">Kosong</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Kelengkapan Data</span>
            <span className="font-semibold text-gray-900">
              {summary.completion_rate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${summary.completion_rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nama Siswa
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Terisi
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentProgress?.map((student, idx) => (
              <tr key={student.siswa_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {idx + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(student.status)}
                    <span className="text-sm font-medium text-gray-900">
                      {student.siswa_nama}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {student.nilai_terisi}/{student.total_kolom}
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(student.status, student.percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
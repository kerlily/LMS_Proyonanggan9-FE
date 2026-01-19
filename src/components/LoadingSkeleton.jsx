// src/components/LoadingSkeleton.jsx
import React from "react";
import { Loader2 } from "lucide-react";

export function TableLoadingSkeleton({ rows = 5, columns = 8 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Skeleton */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {Array(columns).fill(0).map((_, idx) => (
                <th key={idx} className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(rows).fill(0).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-t border-gray-100">
                {Array(columns).fill(0).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LoadingSpinner({ message = "Memuat data..." }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar...</p>
    </div>
  );
}

export default { TableLoadingSkeleton, LoadingSpinner };
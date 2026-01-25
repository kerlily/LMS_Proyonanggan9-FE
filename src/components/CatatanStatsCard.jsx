// src/components/CatatanStatsCard.jsx
import React from 'react';
import { MessageSquare, CheckCircle, AlertCircle, FileText } from 'lucide-react';

/**
 * Component untuk menampilkan statistik catatan akademik
 * Menghitung berapa banyak siswa yang sudah/belum punya catatan per mapel
 */
const CatatanStatsCard = ({ data }) => {
  // Calculate stats
  const calculateStats = () => {
    const mapelStats = {};
    
    data.forEach(item => {
      if (!mapelStats[item.mapel_id]) {
        mapelStats[item.mapel_id] = {
          mapel_nama: item.mapel_nama,
          total: 0,
          filled: 0,
          empty: 0
        };
      }
      
      mapelStats[item.mapel_id].total++;
      
      if (item.catatan_akademik && item.catatan_akademik.trim() !== '') {
        mapelStats[item.mapel_id].filled++;
      } else {
        mapelStats[item.mapel_id].empty++;
      }
    });
    
    return Object.values(mapelStats);
  };

  const stats = calculateStats();
  const totalStats = stats.reduce((acc, curr) => ({
    total: acc.total + curr.total,
    filled: acc.filled + curr.filled,
    empty: acc.empty + curr.empty
  }), { total: 0, filled: 0, empty: 0 });

  const fillPercentage = totalStats.total > 0 
    ? Math.round((totalStats.filled / totalStats.total) * 100) 
    : 0;

  if (stats.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Statistik Catatan Akademik</h3>
          <p className="text-sm text-gray-600">Ringkasan pengisian catatan per mata pelajaran</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Total Entri</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalStats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Sudah Diisi</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{totalStats.filled}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">Belum Diisi</span>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">{totalStats.empty}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Persentase</span>
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{fillPercentage}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress Pengisian</span>
          <span className="text-sm font-semibold text-gray-900">
            {totalStats.filled} / {totalStats.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>

      {/* Per Mapel Stats */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Detail Per Mata Pelajaran</h4>
        <div className="space-y-2">
          {stats.map((stat, index) => {
            const mapelPercentage = Math.round((stat.filled / stat.total) * 100);
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{stat.mapel_nama}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-600 font-medium">
                      ✓ {stat.filled}
                    </span>
                    <span className="text-orange-600 font-medium">
                      ○ {stat.empty}
                    </span>
                    <span className="text-gray-600 font-semibold">
                      {mapelPercentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      mapelPercentage === 100 
                        ? 'bg-green-500' 
                        : mapelPercentage >= 50 
                        ? 'bg-blue-500' 
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${mapelPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CatatanStatsCard;
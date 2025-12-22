// src/components/admin/Trash/TrashStatsCard.jsx
import React from "react";
import { Users, GraduationCap, AlertCircle } from "lucide-react";

const TrashStatsCard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // ✅ Helper function untuk format days
  const formatDaysAgo = (days) => {
    if (!days && days !== 0) return null;
    
    // Bulatkan ke integer untuk menghindari desimal
    const roundedDays = Math.floor(days);
    
    // Jika kurang dari 1 hari, tampilkan "today"
    if (roundedDays === 0) return 'today';
    
    // Jika 1 hari, tampilkan "1d ago"
    if (roundedDays === 1) return '1d ago';
    
    // Selainnya tampilkan "{n}d ago"
    return `${roundedDays}d ago`;
  };

  const cards = [
    {
      title: "Users (Guru/Admin)",
      count: stats.users?.count || 0,
      oldestDays: stats.users?.oldest_days_ago,
      icon: Users,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Siswa",
      count: stats.siswa?.count || 0,
      oldestDays: stats.siswa?.oldest_days_ago,
      icon: GraduationCap,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const formattedDays = formatDaysAgo(card.oldestDays);
        
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              {card.count > 0 && formattedDays && (
                <div className="flex items-center text-xs text-gray-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>{formattedDays}</span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {card.title}
            </h3>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.count}
              </p>
              <span className="text-sm text-gray-500">deleted</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrashStatsCard;
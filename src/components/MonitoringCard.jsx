// src/components/MonitoringCard.jsx
import React from "react";
import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react";

export default function MonitoringCard({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Kelas",
      value: stats.total_kelas || 0,
      icon: Users,
      color: "blue",
    },
    {
      title: "Kelas Selesai",
      value: stats.kelas_complete || 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Kelas Belum Selesai",
      value: stats.kelas_partial || 0,
      icon: Clock,
      color: "yellow",
    },
    {
      title: "Kelas Kosong",
      value: stats.kelas_empty || 0,
      icon: AlertCircle,
      color: "red",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-lg border-2 ${colorClasses[card.color]} transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">{card.title}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <Icon className="w-10 h-10 opacity-50" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
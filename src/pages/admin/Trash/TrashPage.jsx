// src/pages/admin/trash/TrashPage.jsx
import React, { useState, useEffect } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import TrashStatsCard from "../../../components/admin/Trash/TrashStatsCard";
import UsersTrashTable from "../../../components/admin/Trash/UsersTrashTable";
import SiswaTrashTable from "../../../components/admin/Trash/SiswaTrashTable";
import { getTrashStats, getTrashedUsers, getTrashedSiswa } from "../../../_services/trash";
import Swal from "sweetalert2";
import AdminLayout from "../../../components/layout/AdminLayout";

const TrashPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [siswa, setSiswa] = useState([]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await getTrashStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getTrashedUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch siswa
  const fetchSiswa = async () => {
    try {
      setLoading(true);
      const response = await getTrashedSiswa();
      setSiswa(response.data.data);
    } catch (error) {
      console.error("Error fetching siswa:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    fetchStats();
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "siswa") {
      fetchSiswa();
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "siswa") {
      fetchSiswa();
    }
  }, [activeTab]);

  const tabs = [
    { id: "users", label: "Users (Guru/Admin)", count: stats?.users?.count || 0 },
    { id: "siswa", label: "Siswa", count: stats?.siswa?.count || 0 },
  ];

  return (
        <AdminLayout>
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Trash2 className="w-7 h-7 text-red-600" />
              Account Recovery Management
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola data yang telah dihapus
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <TrashStatsCard stats={stats} loading={statsLoading} />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === "users" && (
          <UsersTrashTable 
            users={users} 
            loading={loading} 
            onRefresh={handleRefresh} 
          />
        )}
        {activeTab === "siswa" && (
          <SiswaTrashTable 
            siswaList={siswa} 
            loading={loading} 
            onRefresh={handleRefresh} 
          />
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default TrashPage;
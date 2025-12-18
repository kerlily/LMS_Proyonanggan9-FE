// src/pages/admin/Admin/AdminList.jsx
import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Key, User } from "lucide-react";
import { listAdmin, deleteAdmin } from "../../../_services/adminUser";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const currentUserId = JSON.parse(localStorage.getItem("userInfo") || "{}")?.id;

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdmin({ search, page, per_page: 15 });
      setAdmins(res.data?.data || []);
      setPagination({
        current: res.data?.current_page,
        last: res.data?.last_page,
        total: res.data?.total,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal memuat data admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search, page]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus admin ini?")) return;
    try {
      await deleteAdmin(id);
      alert("Admin berhasil dihapus");
      fetchAdmins();
    } catch (err) {
      alert(err?.response?.data?.message || "Gagal hapus admin");
    }
  };

  const goto = (path) => (window.location.href = path);

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kelola Admin</h1>
              <p className="text-sm text-gray-600 mt-1">Daftar pengguna dengan role admin</p>
            </div>
            <button
              onClick={() => goto("/admin/admins/create")}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Admin
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700">{error}</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Tidak ada data admin</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            {admin.id === currentUserId && (
                              <span className="text-xs text-indigo-600 font-medium">(Anda)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(admin.created_at).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  {admin.id !== currentUserId && (
    <>
      <button
        onClick={() => goto(`/admin/admins/edit/${admin.id}`)}
        className="text-indigo-600 hover:text-indigo-900 mr-3"
        title="Edit"
      >
        <Edit className="w-5 h-5" />
      </button>

      <button
        onClick={() => goto(`/admin/admins/reset-password/${admin.id}`)}
        className="text-amber-600 hover:text-amber-900 mr-3"
        title="Reset Password"
      >
        <Key className="w-5 h-5" />
      </button>

      <button
        onClick={() => handleDelete(admin.id)}
        className="text-red-600 hover:text-red-900"
        title="Hapus"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </>
  )}
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.last > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Total: {pagination.total} admin
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {pagination.current} of {pagination.last}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.last}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
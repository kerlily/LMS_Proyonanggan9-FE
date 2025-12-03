// src/pages/admin/log/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { listLogs, getLog, getStats } from "../../../_services/log";
import AdminLayout from "../../../components/layout/AdminLayout";

/**
 * Utility: format tanggal (local)
 */
const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString();
};

/**
 * Utility: format tanggal untuk mobile (shorter)
 */
const formatDateMobile = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Utility: pretty print properties object -> array of { key, value } (recursive)
 */
const prettyProps = (obj, prefix = "") => {
  const entries = [];
  if (obj === null || obj === undefined) return entries;
  if (typeof obj !== "object") {
    entries.push({ key: prefix || "value", value: String(obj) });
    return entries;
  }

  Object.keys(obj).forEach((k) => {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (val === null || val === undefined) {
      entries.push({ key, value: "null" });
    } else if (typeof val === "object" && !Array.isArray(val)) {
      entries.push(...prettyProps(val, key));
    } else if (Array.isArray(val)) {
      entries.push({ key, value: JSON.stringify(val) });
    } else {
      entries.push({ key, value: String(val) });
    }
  });
  return entries;
};

/* Small UI primitives (Tailwind-based)
   You can extract these to separate files later.
*/

const Card = ({ title, value, subtitle }) => (
  <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-4 md:p-6 border border-white/20 hover:shadow-xl transition-shadow duration-300">
    <div className="text-xs md:text-sm font-medium text-gray-500">{title}</div>
    <div className="mt-1 md:mt-2 text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{value}</div>
    {subtitle && <div className="mt-1 text-xs text-gray-400">{subtitle}</div>}
  </div>
);

const Table = ({ children }) => (
  <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg border border-white/20">
    <table className="min-w-full divide-y divide-gray-200/50">
      {children}
    </table>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl z-10 max-w-4xl w-full max-h-[90vh] flex flex-col border border-white/20">
        <div className="px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 border-b border-gray-200/50 flex justify-between items-center bg-gradient-to-r from-gray-50 to-slate-50">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-lg md:rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
          {children}
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ meta, onPage }) => {
  if (!meta) return null;
  const { current_page, last_page } = meta;
  
  // Create limited page numbers for mobile
  const pages = [];
  const start = Math.max(1, current_page - 2);
  const end = Math.min(last_page, current_page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-4 md:px-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-slate-50">
      <div className="text-sm text-gray-600">
        Halaman <strong>{current_page}</strong> dari <strong>{last_page}</strong>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          disabled={current_page === 1}
          onClick={() => onPage(current_page - 1)}
          className="px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {start > 1 && (
          <>
            <button onClick={() => onPage(1)} className="px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">1</button>
            {start > 2 && <span className="px-2 text-gray-400">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`px-3 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-colors ${
              p === current_page 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                : "border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}

        {end < last_page && (
          <>
            {end < last_page - 1 && <span className="px-2 text-gray-400">…</span>}
            <button onClick={() => onPage(last_page)} className="px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">{last_page}</button>
          </>
        )}

        <button
          disabled={current_page === last_page}
          onClick={() => onPage(current_page + 1)}
          className="px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Main Dashboard component
 */
const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  // filters
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [search, setSearch] = useState("");
  const [logNameFilter, setLogNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // stats
  const [stats, setStats] = useState(null);
  const [statsFromApi, setStatsFromApi] = useState(false);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchLogs = async (opts = {}) => {
    setLoading(true);
    try {
      const params = {
        page: opts.page ?? page,
        per_page: perPage,
      };
      if (search) params.search = search;
      if (logNameFilter) params.log_name = logNameFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await listLogs(params);
      const data = res.data;
      setLogs(data.data || []);
      // capture pagination meta (fields from Laravel paginator)
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      });
    } catch (err) {
      console.error("fetchLogs error", err);
      // handle error (toast/console)
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getStats();
      setStats(res.data);
      setStatsFromApi(true);
    } catch (err) {
      // jika endpoint stats tidak tersedia, kita akan hit fallback (compute dari page)
      console.log("getStats error", err);
      console.warn("stats endpoint not available, will compute partial stats from current page");
      setStatsFromApi(false);
      computePartialStatsFromPage();
    }
  };

  const computePartialStatsFromPage = () => {
    // compute using logs currently loaded (note: partial)
    const total_logs = meta?.total ?? logs.length;
    const today = new Date().toISOString().slice(0, 10);

    let today_logs = 0;
    let this_week_logs = 0;
    let this_month_logs = 0;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // sunday start
    startOfWeek.setHours(0,0,0,0);

    logs.forEach((l) => {
      if (!l.created_at) return;
      const d = new Date(l.created_at);
      const dStr = d.toISOString().slice(0,10);
      if (dStr === today) today_logs++;
      if (d >= startOfWeek) this_week_logs++;
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) this_month_logs++;
    });

    setStats({
      total_logs,
      today_logs,
      this_week_logs,
      this_month_logs,
    });
  };

  useEffect(() => {
    // fetch logs + stats on mount or when page/search/filter changes
    fetchLogs({ page });
    // try stats endpoint once
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, logNameFilter, dateFrom, dateTo]);

  // derive unique log_name list for filter
  const logNames = useMemo(() => {
    const s = new Set();
    logs.forEach((l) => {
      if (l.log_name) s.add(l.log_name);
    });
    return Array.from(s);
  }, [logs]);

  const openDetail = async (id) => {
    setModalOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await getLog(id);
      setDetail(res.data);
    } catch (err) {
      console.error("getLog", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePage = (p) => {
    setPage(p);
  };

  const resetFilters = () => {
    setSearch("");
    setLogNameFilter("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                  Activity Logs
                </h1>
                <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
                  Monitor aktivitas sistem dan pengguna
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { fetchLogs({ page: 1 }); fetchStats(); }}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card title="Total logs" value={stats?.total_logs ?? (meta?.total ?? "-")} subtitle={statsFromApi ? null : "(partial if no stats API)"} />
            <Card title="Hari Ini" value={stats?.today_logs ?? "-"} subtitle={statsFromApi ? null : "(partial)"} />
            <Card title="Minggu Ini" value={stats?.this_week_logs ?? "-"} subtitle={statsFromApi ? null : "(partial)"} />
            <Card title="Bulan Ini" value={stats?.this_month_logs ?? "-"} subtitle={statsFromApi ? null : "(partial)"} />
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pencarian
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari deskripsi atau properties..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipe Log
                </label>
                <select 
                  value={logNameFilter} 
                  onChange={(e) => setLogNameFilter(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Semua Tipe</option>
                  {logNames.map((ln) => <option key={ln} value={ln}>{ln}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button 
                onClick={() => { setPage(1); fetchLogs({ page: 1 }); }} 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center justify-center gap-2 flex-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Terapkan Filter
              </button>
              <button 
                onClick={resetFilters} 
                className="px-6 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-gray-300 font-semibold flex items-center justify-center gap-2 flex-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <tr>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Waktu
                      </div>
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      Tipe Log
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      Event
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50 hidden md:table-cell">
                      Deskripsi
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      Pengguna
                    </th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 md:px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                          <p className="text-gray-600 text-base font-medium">Memuat logs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 md:px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada logs</h3>
                          <p className="text-gray-600 text-sm max-w-md mx-auto">
                            {search || logNameFilter || dateFrom || dateTo ? 
                              "Tidak ada logs yang sesuai dengan filter." : 
                              "Belum ada data logs."
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                        <td className="py-4 px-4 md:px-6">
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm text-gray-900 font-medium hidden md:block">
                              {formatDate(l.created_at)}
                            </span>
                            <span className="text-xs text-gray-600 font-medium md:hidden">
                              {formatDateMobile(l.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 md:px-6">
                          <div className="text-xs md:text-sm capitalize">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                              {l.log_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 md:px-6">
                          <div className="text-xs md:text-sm">
                            {l.event ? (
                              <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                                {l.event}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 md:px-6 hidden md:table-cell">
                          <div className="text-xs md:text-sm text-gray-700 line-clamp-2">
                            {l.description}
                          </div>
                        </td>
                        <td className="py-4 px-4 md:px-6">
                          {l.causer ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-xs">
                                  {l.causer.name?.charAt(0) || l.causer.nama?.charAt(0) || "#"}
                                </span>
                              </div>
                              <div>
                                <div className="text-xs md:text-sm font-medium text-gray-900">
                                  {l.causer.name ?? l.causer.nama ?? `#${l.causer_id}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {l.causer.role ?? l.causer_type ?? ""}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 md:px-6">
                          <button
                            onClick={() => openDetail(l.id)}
                            className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200 font-medium flex items-center gap-1"
                          >
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination meta={meta} onPage={handlePage} />
          </div>
        </div>

        {/* Detail Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Detail Log ${detail?.id ? `#${detail.id}` : ""}`}>
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 text-base font-medium">Memuat detail...</p>
            </div>
          ) : detail ? (
            <div className="space-y-4 md:space-y-6">
              {/* Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <div className="text-xs md:text-sm text-gray-500 font-medium">Waktu</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 mt-1">{formatDate(detail.created_at)}</div>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <div className="text-xs md:text-sm text-gray-500 font-medium">Tipe Log</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 mt-1 capitalize">{detail.log_name}</div>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <div className="text-xs md:text-sm text-gray-500 font-medium">Event</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 mt-1">{detail.event ?? "-"}</div>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <div className="text-xs md:text-sm text-gray-500 font-medium">Deskripsi</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900 mt-1">{detail.description}</div>
                </div>
              </div>

              {/* Causer */}
              <div>
                <div className="text-sm md:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Pengguna Terkait
                </div>
                {detail.causer ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <div className="text-xs md:text-sm text-gray-500 font-medium">Nama</div>
                        <div className="text-sm md:text-base font-semibold text-gray-900 mt-1">
                          {detail.causer.name ?? detail.causer.nama ?? `#${detail.causer_id}`}
                        </div>
                      </div>
                      {detail.causer.email && (
                        <div>
                          <div className="text-xs md:text-sm text-gray-500 font-medium">Email</div>
                          <div className="text-sm md:text-base font-semibold text-gray-900 mt-1">{detail.causer.email}</div>
                        </div>
                      )}
                      {detail.causer.role && (
                        <div>
                          <div className="text-xs md:text-sm text-gray-500 font-medium">Role</div>
                          <div className="text-sm md:text-base font-semibold text-gray-900 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                              {detail.causer.role}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm md:text-base text-center py-6">Tidak ada info pengguna</div>
                )}
              </div>

              {/* Subject */}
              <div>
                <div className="text-sm md:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Subjek Terkait
                </div>
                {detail.subject ? (
                  <div className="bg-gray-50/50 rounded-xl p-4">
                    <pre className="text-xs md:text-sm overflow-auto max-h-40">{JSON.stringify(detail.subject, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm md:text-base text-center py-4">Tidak ada subjek</div>
                )}
              </div>

              {/* Properties */}
              <div>
                <div className="text-sm md:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Properties
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {prettyProps(detail.properties).map((kv) => (
                    <div key={kv.key} className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 hover:shadow-sm transition-shadow duration-200">
                      <div className="text-xs md:text-sm text-gray-500 font-medium truncate">{kv.key}</div>
                      <div className="text-xs md:text-sm font-mono text-gray-900 mt-1 break-words">{kv.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-12">Tidak ada detail yang dimuat.</div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
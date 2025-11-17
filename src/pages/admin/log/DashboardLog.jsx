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
  <div className="bg-white shadow-sm rounded-lg p-4">
    <div className="text-sm font-medium text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    {subtitle && <div className="mt-1 text-xs text-gray-400">{subtitle}</div>}
  </div>
);

const Table = ({ children }) => (
  <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-40" onClick={onClose}/>
      <div className="bg-white rounded-lg shadow-xl z-10 max-w-2xl w-full p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const Pagination = ({ meta, onPage }) => {
  if (!meta) return null;
  const { current_page, last_page } = meta;
  const pages = [];
  for (let p = 1; p <= last_page; p++) pages.push(p);
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-sm text-gray-600">
        Showing page <strong>{current_page}</strong> of <strong>{last_page}</strong>
      </div>
      <div className="flex gap-2">
        <button
          disabled={current_page === 1}
          onClick={() => onPage(current_page - 1)}
          className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`px-3 py-1 rounded border ${p === current_page ? "bg-gray-800 text-white" : "bg-white"}`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={current_page === last_page}
          onClick={() => onPage(current_page + 1)}
          className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        >
          Next
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
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Activity Logs</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchLogs({ page: 1 }); fetchStats(); }}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total logs" value={stats?.total_logs ?? (meta?.total ?? "-")} subtitle={statsFromApi ? null : "(partial if no stats API)"} />
        <Card title="Today" value={stats?.today_logs ?? "-"} subtitle={statsFromApi ? null : "(partial)"} />
        <Card title="This week" value={stats?.this_week_logs ?? "-"} subtitle={statsFromApi ? null : "(partial)"} />
        <Card title="This month" value={stats?.this_month_logs ?? "-"} subtitle={statsFromApi ? null : "(partial)"} />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description or properties..."
            className="flex-1 border rounded px-3 py-2"
          />
          <select value={logNameFilter} onChange={(e) => setLogNameFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All log names</option>
            {logNames.map((ln) => <option key={ln} value={ln}>{ln}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded px-3 py-2"/>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded px-3 py-2"/>
          <button onClick={() => { setPage(1); fetchLogs({ page: 1 }); }} className="px-4 py-2 bg-blue-600 text-white rounded">Apply</button>
          <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
        </div>
      </div>

      {/* Table */}
      <div>
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm">Time</th>
              <th className="px-4 py-2 text-left text-sm">Log Name</th>
              <th className="px-4 py-2 text-left text-sm">Event</th>
              <th className="px-4 py-2 text-left text-sm">Description</th>
              <th className="px-4 py-2 text-left text-sm">Causer</th>
              <th className="px-4 py-2 text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No logs found</td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-sm">{formatDate(l.created_at)}</td>
                  <td className="px-4 py-3 text-sm capitalize">{l.log_name}</td>
                  <td className="px-4 py-3 text-sm">{l.event ?? "-"}</td>
                  <td className="px-4 py-3 text-sm">{l.description}</td>
                  <td className="px-4 py-3 text-sm">
                    {l.causer ? (
                      <>
                        <div className="font-medium">{l.causer.name ?? l.causer.nama ?? `#${l.causer_id}`}</div>
                        <div className="text-xs text-gray-500">{l.causer.role ?? l.causer_type ?? ""}</div>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => openDetail(l.id)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <div className="mt-4">
          <Pagination meta={meta} onPage={handlePage} />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Log Detail ${detail?.id ? `#${detail.id}` : ""}`}>
        {detailLoading ? (
          <div>Loading...</div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Time</div>
                <div className="font-medium">{formatDate(detail.created_at)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Log name</div>
                <div className="font-medium">{detail.log_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Event</div>
                <div className="font-medium">{detail.event ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Description</div>
                <div className="font-medium">{detail.description}</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Causer</div>
              {detail.causer ? (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <div><strong>Name:</strong> {detail.causer.name ?? detail.causer.nama ?? `#${detail.causer_id}`}</div>
                  {detail.causer.email && <div><strong>Email:</strong> {detail.causer.email}</div>}
                  {detail.causer.role && <div><strong>Role:</strong> {detail.causer.role}</div>}
                </div>
              ) : (
                <div className="text-gray-400">No causer info</div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold">Subject (if any)</div>
              {detail.subject ? (
                <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto">{JSON.stringify(detail.subject, null, 2)}</pre>
              ) : (
                <div className="text-gray-400">No subject</div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold">Properties</div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                {prettyProps(detail.properties).map((kv) => (
                  <div key={kv.key} className="p-3 bg-white border rounded">
                    <div className="text-xs text-gray-500">{kv.key}</div>
                    <div className="text-sm font-mono break-words">{kv.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No detail loaded.</div>
        )}
      </Modal>
    </div>
    </AdminLayout>
  );
};

export default Dashboard;

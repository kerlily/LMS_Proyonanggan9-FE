// src/pages/siswa/SiswaJadwal.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Clock, Printer } from "lucide-react";
import SiswaLayout from "../../components/layout/SiswaLayout";
import api from "../../_api";

const HARI_OPTIONS = [
  { value: "senin", label: "SENIN" },
  { value: "selasa", label: "SELASA" },
  { value: "rabu", label: "RABU" },
  { value: "kamis", label: "KAMIS" },
  { value: "jumat", label: "JUMAT" },
  { value: "sabtu", label: "SABTU" },
];

function generateTimeSlots(jadwalData) {
  const all = new Set();
  const result = [];

  Object.keys(jadwalData.slots_by_hari || {}).forEach((hari) => {
    (jadwalData.slots_by_hari[hari] || []).forEach((s) => {
      if (s.jam_mulai) all.add(s.jam_mulai);
      if (s.jam_selesai) all.add(s.jam_selesai);
    });
  });

  const sorted = [...all].sort();
  if (sorted.length < 2) return [];

  const ranges = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    ranges.push({
      start: sorted[i],
      end: sorted[i + 1],
      display: `${sorted[i]} - ${sorted[i + 1]}`,
    });
  }

  ranges.forEach((r) => {
    const row = { time: r.display, slots: {} };

    HARI_OPTIONS.forEach(({ value: hari }) => {
      const slots = jadwalData.slots_by_hari?.[hari] || [];
      const found = slots.find(
        (s) => s.jam_mulai <= r.start && s.jam_selesai > r.start
      );

      if (found) {
        const rowspan = ranges.filter(
          (x) => x.start >= found.jam_mulai && x.end <= found.jam_selesai
        ).length;

        row.slots[hari] = {
          ...found,
          rowspan,
          hide: r.start !== found.jam_mulai,
        };
      }
    });

    result.push(row);
  });

  return result;
}

function formatTime(t) {
  if (!t) return "-";
  return String(t).slice(0, 5);
}

export default function SiswaJadwal() {
  const [loading, setLoading] = useState(true);
  const [jadwalData, setJadwalData] = useState(null);
  const [kelasNama, setKelasNama] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError(null);

      const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;

      if (!user?.kelas_id) {
        setError("Data kelas tidak ditemukan");
        return;
      }

      const response = await api.get(`/kelas/${user.kelas_id}/jadwal`);
      setJadwalData(response.data);
      setKelasNama(user.kelas_nama || "");
    } catch (err) {
      console.error(err);
      setError("Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  };

  // PRINT — open new window that contains only the table (so SiswaLayout not printed)
  const handlePrint = () => {
    if (!jadwalData) return;

    const rows = generateTimeSlots(jadwalData);
    const title = "Jadwal Pelajaran";
    const semNama = jadwalData.jadwal?.nama ?? "";
    const tahunNama = jadwalData.jadwal?.tahun_ajaran?.nama ?? "";
    const semText = jadwalData.jadwal?.semester?.nama
      ? `Semester ${jadwalData.jadwal.semester.nama}`
      : "";

    // CSS for print window: header blue, table borders blue, cells white
    const style = `
      body { font-family: Arial, sans-serif; padding:20px; color:#0f172a; }
      .header { text-align:center; margin-bottom:18px; }
      .title { font-size:20px; font-weight:700; }
      .meta { margin-top:6px; font-size:13px; color:#334155; }
      table { width:100%; border-collapse:collapse; margin-top:10px; }
      th, td { border:1px solid #1e40af; padding:8px; font-size:13px; vertical-align:middle; }
      thead th { background:#bfdbfe; color:#1e3a8a; font-weight:700; text-align:center; }
      .time { background:#bfdbfe; font-weight:700; text-align:center; color:#1e3a8a; width:120px; }
      td { background: #ffffff; color:#0f172a; }
      @media print {
        body { padding:12mm; }
      }
    `;

    // build table HTML
    let tableHtml = `<table><thead><tr><th class="time">Jam</th>`;
    HARI_OPTIONS.forEach((h) => {
      tableHtml += `<th>${h.label}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    rows.forEach((r) => {
      tableHtml += `<tr>`;
      tableHtml += `<td class="time">${r.time}</td>`;

      HARI_OPTIONS.forEach((h) => {
        const d = r.slots[h.value];
        if (!d) {
          tableHtml += `<td></td>`;
        } else if (!d.hide) {
          const rowspanAttr = d.rowspan > 1 ? `rowspan="${d.rowspan}"` : "";
          const name =
            d.tipe_slot === "pelajaran"
              ? d.mapel?.nama || "-"
              : d.keterangan || "-";

          const kode = d.mapel?.kode
            ? `<div style="font-size:11px;color:#334155;margin-top:4px">(${d.mapel.kode})</div>`
            : "";

          tableHtml += `<td ${rowspanAttr}><div style="font-weight:600">${name}${kode}</div></td>`;
        }
      });

      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;

    const html = `
      <html>
        <head><title>${title}</title><style>${style}</style></head>
        <body>
          <div class="header">
            <div class="title">${title}</div>
            <div class="meta">${kelasNama}</div>
            <div class="meta">${semNama} · ${tahunNama} · ${semText}</div>
          </div>
          ${tableHtml}
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      alert("Popup diblokir — izinkan popup lalu coba lagi.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 350);
  };

  if (loading)
    return (
      <SiswaLayout>
        <div className="text-center py-20">Memuat jadwal...</div>
      </SiswaLayout>
    );

  if (error)
    return (
      <SiswaLayout>
        <div className="bg-white rounded-lg p-6 text-center shadow">
          <p className="text-gray-600">{error}</p>
        </div>
      </SiswaLayout>
    );

  return (
    <SiswaLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Jadwal Pelajaran</h2>
              <p className="text-sm text-gray-600">{kelasNama}</p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Printer size={16} />
            Cetak
          </button>
        </div>

        {/* Cards per hari: header hari with blue bg only; list area white */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HARI_OPTIONS.map(({ value, label }) => {
            const slots = jadwalData.slots_by_hari?.[value] || [];
            return (
              <div key={value} className="bg-white rounded-xl shadow p-0 overflow-hidden">
                {/* Day header: blue background only */}
                <div className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold text-sm">
                  {label}
                </div>

                {/* White card content */}
                <div className="p-4 bg-white">
                  {slots.length === 0 ? (
                    <div className="text-gray-400 text-sm">Tidak ada jadwal</div>
                  ) : (
                    <div className="space-y-2">
                      {slots.map((slot, idx) => (
                        <div
                          key={slot.id || idx}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white"
                        >
                          <div className="w-24 flex-shrink-0 text-center">
                            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Jam</span>
                            </div>

                            <div className="mt-1 font-bold text-sm text-blue-800">
                              {formatTime(slot.jam_mulai)}
                              <span className="block text-[12px] text-gray-600 font-medium">
                                — {formatTime(slot.jam_selesai)}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {slot.tipe_slot === "pelajaran"
                                ? slot.mapel?.nama || "-"
                                : slot.keterangan || "-"}
                            </div>

                            {slot.mapel?.kode && (
                              <div className="text-[12px] text-gray-500 mt-1">
                                {slot.mapel.kode}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiswaLayout>
  );
}

// src/pages/public/studentDashboard.jsx 
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentSiswa, getNilaiMe, getKetidakhadiranMe, getNilaiSikapMe, logoutSiswa } from "../../_services/siswa";
import SiswaLayout from "../../components/layout/SiswaLayout";
import { MessageSquare, Tag } from "lucide-react";

function valueBadge(val) {
  if (val === null || val === undefined || val === "-") {
    return { cls: "text-gray-400 bg-gray-100", text: "-" };
  }
  const n = Number(val);
  if (Number.isNaN(n)) return { cls: "text-gray-400 bg-gray-100", text: "-" };

  if (n < 40) return { cls: "text-red-700 bg-red-100", text: String(n) }; 
  if (n < 60) return { cls: "text-yellow-800 bg-yellow-100", text: String(n) };
  return { cls: "text-green-800 bg-green-100", text: String(n) };
}

function nilaiSikapBadge(nilai) {
  const badges = {
    'A': { cls: "text-blue-700 bg-blue-100", text: "A - Sangat Baik" },
    'B': { cls: "text-green-700 bg-green-100", text: "B - Baik" },
    'C': { cls: "text-yellow-700 bg-yellow-100", text: "C - Cukup" },
    'D': { cls: "text-red-700 bg-red-100", text: "D - Perlu Perbaikan" }
  };
  return badges[nilai] ?? { cls: "text-gray-400 bg-gray-100", text: "-" };
}

function getCatatanSourceBadge(source) {
  const badges = {
    manual: { label: "Manual", color: "bg-blue-100 text-blue-700 border-blue-200" },
    excel: { label: "Excel", color: "bg-green-100 text-green-700 border-green-200" },
    generated: { label: "Generated", color: "bg-purple-100 text-purple-700 border-purple-200" },
  };
  
  const badge = badges[source] || { 
    label: source || "—", 
    color: "bg-gray-100 text-gray-600 border-gray-200" 
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
      <Tag className="w-3 h-3" />
      {badge.label}
    </span>
  );
}

export default function StudentDashboard() {
  const [siswaInfo, setSiswaInfo] = useState(null);
  const [nilaiData, setNilaiData] = useState(null);
  const [ketidakhadiranData, setKetidakhadiranData] = useState(null);
  const [nilaiSikapData, setNilaiSikapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const didFetchRef = useRef(false);

  useEffect(() => {
    const siswaToken = localStorage.getItem("siswa_token") || localStorage.getItem("token");
    if (!siswaToken) {
      navigate("/siswa/login");
      return;
    }

    let mounted = true;
    if (didFetchRef.current) {
      setLoading(false);
      return;
    }
    didFetchRef.current = true;

    (async () => {
      try {
        const [siswaRes, nilaiRes, ketidakhadiranRes, nilaiSikapRes] = await Promise.all([
          getCurrentSiswa(),
          getNilaiMe(),
          getKetidakhadiranMe(),
          getNilaiSikapMe()
        ]);
        
        if (!mounted) return;
        
        setSiswaInfo(siswaRes);
        setNilaiData(nilaiRes.data);
        setKetidakhadiranData(ketidakhadiranRes.data);
        setNilaiSikapData(nilaiSikapRes.data);
      } catch (err) {
        console.error("Gagal ambil data:", err);
        if (err?.response?.status === 401) {
          try {
            await logoutSiswa();
          } catch {
            // ignore
          }
          navigate("/siswa/login");
        } else {
          setError("Gagal memuat data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [navigate]);

  if (loading) {
    return (
      <SiswaLayout>
        <div className="py-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </SiswaLayout>
    );
  }

  if (error) {
    return (
      <SiswaLayout>
        <div className="p-6 text-red-600 text-center">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </SiswaLayout>
    );
  }

  if (!nilaiData) {
    return (
      <SiswaLayout>
        <div className="p-6 text-center text-gray-600">Tidak ada data nilai.</div>
      </SiswaLayout>
    );
  }

  const records = nilaiData.academic_records ?? nilaiData.semesters ?? [];
  
  const yearsMap = new Map();
  records.forEach((rec) => {
    const tahun = rec.tahun_ajaran ?? rec.tahun ?? null;
    const tid = tahun?.id ?? "__no_tahun__";
    if (!yearsMap.has(tid)) yearsMap.set(tid, { tahun, entries: [] });
    yearsMap.get(tid).entries.push(rec);
  });

  const yearsArr = Array.from(yearsMap.values()).sort((a, b) => {
    const A = a.tahun, B = b.tahun;
    if (!A && !B) return 0;
    if (!A) return -1;
    if (!B) return 1;
    if (typeof A.id === "number" && typeof B.id === "number")
      return A.id - B.id;
    const parseStart = (s) => {
      if (!s) return 0;
      const m = String(s).match(/\d{4}/);
      return m ? Number(m[0]) : 0;
    };
    return parseStart(A.nama) - parseStart(B.nama);
  });

  function getKetidakhadiran(tahunId, semesterId) {
    if (!ketidakhadiranData?.data) return null;
    return ketidakhadiranData.data.find(
      k => k.tahun_ajaran?.id === tahunId && k.semester?.id === semesterId
    );
  }

  function getNilaiSikap(tahunId, semesterId) {
    if (!nilaiSikapData?.data) return null;
    return nilaiSikapData.data.find(
      n => n.tahun_ajaran?.id === tahunId && n.semester?.id === semesterId
    );
  }

  function buildYearTable(entries) {
    const semList = [];
    entries.forEach((e) => {
      const s = e.semester ?? null;
      if (!s) return;
      const key = s.id ?? s.semester ?? JSON.stringify(s);
      if (!semList.some((x) => x.key === key)) semList.push({ key, info: s });
    });
    semList.sort((a, b) => {
      const ai = a.info?.id ?? a.info?.semester ?? 0;
      const bi = b.info?.id ?? b.info?.semester ?? 0;
      return ai - bi;
    });

    const mapelMap = new Map();
    entries.forEach((e) => {
      const nilaiList = e.nilai ?? e.mapels ?? [];
      const semKey = e.semester?.id ?? e.semester?.semester ?? "__sem__";
      nilaiList.forEach((n) => {
        const mapelObj = n.mapel ?? null;
        const mid =
          mapelObj?.id ??
          mapelObj ??
          n.mapel_id ??
          n.id ??
          JSON.stringify(mapelObj ?? n);
        const mname =
          (mapelObj && (mapelObj.nama ?? mapelObj.name)) ??
          n.mapel ??
          n.nama_mapel ??
          n.mapel_name ??
          "—";
        if (!mapelMap.has(mid)) {
          mapelMap.set(mid, { id: mid, nama: mname, values: new Map() });
        }
        const val =
          typeof n.nilai === "number"
            ? n.nilai
            : n.nilai
            ? Number(n.nilai)
            : null;
        
        //  Ambil catatan dan catatan_source
        const note = n.catatan ?? n.note ?? null;
        const catatanSource = n.catatan_source ?? null;
        
        mapelMap.get(mid).values.set(semKey, { 
          value: val, 
          note: note,
          catatan_source: catatanSource 
        });
      });
    });

    const mapelRows = Array.from(mapelMap.values()).sort((a, b) => {
      const A = String(a.nama).toLowerCase();
      const B = String(b.nama).toLowerCase();
      return A.localeCompare(B);
    });

    const semesters = semList.map((s) => s.info);
    return { semesters, mapelRows };
  }

  return (
    <SiswaLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded shadow p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard Siswa</h1>
            <div className="text-xl md:text-2xl text-gray-800">
              <div className="flex items-center gap-2">
                <span>Selamat datang,</span>
                <span className="font-bold text-blue-700">
                 {siswaInfo?.nama || "Siswa"}
                </span>
                <span className="text-3xl">👋</span>
              </div>
              {siswaInfo?.nisn && (
                <div className="text-sm text-gray-600 mt-1">
                  NISN: <span className="font-semibold text-gray-800">{siswaInfo.nisn}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tahun ajaran tables */}
        {yearsArr.map((y) => {
          const tahun = y.tahun;
          const entries = y.entries;

          const kelasSet = new Set(
            entries
              .map((e) => e.kelas_historis?.nama)
              .filter((v) => v)
          );
          let kelasLabel = "";
          if (kelasSet.size === 1) {
            kelasLabel = Array.from(kelasSet)[0];
          } else if (kelasSet.size > 1) {
            kelasLabel = Array.from(kelasSet).join(" / ");
          } else {
            kelasLabel = nilaiData.siswa?.kelas_saat_ini ?? "";
          }

          const { semesters, mapelRows } = buildYearTable(entries);

          const semKeys = semesters.map((s) => s?.id ?? s?.semester ?? "__sem__");
          const perMapel = mapelRows.map((mr) => {
            const rawValues = semKeys.map((k) => {
              const cell = mr.values.get(k);
              return cell && typeof cell.value === "number" ? cell.value : null;
            });
            const numeric = rawValues.filter(
              (v) => typeof v === "number" && !Number.isNaN(v)
            );
            const avg = numeric.length
              ? numeric.reduce((a, b) => a + b, 0) / numeric.length
              : null;
            return { mr, values: rawValues, avg };
          });

          const yearNumeric = perMapel
            .map((p) => p.avg)
            .filter((v) => typeof v === "number" && !Number.isNaN(v));
          const yearAvg = yearNumeric.length
            ? yearNumeric.reduce((a, b) => a + b, 0) / yearNumeric.length
            : null;

          return (
            <div
              key={tahun?.id ?? Math.random()}
              className="bg-white rounded shadow p-4"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    Tahun Ajaran: {tahun?.nama ?? "-"}
                  </div>
                  <div className="font-semibold text-lg mt-1">
                    {kelasLabel || (semesters.length ? semesters.map((s,i)=> (i? " / " : "") + (s.nama ?? `Semester ${i+1}`)) : "Semester -")}
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  Rata-rata tahun:{" "}
                  <span className="font-semibold">
                    {yearAvg !== null ? yearAvg.toFixed(2) : "-"}
                  </span>
                </div>
              </div>

              {mapelRows.length === 0 ? (
                <div className="py-6 px-3 text-gray-500 text-center">
                  Belum ada data mapel untuk tahun ajaran ini.
                </div>
              ) : (
                semesters.map((s, idx) => {
                  const semKey = s?.id ?? s?.semester ?? `__sem__${idx}`;
                  const rows = mapelRows;
                  
                  const semVals = mapelRows
                    .map((mr) => {
                      const c = mr.values.get(semKey);
                      return c &&
                        typeof c.value === "number" &&
                        !Number.isNaN(c.value)
                        ? c.value
                        : null;
                    })
                    .filter((v) => typeof v === "number");

                  const sAvg = semVals.length
                    ? semVals.reduce((a, b) => a + b, 0) / semVals.length
                    : null;

                  const ketidakhadiran = getKetidakhadiran(tahun?.id, s?.id);
                  const nilaiSikap = getNilaiSikap(tahun?.id, s?.id);

                  return (
                    <div key={semKey} className="mb-4 bg-gray-50 rounded p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-semibold">
                          {s?.nama ?? `Semester ${idx + 1}`}
                        </div>
                        <div className="text-sm text-gray-700">
                          Rata-rata semester:{" "}
                          <span className="font-semibold">
                            {sAvg !== null ? sAvg.toFixed(2) : "-"}
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2">
                              <th className="py-3 px-3 w-12 text-left">No</th>
                              <th className="py-3 px-3 text-left">Mata Pelajaran</th>
                              <th className="py-3 px-3 w-32 text-center">Nilai</th>
                              <th className="py-3 px-3 text-left">Capaian Akademik</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((mr, i) => {
                              const cell = mr.values.get(semKey) ?? {
                                value: null,
                                note: null,
                                catatan_source: null
                              };
                              const v = cell.value;
                              const badge = valueBadge(v);
                              
                              return (
                                <tr
                                  key={mr.id ?? mr.nama ?? i}
                                  className="border-b hover:bg-white transition-colors"
                                >
                                  <td className="py-3 px-3 text-center">{i + 1}</td>
                                  <td className="py-3 px-3 font-medium">{mr.nama}</td>
                                  <td className="py-3 px-3 text-center">
                                    <span
                                      className={`inline-block px-3 py-1 rounded ${badge.cls} font-semibold`}
                                    >
                                      {badge.text}
                                    </span>
                                  </td>
                                  
                                  <td className="py-3 px-3">
                                    {cell.note ? (
                                      <div className="space-y-1">
                                        <div className="flex items-start gap-2">
                                          <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                          <p className="text-sm text-gray-700 leading-relaxed">
                                            {cell.note}
                                          </p>
                                        </div>
                                        {cell.catatan_source && (
                                          <div className="pl-6">
                                            {getCatatanSourceBadge(cell.catatan_source)}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400 italic">
                                        Tidak ada catatan
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Ketidakhadiran Section */}
                      <div className="bg-white rounded p-3 mb-3">
                        <h4 className="font-semibold text-sm mb-2">Ketidakhadiran</h4>
                        {ketidakhadiran ? (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div className="bg-yellow-50 p-2 rounded">
                              <div className="text-gray-600 text-xs">Ijin</div>
                              <div className="font-semibold text-lg">{ketidakhadiran.ijin}</div>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                              <div className="text-gray-600 text-xs">Sakit</div>
                              <div className="font-semibold text-lg">{ketidakhadiran.sakit}</div>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <div className="text-gray-600 text-xs">Alpa</div>
                              <div className="font-semibold text-lg">{ketidakhadiran.alpa}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-600 text-xs">Total</div>
                              <div className="font-semibold text-lg">{ketidakhadiran.total}</div>
                            </div>
                            {ketidakhadiran.catatan && (
                              <div className="col-span-2 md:col-span-5 bg-gray-50 p-2 rounded">
                                <div className="text-gray-600 text-xs">Catatan</div>
                                <div className="text-sm mt-1">{ketidakhadiran.catatan}</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Belum ada data ketidakhadiran</div>
                        )}
                      </div>

                      {/* Nilai Sikap Section */}
                      <div className="bg-white rounded p-3">
                        <h4 className="font-semibold text-sm mb-2">Nilai Sikap</h4>
                        {nilaiSikap ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Nilai:</span>
                              <span
                                className={`inline-block px-3 py-1 rounded ${nilaiSikapBadge(nilaiSikap.nilai).cls} font-semibold`}
                              >
                                {nilaiSikapBadge(nilaiSikap.nilai).text}
                              </span>
                            </div>
                            {nilaiSikap.deskripsi && (
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-gray-600 text-xs mb-1">Deskripsi</div>
                                <div className="text-sm">{nilaiSikap.deskripsi}</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Belum ada data nilai sikap</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}

        {/* Global Average */}
        <div className="bg-white rounded shadow p-4">
          {(() => {
            const allVals = [];
            records.forEach((rec) => {
              const list = rec.nilai ?? rec.mapels ?? [];
              list.forEach((n) => {
                const v = typeof n.nilai === "number" ? n.nilai : Number(n.nilai);
                if (!Number.isNaN(v)) allVals.push(v);
              });
            });
            const globalAvg = allVals.length
              ? allVals.reduce((a, b) => a + b, 0) / allVals.length
              : null;
            return (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Rata-rata keseluruhan</div>
                <div className="text-lg font-semibold">
                  {globalAvg !== null ? globalAvg.toFixed(2) : "-"}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </SiswaLayout>
  );
}

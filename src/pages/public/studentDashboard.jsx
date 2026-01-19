import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentSiswa, getNilaiMe, getKetidakhadiranMe, getNilaiSikapMe, logoutSiswa } from "../../_services/siswa";
import SiswaLayout from "../../components/layout/SiswaLayout";

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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </SiswaLayout>
    );
  }
  
  if (error) {
    return (
      <SiswaLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </SiswaLayout>
    );
  }
  
  if (!nilaiData) {
    return (
      <SiswaLayout>
        <div className="p-6 text-center text-gray-600">
          Tidak ada data nilai.
        </div>
      </SiswaLayout>
    );
  }

  const records = nilaiData.academic_records ?? [];
  
  const yearsMap = new Map();
  records.forEach((rec) => {
    const tahun = rec.tahun_ajaran;
    const tid = tahun?.id ?? "__no_tahun__";
    if (!yearsMap.has(tid)) {
      yearsMap.set(tid, { tahun, entries: [] });
    }
    yearsMap.get(tid).entries.push(rec);
  });

  const yearsArr = Array.from(yearsMap.values()).sort((a, b) => {
    const A = a.tahun, B = b.tahun;
    if (!A && !B) return 0;
    if (!A) return -1;
    if (!B) return 1;
    if (typeof A.id === "number" && typeof B.id === "number") {
      return A.id - B.id;
    }
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
    const semMap = new Map();
    entries.forEach((e) => {
      const s = e.semester;
      if (s && s.id && !semMap.has(s.id)) {
        semMap.set(s.id, s);
      }
    });
    
    const semesters = Array.from(semMap.values()).sort((a, b) => {
      return (a.id ?? 0) - (b.id ?? 0);
    });

    const mapelMap = new Map();
    entries.forEach((e) => {
      const nilaiList = e.nilai ?? [];
      const semId = e.semester?.id;
      
      nilaiList.forEach((n) => {
        const mapelObj = n.mapel;
        const mid = mapelObj?.id;
        const mname = mapelObj?.nama ?? "—";
        
        if (mid && !mapelMap.has(mid)) {
          mapelMap.set(mid, { id: mid, nama: mname, values: new Map() });
        }
        
        if (mid) {
          const val = typeof n.nilai === "number" ? n.nilai : (n.nilai ? Number(n.nilai) : null);
          const note = n.catatan ?? "-";
          mapelMap.get(mid).values.set(semId, { value: val, note });
        }
      });
    });

    const mapelRows = Array.from(mapelMap.values()).sort((a, b) => {
      return a.nama.toLowerCase().localeCompare(b.nama.toLowerCase());
    });

    return { semesters, mapelRows };
  }

  return (
    <SiswaLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header with Student Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-100">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Dashboard Siswa</h1>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl text-gray-700">
                Selamat datang,
                <span className="font-bold text-blue-700 ml-2">
                  {siswaInfo?.nama || "Siswa"}
                </span>
                <span className="text-3xl ml-2">👋</span>
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm mt-3">
              {siswaInfo?.nisn && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-gray-600">NISN:</span>
                  <span className="font-semibold text-gray-800">{siswaInfo.nisn}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic Records */}
        {yearsArr.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p className="text-lg">Belum ada data nilai untuk ditampilkan.</p>
          </div>
        ) : (
          yearsArr.map((y) => {
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
              kelasLabel = siswaInfo?.kelas?.nama || "";
            }

            const { semesters, mapelRows } = buildYearTable(entries);

            const allYearValues = mapelRows.flatMap((mr) => {
              return Array.from(mr.values.values())
                .map((c) => c.value)
                .filter((v) => typeof v === "number" && !Number.isNaN(v));
            });
            const yearAvg = allYearValues.length
              ? allYearValues.reduce((a, b) => a + b, 0) / allYearValues.length
              : null;

            return (
              <div
                key={tahun?.id ?? Math.random()}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="mb-4 flex items-baseline justify-between border-b pb-3">
                  <div>
                    <div className="text-sm text-gray-500 font-medium">
                      Tahun Ajaran: {tahun?.nama ?? "-"}
                    </div>
                    <div className="font-semibold text-lg mt-1 text-gray-800">
                      {kelasLabel || "Kelas -"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Rata-rata tahun</div>
                    <div className="text-lg font-bold text-blue-600">
                      {yearAvg !== null ? yearAvg.toFixed(2) : "-"}
                    </div>
                  </div>
                </div>

                {mapelRows.length === 0 ? (
                  <div className="py-8 px-3 text-gray-500 text-center">
                    Belum ada data mapel untuk tahun ajaran ini.
                  </div>
                ) : (
                  semesters.map((s) => {
                    const semId = s.id;
                    
                    const semValues = mapelRows
                      .map((mr) => {
                        const c = mr.values.get(semId);
                        return c?.value;
                      })
                      .filter((v) => typeof v === "number" && !Number.isNaN(v));

                    const sAvg = semValues.length
                      ? semValues.reduce((a, b) => a + b, 0) / semValues.length
                      : null;

                    const ketidakhadiran = getKetidakhadiran(tahun?.id, semId);
                    const nilaiSikap = getNilaiSikap(tahun?.id, semId);

                    return (
                      <div key={semId} className="mb-6 bg-gray-50 rounded-lg p-4">
                        <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                          <div className="font-semibold text-lg text-gray-800">{s.nama}</div>
                          <div className="text-sm text-gray-600">
                            Rata-rata:{" "}
                            <span className="font-bold text-blue-600">
                              {sAvg !== null ? sAvg.toFixed(2) : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Nilai Akademik Table */}
                        <div className="overflow-x-auto mb-4 bg-white rounded-lg shadow-sm">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr className="border-b-2 border-gray-200">
                                <th className="py-3 px-3 w-12 text-left font-semibold text-gray-700">No</th>
                                <th className="py-3 px-3 text-left font-semibold text-gray-700">Mata Pelajaran</th>
                                <th className="py-3 px-3 w-40 text-center font-semibold text-gray-700">Nilai</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mapelRows.map((mr, i) => {
                                const cell = mr.values.get(semId) ?? { value: null, note: "-" };
                                const badge = valueBadge(cell.value);

                                return (
                                  <tr key={mr.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-3 text-center text-gray-600">{i + 1}</td>
                                    <td className="py-3 px-3 text-gray-800">{mr.nama}</td>
                                    <td className="py-3 px-3 text-center">
                                      <span className={`inline-block px-3 py-1 rounded-full ${badge.cls} font-semibold text-sm`}>
                                        {badge.text}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Ketidakhadiran Section */}
                        <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                          <h4 className="font-semibold text-base mb-3 text-gray-800">Ketidakhadiran</h4>
                          {ketidakhadiran ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                  <div className="text-gray-600 text-xs font-medium mb-1">Ijin</div>
                                  <div className="font-bold text-xl text-yellow-700">{ketidakhadiran.ijin}</div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <div className="text-gray-600 text-xs font-medium mb-1">Sakit</div>
                                  <div className="font-bold text-xl text-blue-700">{ketidakhadiran.sakit}</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                  <div className="text-gray-600 text-xs font-medium mb-1">Alpa</div>
                                  <div className="font-bold text-xl text-red-700">{ketidakhadiran.alpa}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <div className="text-gray-600 text-xs font-medium mb-1">Total</div>
                                  <div className="font-bold text-xl text-gray-700">{ketidakhadiran.total}</div>
                                </div>
                              </div>
                              {ketidakhadiran.catatan && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <div className="text-gray-600 text-xs font-medium mb-1">Catatan</div>
                                  <div className="text-sm text-gray-700">{ketidakhadiran.catatan}</div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-2">
                              Belum ada data ketidakhadiran
                            </div>
                          )}
                        </div>

                        {/* Nilai Sikap Section */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-base mb-3 text-gray-800">Nilai Sikap</h4>
                          {nilaiSikap ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 font-medium">Nilai:</span>
                                <span className={`inline-block px-4 py-2 rounded-lg ${nilaiSikapBadge(nilaiSikap.nilai).cls} font-bold`}>
                                  {nilaiSikapBadge(nilaiSikap.nilai).text}
                                </span>
                              </div>
                              {nilaiSikap.deskripsi && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <div className="text-gray-600 text-xs font-medium mb-1">Deskripsi</div>
                                  <div className="text-sm text-gray-700">{nilaiSikap.deskripsi}</div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-2">
                              Belum ada data nilai sikap
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })
        )}

        {/* Global Average */}
        {records.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            {(() => {
              const allVals = [];
              records.forEach((rec) => {
                const nilaiList = rec.nilai ?? [];
                nilaiList.forEach((n) => {
                  const v = typeof n.nilai === "number" ? n.nilai : Number(n.nilai);
                  if (!Number.isNaN(v)) allVals.push(v);
                });
              });
              const globalAvg = allVals.length
                ? allVals.reduce((a, b) => a + b, 0) / allVals.length
                : null;
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-100 mb-1">Rata-rata Keseluruhan</div>
                    <div className="text-xs text-blue-200">
                      Dari {allVals.length} nilai
                    </div>
                  </div>
                  <div className="text-4xl font-bold">
                    {globalAvg !== null ? globalAvg.toFixed(2) : "-"}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </SiswaLayout>
  );
}
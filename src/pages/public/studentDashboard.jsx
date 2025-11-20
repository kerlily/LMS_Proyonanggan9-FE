import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNilaiMe, changePassword, logoutSiswa } from "../../_services/siswa";

/**
 * StudentDashboard (tabel per Tahun Ajaran)
 * - One table per year (oldest -> newest)
 * - Columns: No | Mata Pelajaran | Semester... | Rata-rata
 * - Color-coded value badges: <40 red, <60 yellow, >=60 green
 */

function valueBadge(val) {
  // returns tailwind classes and formatted string
  if (val === null || val === undefined || val === "-") {
    return { cls: "text-gray-400 bg-gray-100", text: "-" };
  }
  const n = Number(val);
  if (Number.isNaN(n)) return { cls: "text-gray-400 bg-gray-100", text: "-" };

  if (n < 40) return { cls: "text-red-700 bg-red-100", text: String(n) };
  if (n < 60) return { cls: "text-yellow-800 bg-yellow-100", text: String(n) };
  return { cls: "text-green-800 bg-green-100", text: String(n) };
}

export default function StudentDashboard() {
  const [nilaiData, setNilaiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("siswatoken");
    if (!token) {
      navigate("/siswa/login");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await getNilaiMe();
        if (!mounted) return;
        setNilaiData(res.data);
      } catch (err) {
        console.error("Gagal ambil nilai:", err);
        if (err?.response?.status === 401) {
          try {
            await logoutSiswa();
          } catch {
            // ignore
          }
          navigate("/siswa/login");
        } else {
          setError("Gagal memuat data nilai.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [navigate]);

  const handleChangePassword = async () => {
    setMsg(null);
    if (!newPassword) return setMsg("Isi password baru");
    try {
      await changePassword({ password: newPassword });
      setMsg("Password berhasil diubah");
      setNewPassword("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Gagal ganti password");
    }
  };

  const handleLogout = async () => {
    await logoutSiswa();
    navigate("/siswa/login");
  };

  if (loading) return <div className="p-6">Memuat data...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!nilaiData) return <div className="p-6">Tidak ada data nilai.</div>;

  // prefer academic_records (new structure), fallback to semesters
  const records = nilaiData.academic_records ?? nilaiData.semesters ?? [];
  // group by tahun_ajaran (object) id (or fallback)
  const yearsMap = new Map();
  records.forEach((rec) => {
    const tahun = rec.tahun_ajaran ?? rec.tahun ?? null;
    const tid = tahun?.id ?? "__no_tahun__";
    if (!yearsMap.has(tid)) yearsMap.set(tid, { tahun, entries: [] });
    yearsMap.get(tid).entries.push(rec);
  });

  // convert and sort ascending (oldest first)
  const yearsArr = Array.from(yearsMap.values()).sort((a, b) => {
    const A = a.tahun,
      B = b.tahun;
    if (!A && !B) return 0;
    if (!A) return -1;
    if (!B) return 1;
    // try numeric id
    if (typeof A.id === "number" && typeof B.id === "number")
      return A.id - B.id;
    // parse starting year from name like "2023/2024"
    const parseStart = (s) => {
      if (!s) return 0;
      const m = String(s).match(/\d{4}/);
      return m ? Number(m[0]) : 0;
    };
    return parseStart(A.nama) - parseStart(B.nama);
  });

  // helper: build table data for a year's entries
  function buildYearTable(entries) {
    // collect semester objects (unique)
    const semList = [];
    entries.forEach((e) => {
      const s = e.semester ?? null;
      if (!s) return;
      const key = s.id ?? s.semester ?? JSON.stringify(s);
      if (!semList.some((x) => x.key === key)) semList.push({ key, info: s });
    });
    // sort semList by id/semester
    semList.sort((a, b) => {
      const ai = a.info?.id ?? a.info?.semester ?? 0;
      const bi = b.info?.id ?? b.info?.semester ?? 0;
      return ai - bi;
    });

    // collect union of subjects (mapel) and store values+notes per semester
    const mapelMap = new Map();
    entries.forEach((e) => {
      const nilaiList = e.nilai ?? e.mapels ?? [];
      // determine semester key for this entry
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
          // note: values is Map<semKey, { value: number|null, note: string }>
          mapelMap.set(mid, { id: mid, nama: mname, values: new Map() });
        }
        const val =
          typeof n.nilai === "number"
            ? n.nilai
            : n.nilai
            ? Number(n.nilai)
            : null;
        const note = n.catatan ?? n.note ?? "-";
        mapelMap.get(mid).values.set(semKey, { value: val, note: note });
      });
    });

    // ensure mapels are in stable order (by name)
    const mapelRows = Array.from(mapelMap.values()).sort((a, b) => {
      const A = String(a.nama).toLowerCase();
      const B = String(b.nama).toLowerCase();
      return A.localeCompare(B);
    });

    const semesters = semList.map((s) => s.info);
    return { semesters, mapelRows };
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded shadow p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard Siswa</h1>
          {nilaiData.siswa && (
            <p className="text-sm text-gray-600 mt-1">
              {nilaiData.siswa.nama}{" "}
              {nilaiData.siswa.kelas_id
                ? `— Kelas ID: ${nilaiData.siswa.kelas_id}`
                : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm border rounded text-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tahun ajaran tables */}
      {yearsArr.map((y) => {
        const tahun = y.tahun;
        const entries = y.entries;

        const kelasSet = new Set(
    entries
      .map((e) => e.kelas_historis?.nama) // ambil nama kelas_historis jika ada
      .filter((v) => v) // filter null/undefined/""
  );
   let kelasLabel = "";
  if (kelasSet.size === 1) {
    kelasLabel = Array.from(kelasSet)[0];
  } else if (kelasSet.size > 1) {
    kelasLabel = Array.from(kelasSet).join(" / ");
  } else {
    // fallback ke current class dari siswa (field di response.json: siswa.kelas_saat_ini)
    kelasLabel = nilaiData.siswa?.kelas_saat_ini ?? "";
  }


        const { semesters, mapelRows } = buildYearTable(entries);

        // compute per-semester averages and year average
        const semKeys = semesters.map((s) => s?.id ?? s?.semester ?? "__sem__");
        const perMapel = mapelRows.map((mr) => {
          // extract numeric values only
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

            {/* Render each semester as its own stacked table */}
            {mapelRows.length === 0 ? (
              <div className="py-6 px-3 text-gray-500 text-center">
                Belum ada data mapel untuk tahun ajaran ini.
              </div>
            ) : (
              semesters.map((s, idx) => {
                const semKey = s?.id ?? s?.semester ?? `__sem__${idx}`;
                const rows = mapelRows;
                // per-semester average across mapels
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

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2">
                            <th className="py-3 px-3 w-12 text-left">No</th>
                            <th className="py-3 px-3 text-left">
                              Mata Pelajaran
                            </th>
                            <th className="py-3 px-3 w-40 text-center">
                              Nilai
                            </th>
                            <th className="py-3 px-3 w-32 text-center">
                              Rata-rata
                            </th>
                            <th className="py-3 px-3 w-32 text-center">
                              catatan
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((mr, i) => {
                            const cell = mr.values.get(semKey) ?? {
                              value: null,
                              note: "-",
                            };
                            const v = cell.value;
                            const note = cell.note ?? "-";
                            const badge = valueBadge(v);
                            // per-mapel avg for this single semester is the value itself (or null)
                            const avg =
                              typeof v === "number" && !Number.isNaN(v)
                                ? v
                                : null;
                            return (
                              <tr
                                key={mr.id ?? mr.nama ?? i}
                                className="border-b"
                              >
                                <td className="py-3 px-3 text-center">
                                  {i + 1}
                                </td>
                                <td className="py-3 px-3">{mr.nama}</td>
                                <td className="py-3 px-3 text-center">
                                  <span
                                    className={`inline-block px-2 py-1 rounded ${badge.cls} font-semibold`}
                                  >
                                    {badge.text}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center font-semibold">
                                  {avg !== null ? avg.toFixed(2) : "-"}
                                </td>
                                <td className="py-3 px-3 text-center text-sm text-gray-700">
                                  {note}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })}

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

      {/* change password */}
      <div className="mt-2 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Ganti Password</h3>
        <div className="flex gap-2">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password baru"
            className="rounded border px-3 py-2 flex-1"
          />
          <button
            onClick={handleChangePassword}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            Ubah
          </button>
        </div>
        {msg && <div className="mt-2 text-sm">{msg}</div>}
      </div>
    </div>
  );
}

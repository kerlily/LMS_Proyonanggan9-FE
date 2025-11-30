import React from "react";

const HARI_OPTIONS = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

const JadwalPrintView = ({ jadwalData, kelasNama }) => {
  if (!jadwalData) return null;

  return (
    <div className="print-view w-full bg-white p-6 print:p-0 print:m-0 print:w-full">

      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold mb-2 print:text-xl">JADWAL PELAJARAN</h1>
        <h2 className="text-xl font-semibold print:text-lg">{kelasNama}</h2>

        {jadwalData.jadwal.nama && (
          <p className="text-gray-600 print:text-black mt-2">
            {jadwalData.jadwal.nama}
          </p>
        )}

        <p className="text-sm text-gray-600 print:text-black mt-1">
          {jadwalData.jadwal.tahun_ajaran.nama} – Semester {jadwalData.jadwal.semester.nama}
        </p>
      </div>

      {/* Tabel Jadwal */}
      <table className="w-full border-collapse border-2 border-black print:text-xs">
        <thead>
          <tr className="bg-gray-200 print:bg-gray-200">
            <th className="border-2 border-black px-2 py-1 w-24 text-left font-bold">
              Jam
            </th>
            {HARI_OPTIONS.map((hari) => (
              <th
                key={hari.value}
                className="border-2 border-black px-2 py-1 text-center font-bold"
              >
                {hari.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {generateTimeSlots(jadwalData).map((slot, idx) => (
            <tr key={idx}>
              <td className="border-2 border-black px-2 py-1 font-semibold bg-gray-50 print:bg-gray-50">
                {slot.time}
              </td>

              {HARI_OPTIONS.map((hari) => {
                const data = slot.slots[hari.value];

                return (
                  <td
                    key={hari.value}
                    rowSpan={data ? data.rowspan : 1}
                    style={{ display: data && data.hide ? "none" : "table-cell" }}
                    className={
                      "border-2 border-black px-2 py-1" +
                      (data
                        ? data.tipe_slot === "pelajaran"
                          ? " bg-blue-50 print:bg-blue-50"
                          : " bg-gray-100 print:bg-gray-100"
                        : "")
                    }
                  >
                    {data && (
                      <div>
                        {data.tipe_slot === "pelajaran" ? (
                          <>
                            <div className="font-bold">{data.mapel?.nama || "-"}</div>
                            {data.mapel?.kode && (
                              <div className="text-xs text-gray-600 print:text-black">
                                ({data.mapel.kode})
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="font-semibold text-center">
                            {data.keterangan}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer (hilang saat print) */}
      <div className="mt-6 text-xs text-gray-600 print:hidden">
        Dicetak pada:{" "}
        {new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  );
};


// Helper pemroses slot waktu
function generateTimeSlots(jadwalData) {
  const all = new Set();
  const result = [];

  Object.keys(jadwalData.slots_by_hari).forEach((hari) => {
    jadwalData.slots_by_hari[hari].forEach((s) => {
      all.add(s.jam_mulai);
      all.add(s.jam_selesai);
    });
  });

  const sorted = [...all].sort();

  const ranges = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    ranges.push({
      start: sorted[i],
      end: sorted[i + 1],
      display: `${sorted[i]}-${sorted[i + 1]}`,
    });
  }

  ranges.forEach((r) => {
    const row = { time: r.display, slots: {} };

    HARI_OPTIONS.forEach(({ value: hari }) => {
      const slots = jadwalData.slots_by_hari[hari] || [];
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

export default JadwalPrintView;

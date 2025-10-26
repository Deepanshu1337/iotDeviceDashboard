import React, { useEffect, useMemo, useState } from "react";
import { fetchDeviceList } from "../services/api";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from "recharts";

function generateDummyData(deviceId, points = 200, monthsRange = 0.7) {
  const now = Date.now();
  const start = now - monthsRange * 30 * 24 * 3600 * 1000;
  const step = (now - start) / points;
  const data = [];
  let lastTemp = 20 + Math.random() * 8;
  let lastHum = 45 + Math.random() * 10;
  for (let i = 0; i < points; i++) {
    lastTemp += Math.random() * 2 - 1;
    lastHum += Math.random() * 3 - 1.5;
    data.push({
      timestamp: new Date(start + i * step).toISOString(),
      temp: Math.round(lastTemp * 100) / 100,
      hum: Math.round(lastHum * 100) / 100,
      deviceId,
    });
  }
  return data;
}

function downloadCSV(filename, rows) {
  const header = Object.keys(rows[0] || {}).join(",");
  const csv = rows
    .map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const contents = header + "\n" + csv;
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoricalData() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [range, setRange] = useState("24h"); // options: 24h, 7d, 3m
  const [dataCache, setDataCache] = useState({});

  useEffect(() => {
    (async function load() {
      const list = await fetchDeviceList();
      setDevices(list);
      if (list[0]) setSelectedDevice(list[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;
    if (!dataCache[selectedDevice]) {
      const points = range === "24h" ? 48 : range === "7d" ? 168 : 720;
      const monthsRange = range === "3m" ? 3 : range === "7d" ? 7 / 30 : 1 / 24;
      const d = generateDummyData(selectedDevice, points, monthsRange);
      setDataCache((prev) => ({ ...prev, [selectedDevice]: d }));
    }
  }, [selectedDevice, range, dataCache]);

  const filtered = useMemo(() => {
    if (!selectedDevice) return [];
    return dataCache[selectedDevice] || [];
  }, [dataCache, selectedDevice, range]);

  return (
    <div className="p-4 sm:p-6 text-gray-100 bg-gray-900 min-h-screen rounded-xl">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-400">Historical Data</h3>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6 flex-wrap">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <label className="text-gray-300 font-medium text-xs sm:text-sm">Device:</label>
          <select
            value={selectedDevice || ""}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="mt-1 sm:mt-0 w-full sm:w-auto bg-gray-800 border border-gray-700 text-white rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <label className="text-gray-300 font-medium text-xs sm:text-sm">Range:</label>
          <select
            value={range}
            onChange={(e) => { setRange(e.target.value); setDataCache({}); }}
            className="mt-1 sm:mt-0 w-full sm:w-auto bg-gray-800 border border-gray-700 text-white rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="3m">Last 3 months</option>
          </select>
        </div>

        <button
          onClick={() => {
            if (filtered.length === 0) return alert("No data to export");
            downloadCSV(`${selectedDevice || "data"}_${range}.csv`, filtered.map(r => ({
              timestamp: r.timestamp, temperature: r.temp, humidity: r.hum
            })));
          }}
          className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-2 px-4 rounded-lg shadow-md text-xs sm:text-sm w-full sm:w-auto"
        >
          Export CSV
        </button>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-3 sm:p-4 rounded-2xl shadow border border-gray-700">
        <ResponsiveContainer width="100%" height={240} minHeight={240}>
          <LineChart data={filtered.map((d, i) => ({ ...d, idx: i }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="idx" tick={{ fill: "#9CA3AF", fontSize: 10 }}>
              <Label value="Time" position="insideBottom" fill="#9CA3AF" offset={-5} />
            </XAxis>
            <YAxis yAxisId="left" tick={{ fill: "#9CA3AF", fontSize: 10 }} domain={['auto', 'auto']}>
              <Label value="Temperature (°C)" angle={-90} position="insideLeft" fill="#9CA3AF" style={{ textAnchor: "middle", fontSize: 10 }} />
            </YAxis>
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#9CA3AF", fontSize: 10 }} domain={['auto', 'auto']}>
              <Label value="Humidity (%)" angle={90} position="insideRight" fill="#9CA3AF" style={{ textAnchor: "middle", fontSize: 10 }} />
            </YAxis>
            <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none", fontSize: 12 }} labelStyle={{ color: "#E5E7EB" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#3B82F6" dot={false} strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="hum" name="Humidity (%)" stroke="#10B981" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

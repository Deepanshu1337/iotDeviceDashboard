import React, { useEffect, useState, useRef } from "react";
import { fetchDeviceList } from "../services/api";
import useInterval from "../hooks/useInterval";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { Thermometer, Droplets } from "lucide-react";

// Random reading generator
function createRandomReading(prev) {
  const t =
    typeof prev?.temp === "number"
      ? prev.temp + (Math.random() * 2 - 1)
      : 20 + Math.random() * 10;
  const h =
    typeof prev?.hum === "number"
      ? prev.hum + (Math.random() * 4 - 2)
      : 45 + Math.random() * 15;
  return {
    temp: Math.round((t + Number.EPSILON) * 100) / 100,
    hum: Math.round((h + Number.EPSILON) * 100) / 100,
    ts: new Date().toISOString(),
  };
}

// Initial history
function generateInitialHistory(points = 20) {
  let history = [];
  let prev = null;
  for (let i = 0; i < points; i++) {
    const r = createRandomReading(prev);
    history.push(r);
    prev = r;
  }
  return history;
}

export default function LiveMonitor() {
  const { thresholds } = useAuth();
  const [devices, setDevices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 8;
  const devicesRef = useRef({});
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    (async function load() {
      const list = await fetchDeviceList();
      const enriched = list.map((d) => {
        const initialHistory = generateInitialHistory(20);
        return {
          ...d,
          status: true,
          reading: initialHistory[initialHistory.length - 1],
          history: initialHistory,
        };
      });
      setDevices(enriched);
      enriched.forEach((d) => (devicesRef.current[d.id] = d));
      if (enriched[0]) setSelectedDeviceId(enriched[0].id);
    })();
  }, []);

  // Update readings every 5s
  useInterval(() => {
    setDevices((prev) =>
      prev.map((dev) => {
        const newReading = createRandomReading(dev.reading);
        const history = [...dev.history, newReading].slice(-100);
        const updated = { ...dev, reading: newReading, history };
        devicesRef.current[dev.id] = updated;
        return updated;
      })
    );
  }, 5000);

  const toggleDevice = (id) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: !d.status } : d))
    );
  };

  const isAlert = (dev) => {
    const deviceThresh = thresholds.perDevice?.[dev.id];
    const t = deviceThresh?.tempMin ?? thresholds.global.tempMin;
    const T = deviceThresh?.tempMax ?? thresholds.global.tempMax;
    const h = deviceThresh?.humMin ?? thresholds.global.humMin;
    const H = deviceThresh?.humMax ?? thresholds.global.humMax;
    const r = dev.reading;
    if (!r) return false;
    return r.temp < t || r.temp > T || r.hum < h || r.hum > H;
  };

  const selectedDev = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const filteredDevices = devices.filter((dev) =>
    dev.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 sm:p-6 text-gray-100 min-h-screen bg-gray-900">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          <label className="text-gray-300 font-medium text-xs sm:text-sm">
            Device:
          </label>
          <select
            value={selectedDeviceId || ""}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto"
          >
            {devices.map((d) => (
              <option value={d.id} key={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs sm:text-sm text-gray-400 sm:ml-auto mt-2 sm:mt-0">
          ⏱ Update frequency:{" "}
          <span className="font-medium text-blue-400">5s</span> ·{" "}
          <span className="font-medium">{devices.length}</span> devices
        </div>
      </div>

      {/* Live Graph */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">
          Live Graph — {selectedDev?.name || "—"}
        </h3>
        <div className="h-64 sm:h-72 w-full bg-gray-800 p-3 sm:p-4 rounded-2xl shadow border border-gray-700">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={(selectedDev?.history || []).map((h, i) => ({ ...h, idx: i }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="idx" tick={{ fill: "#9CA3AF", fontSize: 10 }}>
                <Label
                  value="Time (points)"
                  offset={0}
                  position="insideBottom"
                  fill="#9CA3AF"
                  textAnchor="middle"
                />
              </XAxis>
              <YAxis
                yAxisId="left"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                domain={["auto", "auto"]}
              >
                <Label
                  value="Temperature (°C)"
                  angle={-90}
                  position="insideLeft"
                  fill="#9CA3AF"
                  style={{ textAnchor: "middle", fontSize: 12 }}
                />
              </YAxis>
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                domain={["auto", "auto"]}
              >
                <Label
                  value="Humidity (%)"
                  angle={90}
                  position="insideRight"
                  fill="#9CA3AF"
                  style={{ textAnchor: "middle", fontSize: 12 }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none", fontSize: 12 }}
                labelStyle={{ color: "#E5E7EB" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                name="Temperature (°C)"
                stroke="#3B82F6"
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hum"
                name="Humidity (%)"
                stroke="#10B981"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search devices..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-1/2 px-2 sm:px-3 py-1 sm:py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Device Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedDevices.length > 0 ? (
          paginatedDevices.map((dev) => (
            <div
              key={dev.id}
              className="bg-gray-800 p-3 sm:p-4 rounded-2xl shadow hover:shadow-lg transition-all border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-100">
                    {dev.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">{dev.id}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${
                      isAlert(dev) ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"
                    }`}
                  >
                    {isAlert(dev) ? "ALERT" : "OK"}
                  </div>
                  <button
                    onClick={() => toggleDevice(dev.id)}
                    className={`relative inline-flex h-5 sm:h-6 w-10 sm:w-11 items-center mt-2 sm:mt-3 rounded-full transition-colors ${
                      dev.status ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        dev.status ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 space-y-1">
                <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
                  <Thermometer size={16} />
                  <span>
                    Temp: <strong className="text-blue-400">{dev.reading?.temp ?? "-"}</strong> °C
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
                  <Droplets size={16} />
                  <span>
                    Hum: <strong className="text-green-400">{dev.reading?.hum ?? "-"}</strong> %
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                  Last update: {dev.reading?.ts ? new Date(dev.reading.ts).toLocaleTimeString() : "-"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 sm:py-20 bg-gray-800 rounded-2xl border border-gray-700 text-gray-400 text-sm sm:text-base">
            No devices found, please adjust the search query.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4 sm:mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 sm:px-3 py-1 rounded bg-gray-700 text-white text-xs sm:text-sm disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3 py-1 rounded bg-gray-700 text-white text-xs sm:text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDeviceList } from "../services/api";
import { toast } from "react-toastify";

export default function ThresholdSettings() {
  const { thresholds, updateGlobalThresholds, setDeviceThreshold } = useAuth();
  const [devices, setDevices] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, type: "global", deviceId: null });
  const [form, setForm] = useState({ tempMin: 0, tempMax: 0, humMin: 0, humMax: 0 });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    (async function load() {
      const list = await fetchDeviceList();
      setDevices(list);
    })();
  }, []);

  const openEdit = (type, deviceId = null) => {
    let values;
    if (type === "global") values = { ...thresholds.global };
    else values = { ...(thresholds.perDevice[deviceId] ?? thresholds.global) };
    setForm(values);
    setEditModal({ open: true, type, deviceId });
  };

  const saveChanges = () => {
    const payload = {
      tempMin: Number(form.tempMin),
      tempMax: Number(form.tempMax),
      humMin: Number(form.humMin),
      humMax: Number(form.humMax),
    };

    // Validation
    if (payload.tempMin >= payload.tempMax) {
      toast.error("Temperature Min must be less than Max!");
      return;
    }
    if (payload.humMin >= payload.humMax) {
      toast.error("Humidity Min must be less than Max!");
      return;
    }

    if (editModal.type === "global") updateGlobalThresholds(payload);
    else setDeviceThreshold(editModal.deviceId, payload);

    setEditModal({ open: false, type: "global", deviceId: null });
    toast.success("Thresholds saved!");
  };

  // Filtered and paginated devices
  const filteredDevices = devices.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-200">
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Threshold Settings</h2>

      {/* Global Card */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 shadow-xl mb-8 border border-blue-500/30">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <span className="text-3xl">🌐</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Global Thresholds</h3>
              <p className="text-blue-100 text-sm">Default values for all devices</p>
            </div>
          </div>
          <button
            onClick={() => openEdit("global")}
            className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-lg font-semibold transition shadow-md"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Temperature Min</p>
            <p className="text-white text-2xl font-bold">{thresholds.global.tempMin}°C</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Temperature Max</p>
            <p className="text-white text-2xl font-bold">{thresholds.global.tempMax}°C</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Humidity Min</p>
            <p className="text-white text-2xl font-bold">{thresholds.global.humMin}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Humidity Max</p>
            <p className="text-white text-2xl font-bold">{thresholds.global.humMax}%</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search devices..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/3 p-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Per-Device Cards */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-300">Device-Specific Thresholds</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedDevices.length > 0 ? (
            paginatedDevices.map((d) => {
              const per = thresholds.perDevice[d.id] ?? thresholds.global;
              return (
                <div
                  key={d.id}
                  className="bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white">{d.name}</h4>
                    <button
                      onClick={() => openEdit("device", d.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Temp Min</span>
                      <span className="text-white font-semibold">{per.tempMin}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Temp Max</span>
                      <span className="text-white font-semibold">{per.tempMax}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Hum Min</span>
                      <span className="text-white font-semibold">{per.humMin}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Hum Max</span>
                      <span className="text-white font-semibold">{per.humMax}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-800 rounded-xl border border-gray-700 text-gray-400">
              No devices found.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-white">
              {editModal.type === "global" ? "Edit Global Thresholds" : "Edit Device Thresholds"}
            </h3>

            <div className="space-y-3">
              <label className="block">
                <span className="text-gray-400 text-sm">Temperature Min (°C)</span>
                <input
                  type="number"
                  value={form.tempMin}
                  onChange={(e) => setForm({ ...form, tempMin: e.target.value })}
                  className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-gray-400 text-sm">Temperature Max (°C)</span>
                <input
                  type="number"
                  value={form.tempMax}
                  onChange={(e) => setForm({ ...form, tempMax: e.target.value })}
                  className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-gray-400 text-sm">Humidity Min (%)</span>
                <input
                  type="number"
                  value={form.humMin}
                  onChange={(e) => setForm({ ...form, humMin: e.target.value })}
                  className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-gray-400 text-sm">Humidity Max (%)</span>
                <input
                  type="number"
                  value={form.humMax}
                  onChange={(e) => setForm({ ...form, humMax: e.target.value })}
                  className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setEditModal({ open: false, type: "global", deviceId: null })}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";
import LiveMonitor from "./pages/LiveMonitor";
import ThresholdSettings from "./pages/ThresholdSettings";
import HistoricalData from "./pages/HistoricalData";
import ProtectedRoute from "./routes/ProtectedRoutes";
import NotFound from "./pages/NotFound";
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      {/* Toaster for toast notifications */}
      <ToastContainer />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<LiveMonitor />} />
          <Route path="thresholds" element={<ThresholdSettings />} />
          <Route path="history" element={<HistoricalData />} />
        </Route>
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

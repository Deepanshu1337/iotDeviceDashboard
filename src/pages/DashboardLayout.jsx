import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, ThermometerSun, History, Sliders } from "lucide-react";

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function doLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-200">
      <header className="flex justify-between items-center bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-blue-400 tracking-tight">
            IoT Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Welcome{" "}
            <span className="font-medium text-blue-300">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-900/40 text-blue-400"
                      : "text-gray-400 hover:text-blue-300 hover:bg-gray-700/40"
                  }`
                }
              >
                <ThermometerSun size={18} />
                Live Monitor
              </NavLink>

              <NavLink
                to="/thresholds"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-900/40 text-blue-400"
                      : "text-gray-400 hover:text-blue-300 hover:bg-gray-700/40"
                  }`
                }
              >
                <Sliders size={18} />
                Thresholds
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-900/40 text-blue-400"
                      : "text-gray-400 hover:text-blue-300 hover:bg-gray-700/40"
                  }`
                }
              >
                <History size={18} />
                Historical
              </NavLink>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-900/40 text-blue-400"
                      : "text-gray-400 hover:text-blue-300 hover:bg-gray-700/40"
                  }`
                }
              >
                <ThermometerSun size={20} />
              </NavLink>

              <NavLink
                to="/thresholds"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-900/40 text-blue-400"
                      : "text-gray-400 hover:text-blue-300 hover:bg-gray-700/40"
                  }`
                }
              >
                <Sliders size={20} />
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-900/40 text-blue-400"
                      : "text-gray-400 hover:text-blue-300 hover:bg-gray-700/40"
                  }`
                }
              >
                <History size={20} />
              </NavLink>
            </div>
          </nav>

          <button
            onClick={doLogout}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 active:scale-95 transition-all"
          >
            <LogOut size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const AUTH_KEY = "iot_demo_auth";
const THRESHOLDS_KEY = "iot_demo_thresholds";

export function AuthProvider({ children }) {
  // User state from sessionStorage
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Thresholds state from localStorage
  const [thresholds, setThresholds] = useState(() => {
    try {
      const raw = localStorage.getItem(THRESHOLDS_KEY);
      return raw
        ? JSON.parse(raw)
        : {
            global: { tempMin: 0, tempMax: 50, humMin: 0, humMax: 100 },
            perDevice: {},
          };
    } catch {
      return {
        global: { tempMin: 0, tempMax: 50, humMin: 0, humMax: 100 },
        perDevice: {},
      };
    }
  });

  // Save thresholds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
  }, [thresholds]);

  // Login function
  const login = (email, password) => {
    if (email === "admin@example.com" && password === "password123") {
      const userObj = { email, token: "demo-token" };
      setUser(userObj);
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
      return { ok: true };
    }
    return { ok: false, error: "Invalid credentials" };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(AUTH_KEY);
  };

  // Update global thresholds
  const updateGlobalThresholds = (global) => {
    setThresholds((prev) => ({ ...prev, global }));
  };

  // Set per-device thresholds
  const setDeviceThreshold = (deviceId, t) => {
    setThresholds((prev) => ({
      ...prev,
      perDevice: { ...prev.perDevice, [deviceId]: t },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        thresholds,
        updateGlobalThresholds,
        setDeviceThreshold,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

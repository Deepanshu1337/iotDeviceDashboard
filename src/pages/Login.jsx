import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Load saved session email if any
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  function validate() {
    if (!email || !password) {
      setError("Email and password are required.");
      return false;
    }
    const ok = /\S+@\S+\.\S+/.test(email);
    if (!ok) {
      setError("Please enter a valid email.");
      return false;
    }
    setError("");
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const res = login(email.trim(), password);

    if (res.ok) {
      // Save email in sessionStorage
      sessionStorage.setItem("email", email.trim());
      // You could also save a token if returned: sessionStorage.setItem("token", res.token);
      navigate("/");
    } else {
      setError(res.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
          IoT Dashboard Login
        </h2>

        {error && (
          <div className="bg-red-900 text-red-300 px-3 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-gray-100 font-semibold py-2 rounded-lg transition"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("password123");
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 rounded-lg transition"
            >
              Fill Demo
            </button>
          </div>
        </form>

        <p className="mt-6 text-gray-400 text-sm text-center">
          Demo credentials: <br />
          <strong>admin@example.com</strong> / <strong>password123</strong>
        </p>
      </div>
    </div>
  );
}

// src/pages/public/TestSiswaLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../_api";

export default function TestSiswaLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    kelas_id: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenCheck, setTokenCheck] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    // Clear tokens on mount
    addLog("🧪 TEST LOGIN: Clearing tokens...");
    localStorage.clear();
    
    // Check token every 500ms
    const interval = setInterval(() => {
      const siswaToken = localStorage.getItem("siswa_token");
      const regularToken = localStorage.getItem("token");
      setTokenCheck({
        siswa_token: siswaToken ? `YES (${siswaToken.substring(0, 20)}...)` : "NULL",
        token: regularToken ? `YES (${regularToken.substring(0, 20)}...)` : "NULL",
        timestamp: new Date().toLocaleTimeString()
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setLogs([]);

    try {
      addLog("🔐 Step 1: Clearing old tokens...");
      localStorage.clear();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      addLog("✅ Tokens cleared");

      addLog("📤 Step 2: Sending login request...");
      const { data } = await api.post("/siswa/login", {
        nama: form.nama,
        kelas_id: Number(form.kelas_id),
        password: form.password
      });

      addLog("📥 Step 3: Login response received");
      addLog(`   - Token: ${data.access_token ? "EXISTS" : "NULL"}`);
      addLog(`   - User: ${data.user ? "EXISTS" : "NULL"}`);
      
      if (!data.access_token) {
        throw new Error("No token in response!");
      }

      addLog("💾 Step 4: Saving token to localStorage...");
      localStorage.setItem("siswa_token", data.access_token);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const saved = localStorage.getItem("siswa_token");
      addLog(`🔍 Step 5: Verify token - ${saved ? "EXISTS" : "NULL"}`);
      
      if (!saved) {
        throw new Error("Token not saved!");
      }

      if (data.user) {
        const userWithRole = { ...data.user, userType: 'siswa' };
        localStorage.setItem("siswa_userInfo", JSON.stringify(userWithRole));
        addLog("💾 User info saved");
      }

      addLog("🧪 Step 6: Testing API call...");
      const meResponse = await api.get("/siswa/me");
      addLog(`✅ API call successful: ${meResponse.data.nama || meResponse.data.name}`);

      addLog("🎉 ALL TESTS PASSED!");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("✅ Login berhasil! Navigating to dashboard...");
      navigate("/siswa/dashboard");
      
    } catch (err) {
      addLog(`❌ ERROR: ${err?.response?.data?.message || err.message}`);
      setError(err?.response?.data?.message || err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">🧪 Test Siswa Login</h1>
            
            {/* Token Status */}
            <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
              <strong>Token Status:</strong>
              <pre className="mt-2 text-xs overflow-x-auto">
                {JSON.stringify(tokenCheck, null, 2)}
              </pre>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Nama siswa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kelas ID</label>
                <input
                  type="number"
                  value={form.kelas_id}
                  onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="1, 2, 3, dst"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded text-white ${
                  loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Testing..." : "Test Login"}
              </button>
            </form>
          </div>

          {/* Logs */}
          <div className="bg-gray-900 text-green-400 rounded-lg shadow p-6 font-mono text-xs overflow-y-auto max-h-96">
            <div className="flex items-center justify-between mb-4">
              <strong className="text-white">Console Logs:</strong>
              <button
                onClick={() => setLogs([])}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Clear
              </button>
            </div>
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-white rounded-lg shadow p-6 text-sm text-gray-600">
          <p><strong>Test Steps:</strong></p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Token akan di-clear saat page load</li>
            <li>Login dengan credentials yang valid</li>
            <li>System akan check apakah token tersimpan</li>
            <li>Test API call /siswa/me untuk verify token works</li>
            <li>Jika semua berhasil, redirect ke dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
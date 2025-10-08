// src/pages/guru/GuruLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../_services/auth";

export default function GuruLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email: form.email, password: form.password });
      const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
      const userObj = res.user ?? res.userInfo ?? (raw ? JSON.parse(raw) : null);

      if (userObj?.role === "guru") {
        navigate("/guru");
      } else if (userObj?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message ?? "";
      if (status === 401 || /invalid|credential|password|email|salah/i.test(serverMsg)) {
        setError("email atau password salah");
      } else {
        setError(serverMsg || "Login gagal");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Login Guru</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>

          {error   && <div className="text-red-600 text-sm"> {error} </div>}
 
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className={`flex-1 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
            <button type="button" onClick={() => setForm({ email: "", password: "" })} className="py-2 px-4 border rounded">Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}

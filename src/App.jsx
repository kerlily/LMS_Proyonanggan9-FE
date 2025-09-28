import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import StudentLogin from "./pages/public/studentLogin";
import StudentDashboard from "./pages/public/studentDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-lg font-semibold text-blue-600">LMS SD</Link>
            <nav>
              <Link to="/siswa/login" className="text-sm text-gray-700 hover:text-blue-600">Login Siswa</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="bg-white p-6 rounded shadow">
                  <h1 className="text-2xl font-semibold mb-2">Selamat datang di LMS</h1>
                  <p className="text-sm text-gray-600">
                    Klik <Link to="/siswa/login" className="text-blue-600">di sini</Link> untuk login siswa.
                  </p>

                  <h1 className="text-2xl font-semibold mb-2">Selamat datang di LMS</h1>
                  <p className="text-sm text-gray-600">
                    Klik <Link to="/siswa/login" className="text-blue-600">di sini</Link> untuk login siswa.
                  </p>
                </div>
                
              }
            />

            <Route path="/siswa/login" element={<StudentLogin />} />

            <Route
              path="/siswa/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* TODO: tambahkan route admin/guru nanti */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// src/context/AuthProvider.jsx
import React, { useState, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";

// gunakan service yang ada di repo Project-Akhir
// pastikan file ini ada: src/_services/auth.js (admin/guru)
// dan src/_services/siswa.js (siswa). Ubah path jika beda.
import * as AdminAuthService from "../_services/auth"; // expects login(), logout()
import * as SiswaService from "../_services/siswa"; // expects loginSiswa(), logoutSiswa()

/**
 * AuthProvider
 * - default export (komponen saja)
 * - menyimpan token & user ke localStorage.token & localStorage.userInfo
 * - exposes: user, token, loading, login (admin), loginSiswa, logout, setUser, setToken
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || localStorage.getItem("access_token") || null;
  });
  const [loading, setLoading] = useState(false);

  // keep localStorage in sync
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      // also keep access_token for compatibility
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("userInfo", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.warn("AuthProvider: gagal menyimpan user ke localStorage", e);
      }
    } else {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("user");
    }
  }, [user]);

  // Admin/Guru login wrapper (uses existing service if available)
  const login = useCallback(async (payload) => {
    setLoading(true);
    try {
      if (AdminAuthService && typeof AdminAuthService.login === "function") {
        const res = await AdminAuthService.login(payload);
        // AdminAuthService.login expected to set localStorage itself in many repos,
        // but to be safe, sync state from response:
        const tokenResp = res?.access_token ?? res?.token ?? null;
        const userResp = res?.user ?? res?.userInfo ?? null;
        if (tokenResp) setToken(tokenResp);
        if (userResp) setUser(userResp);
        return res;
      } else {
        throw new Error("Admin auth service not found (src/_services/auth.js)");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Siswa login wrapper
  const loginSiswa = useCallback(async (payload) => {
    setLoading(true);
    try {
      if (SiswaService && typeof SiswaService.loginSiswa === "function") {
        const res = await SiswaService.loginSiswa(payload);
        const tokenResp = res?.access_token ?? res?.token ?? null;
        const userResp = res?.user ?? res?.userInfo ?? null;
        if (tokenResp) setToken(tokenResp);
        if (userResp) setUser(userResp);
        return res;
      } else {
        throw new Error("Siswa auth service not found (src/_services/siswa.js)");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout wrapper: try both services when possible, but always clear client state
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // try siswa logout first
      try {
        if (SiswaService && typeof SiswaService.logoutSiswa === "function") {
          await SiswaService.logoutSiswa();
        }
      } catch (e) {
        // ignore
        console.log("logout: SiswaService.logoutSiswa() error (ignored):", e?.message || e);
      }

      // try admin logout
      try {
        if (AdminAuthService && typeof AdminAuthService.logout === "function") {
          await AdminAuthService.logout();
        }
      } catch (e) {
        // ignore
        console.log("logout: AdminAuthService.logout() error (ignored):", e?.message || e);
      }
    } finally {
      setToken(null);
      setUser(null);
      // cleanup localStorage keys
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("user");
      setLoading(false);
    }
  }, []);

  // helper to hydrate state from localStorage if app reloaded
  useEffect(() => {
    const rawUser = localStorage.getItem("userInfo") || localStorage.getItem("user");
    const rawToken = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!user && rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch {
        // ignore
      }
    }
    if (!token && rawToken) setToken(rawToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = {
    user,
    token,
    loading,
    login,         // use for admin/guru (payload: { email, password })
    loginSiswa,    // use for siswa (payload: { nama, kelas_id, password })
    logout,        // clears storage & tries backend logout
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

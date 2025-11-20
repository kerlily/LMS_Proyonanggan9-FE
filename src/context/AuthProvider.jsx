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
  // indicates initial hydration from localStorage is still running
  const [initializing, setInitializing] = useState(true);

 // keep localStorage in sync
  useEffect(() => {
    // only write when token actually changed to avoid storage churn
    const currentToken = localStorage.getItem("token") || localStorage.getItem("access_token") || null;
    if (token && token !== currentToken) {
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
    } else if (!token && currentToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
    }
  }, [token]);

  useEffect(() => {
    // only write when user actually changed (shallow JSON compare)
    const rawStored = localStorage.getItem("userInfo") || localStorage.getItem("user");
    const stored = rawStored ? (() => { try { return JSON.parse(rawStored); } catch { return null; } })() : null;
    const sameUser =
      (user === null && stored === null) ||
      (user && stored && JSON.stringify(user) === JSON.stringify(stored));

    if (user && !sameUser) {
      try {
        localStorage.setItem("userInfo", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.warn("AuthProvider: gagal menyimpan user ke localStorage", e);
      }
    } else if (!user && stored) {
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
    // Immediately clear client auth state and storage to avoid intermediate
    // states that may cause redirect loops or repeated mounts in other
    // components (which can trigger repeated requests).
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
    localStorage.removeItem("siswa_token");
    localStorage.removeItem("siswa_userInfo");

    setLoading(true);
    try {
      // Fire logout requests but don't rely on them for client state.
      // If they fail, we still consider the client logged out.
      if (SiswaService && typeof SiswaService.logoutSiswa === "function") {
        try {
          // don't await too long; await but ignore errors
          await SiswaService.logoutSiswa();
        } catch (e) {
          console.warn("logout: SiswaService.logoutSiswa() error (ignored):", e?.message || e);
        }
      }

      if (AdminAuthService && typeof AdminAuthService.logout === "function") {
        try {
          await AdminAuthService.logout();
        } catch (e) {
          console.warn("logout: AdminAuthService.logout() error (ignored):", e?.message || e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // helper to hydrate state from localStorage if app reloaded
 useEffect(() => {
  const rawUser = localStorage.getItem("userInfo") || localStorage.getItem("user");
  const rawToken =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("siswa_token") ||
    null;
  if (!user && rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      setUser((prev) => (prev && JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
    } catch {
      // ignore parse error
    }
  }
  if (!token && rawToken) {
    setToken((prev) => (prev === rawToken ? prev : rawToken));
  }
  // mark hydration finished on next microtask
  Promise.resolve().then(() => setInitializing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const contextValue = {
    user,
    token,
    loading,
    initializing,
    login,         // use for admin/guru (payload: { email, password })
    loginSiswa,    // use for siswa (payload: { nama, kelas_id, password })
    logout,        // clears storage & tries backend logout
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

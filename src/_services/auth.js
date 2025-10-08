// src/_services/auth.js
import api from "../_api";

/**
 * login untuk admin/guru
 * body: { email, password }
 * endpoint: POST /auth/login
 * menyimpan token -> localStorage.token serta user -> localStorage.userInfo
 */
export const login = async ({ email, password }) => {
  try {
    const { data } = await api.post("/auth/login", { email, password });

    const token = data.access_token ?? data.token ?? null;
    const user = data.user ?? data.userInfo ?? null;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
    }
    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
    }

    return data;
  } catch (err) {
    console.error("auth.login error:", err);
    throw err;
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout").catch(() => {});
  } catch (e) {
    // ignore
    console.warn("logout error (ignored):", e?.message || e);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
  }
};

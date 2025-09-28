// src/context/AuthContext.js
import { createContext } from "react";

/**
 * Hanya export context (default) supaya ESLint react-refresh/only-export-components aman.
 * Konsumen: import AuthContext from "../context/AuthContext"
 */
const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  login: async () => {},
  loginSiswa: async () => {},
  logout: async () => {},
  setUser: () => {},
  setToken: () => {},
});

export default AuthContext;

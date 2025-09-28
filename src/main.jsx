import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AuthProvider from "./context/AuthProvider"; // default export
import "./index.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthProvider"; // default export
import "./index.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Toaster position="top-right"  />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);

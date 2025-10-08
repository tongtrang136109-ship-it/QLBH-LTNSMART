// index.tsx (ở root repo)
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // ← QUAN TRỌNG: import CSS tại đây

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

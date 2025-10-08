import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root không tồn tại trong index.html");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

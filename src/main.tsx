import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/themes.css";
import "./styles/base.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/components.css";
import "./styles/modal.css";
import "./styles/library.css";
import "./styles/daily.css";
import "./styles/monthly.css";
import "./styles/add-book.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

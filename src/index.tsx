import React from "react";
import ReactDOM from "react-dom/client";
import "nes.css/css/nes.min.css";
import "./style/index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <App />
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
);

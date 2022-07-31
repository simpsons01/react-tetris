import "nes.css/css/nes.min.css";
import "./style/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Single from "./pages/Single";
import Entry from "./pages/Entry";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Double from "./pages/Double";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Entry />} />
        <Route path="single" element={<Single />} />
        <Route path="double" element={<Double />} />
      </Route>
    </Routes>
  </BrowserRouter>
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
);

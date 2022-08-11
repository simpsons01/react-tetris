import "nes.css/css/nes.min.css";
import "./style/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Entry from "./pages/Entry";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Single = React.lazy(() => import("./pages/Single"));
const Double = React.lazy(() => import("./pages/Double"));
const Rooms = React.lazy(() => import("./pages/Rooms"));

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
        <Route path="rooms" element={<Rooms />} />
      </Route>
    </Routes>
  </BrowserRouter>
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
);

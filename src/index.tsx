import "nes.css/css/nes.min.css";
import "./style/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Entry from "./pages/Entry";
import Single from "./pages/Single";
import Rooms from "./pages/Rooms";
import Room from "./pages/Room";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Entry />} />
        <Route path="single" element={<Single />} />
        <Route path="room/:id" element={<Room />} />
        <Route path="rooms" element={<Rooms />} />
      </Route>
    </Routes>
  </BrowserRouter>
  // <React.StrictMode>
  //   <BrowserRouter>
  //     <Routes>
  //       <Route path="/" element={<App />}>
  //         <Route index element={<Entry />} />
  //         <Route path="single" element={<Single />} />
  //         <Route
  //           path="room/:id"
  //           element={
  //             <RequiredName>
  //               <Room />
  //             </RequiredName>
  //           }
  //         />
  //         <Route
  //           path="rooms"
  //           element={
  //             <RequiredName>
  //               <Rooms />
  //             </RequiredName>
  //           }
  //         />
  //       </Route>
  //     </Routes>
  //   </BrowserRouter>
  // </React.StrictMode>
);

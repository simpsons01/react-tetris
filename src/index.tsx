import "./style/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Entry from "./pages/Entry";
import Single from "./pages/Single";
import Rooms from "./pages/Rooms";
import Room from "./pages/Room";
import Error from "./pages/Error";
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import initialLoader from "./router/loader/initial";
import CheckPlayer from "./router/middlewares/CheckPlayer";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" loader={initialLoader} element={<App />} errorElement={<Error />}>
      <Route index element={<Entry />} />
      <Route path="single" element={<Single />} />
      <Route
        path="room/:id"
        element={
          <CheckPlayer>
            <Room />
          </CheckPlayer>
        }
      />
      <Route
        path="rooms"
        element={
          <CheckPlayer>
            <Rooms />
          </CheckPlayer>
        }
      />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <RouterProvider router={router} />
  // <React.StrictMode>
  //   <RouterProvider router={router} />
  // </React.StrictMode>
);

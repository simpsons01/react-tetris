import React from "react";
import Single from "./pages/Single";
import useScreenSize, { ScreenSizeContext } from "./hooks/screenSize";

function App() {
  const { width, height } = useScreenSize();
  return (
    <ScreenSizeContext.Provider value={{ width, height }}>
      <div className="app bg-gray-300 w-screen h-screen">
        <Single />
      </div>
    </ScreenSizeContext.Provider>
  );
}

export default App;

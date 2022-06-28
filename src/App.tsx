import React from "react";
import Single from "./pages/Single";
import useScreenSize, { ScreenSizeContext } from "./hooks/screenSize";

function App() {
  const { width, height } = useScreenSize();
  return (
    <ScreenSizeContext.Provider value={{ width, height }}>
      <div className="app">
        <Single />
      </div>
    </ScreenSizeContext.Provider>
  );
}

export default App;

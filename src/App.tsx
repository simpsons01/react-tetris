import { Outlet } from "react-router-dom";
import styled from "styled-components";
import useScreenSize from "./hooks/screenSize";
import useSocket from "./hooks/socket";
import Overlay from "./components/Overlay";
import http from "./common/http";
import React from "react";
import { SocketContext } from "./context/socket";
import { ScreenSizeContext } from "./context/screen";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  const [isInitial, setInitial] = React.useState(false);
  const { width, height } = useScreenSize();
  const { isConnected, isConnectErrorOccur, socketInstance } = useSocket();

  React.useEffect(() => {
    if (isConnected && !isInitial) {
      http
        .get("/health-check", { timeout: 5000 })
        .then(() => {
          setInitial(true);
        })
        .catch(() => {
          setInitial(true);
          // do something when error occur
        });
    }
  }, [isConnected, isInitial]);

  return (
    <AppContainer>
      {isInitial ? (
        <React.Fragment>
          <SocketContext.Provider
            value={{
              isConnected,
              isConnectErrorOccur,
              socketInstance,
            }}
          >
            <ScreenSizeContext.Provider value={{ width, height }}>
              <Outlet />
            </ScreenSizeContext.Provider>
          </SocketContext.Provider>
          {isConnectErrorOccur || !isConnected ? (
            <Overlay.Container fontSize={32}>
              <Overlay.NormalWithButton>
                <div>CONNECT ERROR</div>
                <button onClick={() => socketInstance.connect()} className="nes-btn">
                  RETRY
                </button>
              </Overlay.NormalWithButton>
            </Overlay.Container>
          ) : null}
        </React.Fragment>
      ) : (
        <Overlay.Container background="#fff" fontSize={32}>
          <Overlay.Normal>INITIAL</Overlay.Normal>
        </Overlay.Container>
      )}
    </AppContainer>
  );
}

export default App;

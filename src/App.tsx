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
  const [isHealthCheckFail, setIsHealthCheckFail] = React.useState(false);
  const [isInitial, setInitial] = React.useState(false);
  const { width, height } = useScreenSize();
  const { isConnected, isConnectErrorOccur, socketInstance } = useSocket();

  React.useEffect(() => {
    http
      .get("/health-check", { timeout: 5000 })
      .then(() => {
        setInitial(true);
      })
      .catch(() => {
        setInitial(true);
        setIsHealthCheckFail(true);
        // do something when error occur
      });
  }, []);

  return (
    <AppContainer>
      {isInitial ? (
        !isHealthCheckFail ? (
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
          </React.Fragment>
        ) : (
          <Overlay.Container background="#fff" color="#292929" fontSize={32}>
            <Overlay.Normal>OOPS! THE PAGE IS NOT WORKING</Overlay.Normal>
          </Overlay.Container>
        )
      ) : null}
    </AppContainer>
  );
}

export default App;

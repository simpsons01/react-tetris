import { Outlet } from "react-router-dom";
import styled from "styled-components";
import useScreenSize, { ScreenSizeContext } from "./hooks/screenSize";
import useSocket, { SocketContext } from "./hooks/socket";
import Overlay from "./components/Overlay";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  const { width, height } = useScreenSize();
  const { isConnected, isConnectErrorOccur, socketInstance } = useSocket();
  return (
    <AppContainer>
      <SocketContext.Provider
        value={{ isConnected, isConnectErrorOccur, socketInstance }}
      >
        <ScreenSizeContext.Provider value={{ width, height }}>
          <Outlet />
        </ScreenSizeContext.Provider>
      </SocketContext.Provider>
      {isConnectErrorOccur ? (
        <Overlay.Container fontSize={32}>
          <Overlay.Error>
            <div>CONNECT ERROR</div>
            <button
              onClick={() => socketInstance.connect()}
              className="nes-btn"
            >
              RECONNECT
            </button>
          </Overlay.Error>
        </Overlay.Container>
      ) : null}
    </AppContainer>
  );
}

export default App;

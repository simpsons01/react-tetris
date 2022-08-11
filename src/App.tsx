import { Outlet } from "react-router-dom";
import styled from "styled-components";
import useScreenSize, { ScreenSizeContext } from "./hooks/screenSize";
import useSocket, { SocketContext } from "./hooks/socket";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  const { width, height } = useScreenSize();
  const { isConnected, isErrorOccur, socketInstance } = useSocket();
  return (
    <AppContainer>
      <SocketContext.Provider
        value={{ isConnected, isErrorOccur, socketInstance }}
      >
        <ScreenSizeContext.Provider value={{ width, height }}>
          <Outlet />
        </ScreenSizeContext.Provider>
      </SocketContext.Provider>
    </AppContainer>
  );
}

export default App;

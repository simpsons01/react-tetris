import { Outlet } from "react-router-dom";
import styled from "styled-components";
import useScreenSize, { ScreenSizeContext } from "./hooks/screenSize";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  const { width, height } = useScreenSize();
  return (
    <AppContainer>
      <ScreenSizeContext.Provider value={{ width, height }}>
        <Outlet />
      </ScreenSizeContext.Provider>
    </AppContainer>
  );
}

export default App;

import { Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import useSizeConfig from "./hooks/size";
import useSocket from "./hooks/socket";
import Overlay from "./components/Overlay";
import http from "./common/http";
import React from "react";
import { SocketContext } from "./context/socket";
import { SizeConfigContext } from "./context/sizeConfig";
import { ScreenSizeContext } from "./context/screen";
import Font from "./components/Font";

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
  const { isConnected, isConnectErrorOccur, socketInstance } = useSocket();
  const { sizeConfig, screenSize } = useSizeConfig();
  const location = useLocation();

  const isScreenSizePlayable = React.useMemo(() => {
    const heightRation = 1;
    const isDoubleGamePlayable =
      sizeConfig.mode.double.playable &&
      sizeConfig.mode.double.playField.height < screenSize.height * heightRation;
    const isSingleGamePlayable =
      sizeConfig.mode.single.playable &&
      sizeConfig.mode.single.playField.height < screenSize.height * heightRation;
    let isPlayable = false;
    if (location.pathname.match(/room\/\d+/)) {
      isPlayable = isDoubleGamePlayable;
    } else if (location.pathname === "single") {
      isPlayable = isSingleGamePlayable;
    } else {
      isPlayable = isDoubleGamePlayable || isSingleGamePlayable;
    }
    return isPlayable;
  }, [sizeConfig, location, screenSize]);

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
      {isInitial &&
        (!isHealthCheckFail ? (
          isScreenSizePlayable ? (
            <React.Fragment>
              <SocketContext.Provider
                value={{
                  isConnected,
                  isConnectErrorOccur,
                  socketInstance,
                }}
              >
                <ScreenSizeContext.Provider value={screenSize}>
                  <SizeConfigContext.Provider value={sizeConfig}>
                    <Outlet />
                  </SizeConfigContext.Provider>
                </ScreenSizeContext.Provider>
              </SocketContext.Provider>
            </React.Fragment>
          ) : (
            <Overlay background="#fff">
              <Font align="center" color="#292929" fontSize={sizeConfig.font.level.one}>
                OOPS! THE SIZE IS NOT SUPPORTED
              </Font>
            </Overlay>
          )
        ) : (
          <Overlay background="#fff" color="#292929">
            <Font align="center" color="#292929" fontSize={sizeConfig.font.level.one}>
              OOPS! THE PAGE IS NOT WORKED
            </Font>
          </Overlay>
        ))}
    </AppContainer>
  );
}

export default App;

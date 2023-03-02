import type { IPlayer } from "./utils/player";
import { Outlet, useLoaderData } from "react-router-dom";
import styled from "styled-components";
import Overlay from "./components/Overlay";
import Font from "./components/Font";
import Modal from "./components/Modal";
import useSetting from "./hooks/setting";
import { SettingContext } from "./context/setting";
import useCustomRef from "./hooks/customRef";
import { useState, useMemo, Fragment, useEffect } from "react";
import { SizeConfigContext } from "./context/sizeConfig";
import { PlayerContext } from "./context/player";
import { SettingModalVisibilityContext } from "./context/settingModalVisibility";
import { parse } from "bowser";
import { getScreenSize, MAX_PLAYABLE_RATIO } from "./utils/size";

const {
  platform: { type: platformType },
} = parse(window.navigator.userAgent);

const isDesktop = platformType === "desktop";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const App = () => {
  const loaderData = useLoaderData() as { player: IPlayer };

  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  const [screenRatio, setScreenRatio] = useState(0);

  const [playerRef, setPlayerRef] = useCustomRef<IPlayer>(loaderData.player);

  const { setting, setSetting, saveSetting } = useSetting();

  const isPlayable = useMemo(() => {
    return isDesktop && screenRatio <= MAX_PLAYABLE_RATIO;
  }, [screenRatio]);

  useEffect(() => {
    const resizeHandler = () => {
      const { height: screenHeight, width: screenWidth } = getScreenSize();
      document.documentElement.style.fontSize = `${(screenHeight / 100) * 1.5}px`;
      setScreenRatio(screenHeight / screenWidth);
    };
    window.addEventListener("resize", resizeHandler);
    resizeHandler();
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <AppContainer>
      <PlayerContext.Provider
        value={{
          playerRef,
          setPlayerRef,
          isPlayerNil: () => !playerRef.current.name || !playerRef.current.id,
        }}
      >
        <SettingModalVisibilityContext.Provider
          value={{
            isOpen: () => isSettingModalOpen,
            open: () => setIsSettingModalOpen(true),
            close: () => setIsSettingModalOpen(false),
          }}
        >
          <SettingContext.Provider
            value={{
              setting,
              setSetting,
              saveSetting,
            }}
          >
            <SizeConfigContext.Provider
              value={{
                playable: isPlayable,
              }}
            >
              <Fragment>
                <Outlet />
                <Modal.Setting isOpen={isSettingModalOpen} />
                {!isPlayable ? (
                  <Overlay background="#fff">
                    <Font align="center" color="#292929" level={"one"}>
                      OOPS! THE SIZE OR DEVICE IS NOT SUPPORTED
                    </Font>
                  </Overlay>
                ) : null}
              </Fragment>
            </SizeConfigContext.Provider>
          </SettingContext.Provider>
        </SettingModalVisibilityContext.Provider>
      </PlayerContext.Provider>
    </AppContainer>
  );
};

export default App;

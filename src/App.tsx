import type { IPlayer } from "./common/player";
import type { AxiosResponse } from "axios";
import styled from "styled-components";
import Overlay from "./components/Overlay";
import Font from "./components/Font";
import Modal from "./components/Modal";
import Loading from "./components/Loading";
import useSetting from "./hooks/setting";
import { SettingContext } from "./context/setting";
import { useState, useMemo, Fragment, useEffect, useReducer, Suspense } from "react";
import { Outlet, useLoaderData, Await, useAsyncValue } from "react-router-dom";
import { SizeConfigContext } from "./context/sizeConfig";
import { PlayerContext } from "./context/player";
import { SettingModalVisibilityContext } from "./context/settingModalVisibility";
import { parse } from "bowser";
import { getScreenSize, MAX_PLAYABLE_RATIO } from "./common/size";
import playerReducer from "./reducer/player";
import { isDev } from "./common/utils";

const {
  platform: { type: platformType },
} = parse(window.navigator.userAgent);

const isDesktop = platformType === "desktop";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Main = () => {
  const response = useAsyncValue() as AxiosResponse<{ player: IPlayer }>;

  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  const [screenRatio, setScreenRatio] = useState(0);

  const [player, playerDispatch] = useReducer(playerReducer, response.data.player);

  const { setting, setSetting, saveSetting } = useSetting();

  const isPlayable = useMemo(() => {
    return isDev() || (isDesktop && screenRatio <= MAX_PLAYABLE_RATIO);
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
    <PlayerContext.Provider
      value={{
        player,
        dispatch: playerDispatch,
        isPlayerNil: () => !player.name || !player.id,
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
  );
};

const App = () => {
  const loaderData = useLoaderData() as { player: Promise<IPlayer> };

  return (
    <Container>
      <Suspense
        fallback={
          <Font level={"one"} >
            <Loading.Dot>BOOTING UP</Loading.Dot>
          </Font>
        }
      >
        <Await
          resolve={loaderData.player}
          errorElement={
            <Font level={"one"}>
              SOMETHING WENT WRONG!
            </Font>
          }
        >
          <Main />
        </Await>
      </Suspense>
    </Container>
  );
};

export default App;

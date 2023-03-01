import { Outlet, useLoaderData } from "react-router-dom";
import styled from "styled-components";
import useSizeConfig from "./hooks/size";
import Overlay from "./components/Overlay";
import { useState, useMemo, Fragment } from "react";
import { SizeConfigContext } from "./context/sizeConfig";
import { PlayerContext } from "./context/player";
import { SettingModalVisibilityContext } from "./context/settingModalVisibility";
import Font from "./components/Font";
import Modal from "./components/Modal";
import useSetting from "./hooks/setting";
import { SettingContext } from "./context/setting";
import { IPlayer } from "./utils/player";
import useCustomRef from "./hooks/customRef";
import { parse } from "bowser";

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

  const [playerRef, setPlayerRef] = useCustomRef<IPlayer>(loaderData.player);

  const { setting, setSetting, saveSetting } = useSetting();

  const { sizeConfig } = useSizeConfig();

  const isPlayable = useMemo(() => {
    const isDoubleGamePlayable = sizeConfig.mode.double.playable;
    const isSingleGamePlayable = sizeConfig.mode.single.playable;

    return isDesktop && isDoubleGamePlayable && isSingleGamePlayable;
  }, [sizeConfig]);

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
            <SizeConfigContext.Provider value={sizeConfig}>
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

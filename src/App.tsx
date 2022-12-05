import { Outlet, useLoaderData, useLocation } from "react-router-dom";
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
import { IPlayer } from "./common/player";
import useCustomRef from "./hooks/customRef";

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

  const { settingRef, saveSetting } = useSetting();

  const { sizeConfig, screenSize } = useSizeConfig();

  const location = useLocation();

  const isScreenSizePlayable = useMemo(() => {
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

  return (
    <AppContainer>
      {isScreenSizePlayable ? (
        <PlayerContext.Provider
          value={{
            playerRef,
            setPlayerRef,
            isPlayerNil: () => !playerRef.current.name || !playerRef.current.id,
          }}
        >
          <SettingModalVisibilityContext.Provider
            value={{
              open: () => setIsSettingModalOpen(true),
              close: () => setIsSettingModalOpen(false),
            }}
          >
            <SettingContext.Provider
              value={{
                settingRef,
                saveSetting,
              }}
            >
              <SizeConfigContext.Provider value={sizeConfig}>
                <Fragment>
                  <Outlet />
                  <Modal.Setting isOpen={isSettingModalOpen} />
                </Fragment>
              </SizeConfigContext.Provider>
            </SettingContext.Provider>
          </SettingModalVisibilityContext.Provider>
        </PlayerContext.Provider>
      ) : (
        <Overlay background="#fff">
          <Font align="center" color="#292929" level={"one"}>
            OOPS! THE SIZE IS NOT SUPPORTED
          </Font>
        </Overlay>
      )}
    </AppContainer>
  );
};

export default App;

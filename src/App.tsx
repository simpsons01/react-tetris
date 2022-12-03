import { Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import useSizeConfig from "./hooks/size";
import Overlay from "./components/Overlay";
import http from "./common/http";
import { useState, useMemo, useEffect, Fragment } from "react";
import { SizeConfigContext } from "./context/sizeConfig";
import { PlayerContext, IPlayer } from "./context/player";
import { SettingModalVisibilityContext } from "./context/settingModalVisibility";
import Font from "./components/Font";
import Modal from "./components/Modal";
import useSetting from "./hooks/setting";
import { SettingContext } from "./context/setting";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const App = () => {
  const [player, setPlayer] = useState<IPlayer>({ name: "", id: "" });

  const { settingRef, saveSetting } = useSetting();

  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

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

  useEffect(() => {}, []);

  return (
    <AppContainer>
      {isScreenSizePlayable ? (
        <PlayerContext.Provider
          value={{
            player: player,
            isNil: () => !player.name || !player.id,
            set: (newPlayer: IPlayer) => setPlayer(newPlayer),
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

import React from "react";
import { setRef } from "../common/utils";

export enum GAME_STATE {
  INITIAL,
  PAUSE,
  GAME_OVER,
  POLYOMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  FILLED_ROW_CLEARING,
  CHECK_EMPTY_ROW_GAP,
  EMPTY_ROW_FILLING,
}

const useGame = function () {
  const [gameState, setGameState] = React.useState<GAME_STATE>(GAME_STATE.INITIAL);
  const prevGameState = React.useRef<GAME_STATE>(GAME_STATE.INITIAL);

  const setPrevGameStateRef = React.useCallback((state: GAME_STATE) => setRef(prevGameState, state), []);

  return {
    gameState,
    prevGameState: prevGameState.current,
    setGameState,
    setPrevGameStateRef,
  };
};

export default useGame;

import React from "react";
import { setRef } from "../common/utils";

export enum GAME_STATE {
  INITIAL,
  PAUSE,
  GAME_OVER,
  POLYOMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  ROW_FILLED_CLEARING,
  ROW_FILLED_CLEARING_GAP,
  EMPTY_ROW_FILLING,
}

const useGame = function () {
  const [gameState, setGameState] = React.useState<GAME_STATE>(GAME_STATE.INITIAL);
  const prevGameState = React.useRef<GAME_STATE>(GAME_STATE.INITIAL);

  const setPrevGameStateRef = React.useCallback((state: GAME_STATE) => setRef(prevGameState, state), []);

  const isPausing = React.useMemo(() => gameState === GAME_STATE.PAUSE, [gameState]);

  return {
    gameState,
    prevGameState: prevGameState.current,
    isPausing,
    setGameState,
    setPrevGameStateRef,
  };
};

export default useGame;

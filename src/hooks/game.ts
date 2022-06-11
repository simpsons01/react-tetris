import React from "react";

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
  return {
    gameState,
    setGameState,
  };
};

export default useGame;

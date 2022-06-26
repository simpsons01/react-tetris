import React from "react";
import Tetris from "../components/Tetris";
import useTetris from "../hooks/tetris";
import { setting } from "../common/config";
import { CUBE_STATE, DIRECTION } from "../common/polyomino";
import { setRef, CountDownTimer, IntervalTimer } from "../common/utils";
import Game from "../components/Game/Index";

export enum GAME_STATE {
  INITIAL,
  PAUSE,
  CHECK_IS_GAME_OVER,
  GAME_OVER,
  POLYOMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  ROW_FILLED_CLEARING,
  CHECK_IS_ROW_EMPTY,
  EMPTY_ROW_FILLING,
}

const {
  tetris: { row, col },
  game: { frequencyPolyominoFalling, leftsecWhenPolyominoCollideBottom },
} = setting;

const countDownTimer = new CountDownTimer(leftsecWhenPolyominoCollideBottom, true);
const intervalTimer = new IntervalTimer(frequencyPolyominoFalling);

const useGame = function () {
  const [gameState, setGameState] = React.useState<GAME_STATE>(GAME_STATE.INITIAL);
  const prevGameState = React.useRef<GAME_STATE>(GAME_STATE.INITIAL);

  const setPrevGameStateRef = React.useCallback((state: GAME_STATE) => setRef(prevGameState, state), []);

  const isPausing = React.useMemo(() => gameState === GAME_STATE.PAUSE, [gameState]);

  const {
    getAnchorNearbyCube,
    polyomino,
    polyominoCoordinate,
    setPolyominoToTetrisData,
    polyominoData,
    tetrisData,
    createPolyomino,
    movePolyomino,
    changePolyominoShape,
    clearRowFilledWithCube,
    getRowFilledWithCube,
    getEmptyRow,
    fillEmptyRow,
    getPolyominoIsCollideWithNearbyCube,
    getCoordinateIsCollide,
    previewPolyomino,
    pauseClearRowAnimation,
    continueClearRowAnimation,
    pauseFillRowAnimation,
    continueFillRowAnimation,
  } = useTetris(col, row);

  const isGameOver = React.useMemo(() => {
    let isGameOver = false;
    if (polyominoCoordinate !== null && getCoordinateIsCollide(polyominoCoordinate)) {
      isGameOver = true;
    }
    return isGameOver;
  }, [polyominoCoordinate, getCoordinateIsCollide]);

  const rowGapInfo = React.useMemo(() => {
    return getEmptyRow();
  }, [getEmptyRow]);

  const filledRow = React.useMemo(() => {
    return getRowFilledWithCube();
  }, [getRowFilledWithCube]);

  const pauseGame = React.useCallback(() => {
    // console.log("pause game!");
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    countDownTimer.pause();
    intervalTimer.pause();
    setPrevGameStateRef(gameState);
    setGameState(GAME_STATE.PAUSE);
  }, [gameState, pauseClearRowAnimation, pauseFillRowAnimation, setGameState, setPrevGameStateRef]);

  const continueGame = React.useCallback(() => {
    // console.log("continue game!");
    continueClearRowAnimation();
    continueFillRowAnimation();
    countDownTimer.continue();
    intervalTimer.continue();
    // console.log("gameState is " + gameState);
    // console.log("prevGameState state is " + prevGameState);
    setGameState(prevGameState.current);
  }, [continueClearRowAnimation, continueFillRowAnimation, prevGameState.current, setGameState]);

  const handlePolyominoCreate = React.useCallback(() => {
    if (polyominoData == null) {
      console.log("create polyomino!");
      createPolyomino();
      setGameState(GAME_STATE.CHECK_IS_GAME_OVER);
    }
  }, [polyominoData, createPolyomino, setGameState]);

  const handleGameOver = React.useCallback(() => {
    alert("game over");
    window.location.reload();
  }, []);

  const handlePolyominoFalling = React.useCallback(() => {
    const { isBottomCollide } = getPolyominoIsCollideWithNearbyCube();
    // console.log("isBottomCollide " + isBottomCollide);
    if (isBottomCollide) {
      intervalTimer.clear();
      countDownTimer.start(() => {
        countDownTimer.clear();
        setPolyominoToTetrisData();
        setGameState(GAME_STATE.CHECK_IS_ROW_FILLED);
      });
    } else {
      countDownTimer.clear();
      intervalTimer.start(() => {
        intervalTimer.clear();
        movePolyomino(DIRECTION.DOWN);
      });
    }
  }, [setGameState, setPolyominoToTetrisData, getPolyominoIsCollideWithNearbyCube, movePolyomino]);

  const handleClearFillRow = React.useCallback(() => {
    clearRowFilledWithCube(filledRow).then(() => {
      setGameState(GAME_STATE.CHECK_IS_ROW_EMPTY);
    });
  }, [clearRowFilledWithCube, filledRow, setGameState]);

  const handleFillEmptyRow = React.useCallback(() => {
    fillEmptyRow(rowGapInfo).then(() => {
      setGameState(GAME_STATE.CHECK_IS_ROW_EMPTY);
    });
  }, [fillEmptyRow, rowGapInfo, setGameState]);

  return {
    tetris: tetrisData,
    polyomino: polyominoData,
    previewPolyomino,
    gameState,
    setGameState,
    prevGameState: prevGameState.current,
    setPrevGameStateRef,
    isPausing,
    isGameOver,
    rowGapInfo,
    filledRow,
    pauseGame,
    continueGame,
    handlePolyominoCreate,
    handleGameOver,
    handlePolyominoFalling,
    handleClearFillRow,
    handleFillEmptyRow,
    movePolyomino,
    changePolyominoShape,
  };
};

export default useGame;

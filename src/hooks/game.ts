import React from "react";
import useTetris from "../hooks/tetris";
import { setting } from "../common/config";
import { DIRECTION, getRandomPolyominoType, POLYOMINO_TYPE } from "../common/polyomino";
import { setRef, CountDownTimer, IntervalTimer } from "../common/utils";

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
  game: { frequencyPolyominoFalling, leftsecWhenPolyominoCollideBottom },
} = setting;

const countDownTimer = new CountDownTimer(leftsecWhenPolyominoCollideBottom, true);
const intervalTimer = new IntervalTimer(frequencyPolyominoFalling);

const useGame = function () {
  const [nextPolyominoType, setNextPolyominoType] = React.useState<POLYOMINO_TYPE>(getRandomPolyominoType());
  const [gameState, setGameState] = React.useState<GAME_STATE>(GAME_STATE.INITIAL);
  const prevGameState = React.useRef<GAME_STATE>(GAME_STATE.INITIAL);
  const [score, setScore] = React.useState<number>(0);
  const setPrevGameStateRef = React.useCallback((state: GAME_STATE) => setRef(prevGameState, state), []);

  const isPausing = React.useMemo(() => gameState === GAME_STATE.PAUSE, [gameState]);

  const {
    polyominoCoordinate,
    setPolyominoToTetrisData,
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
  } = useTetris();

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
  }, [continueClearRowAnimation, continueFillRowAnimation, setGameState]);

  const handlePolyominoCreate = React.useCallback(() => {
    if (polyominoCoordinate == null) {
      console.log("create polyomino!");
      createPolyomino(nextPolyominoType);
      setNextPolyominoType(getRandomPolyominoType());
      setGameState(GAME_STATE.CHECK_IS_GAME_OVER);
    }
  }, [polyominoCoordinate, createPolyomino, setGameState, nextPolyominoType]);

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
    nextPolyominoType,
    polyomino: polyominoCoordinate,
    previewPolyomino,
    score,
    gameState,
    prevGameState: prevGameState.current,
    setGameState,
    setPrevGameStateRef,
    setNextPolyominoType,
    setScore,
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

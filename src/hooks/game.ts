import React from "react";
import useTetris from "../hooks/tetris";
import { setting } from "../common/config";
import { DIRECTION, getRandomPolyominoType, POLYOMINO_TYPE } from "../common/polyomino";
import { setRef, CountDownTimer, IntervalTimer } from "../common/utils";
import useCountdown from "./countdown";

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
  TIME_UP,
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

  const { leftsec, stopCountDown, startCountdown } = useCountdown(60);

  const setPrevGameStateRef = React.useCallback((state: GAME_STATE) => setRef(prevGameState, state), []);

  const isPausing = React.useMemo(() => gameState === GAME_STATE.PAUSE, [gameState]);

  const isGameOver = React.useMemo(() => gameState === GAME_STATE.GAME_OVER, [gameState]);

  const isTimeUp = React.useMemo(() => gameState === GAME_STATE.TIME_UP, [gameState]);

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
    getCoordinateIsCollideWithTetris,
    previewPolyomino,
    pauseClearRowAnimation,
    continueClearRowAnimation,
    pauseFillRowAnimation,
    continueFillRowAnimation,
  } = useTetris();

  const checkIsPolyominoCollideWithTetris = React.useCallback(() => {
    let isCollide = false;
    if (polyominoCoordinate !== null && getCoordinateIsCollideWithTetris(polyominoCoordinate)) {
      isCollide = true;
    }
    return isCollide;
  }, [polyominoCoordinate, getCoordinateIsCollideWithTetris]);

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
    stopCountDown();
  }, [gameState, pauseClearRowAnimation, pauseFillRowAnimation, setPrevGameStateRef, stopCountDown]);

  const continueGame = React.useCallback(() => {
    // console.log("continue game!");
    continueClearRowAnimation();
    continueFillRowAnimation();
    countDownTimer.continue();
    intervalTimer.continue();
    // console.log("gameState is " + gameState);
    // console.log("prevGameState state is " + prevGameState);
    startCountdown();
  }, [continueClearRowAnimation, continueFillRowAnimation, startCountdown]);

  const handlePolyominoCreate = React.useCallback(() => {
    if (polyominoCoordinate == null) {
      console.log("create polyomino!");
      createPolyomino(nextPolyominoType);
      setNextPolyominoType(getRandomPolyominoType());
    }
  }, [polyominoCoordinate, createPolyomino, nextPolyominoType]);

  const handleGameOver = React.useCallback(() => {
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    countDownTimer.clear();
    intervalTimer.clear();
    stopCountDown();
  }, [pauseClearRowAnimation, pauseFillRowAnimation, stopCountDown]);

  const handlePolyominoFalling = React.useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const { isBottomCollide } = getPolyominoIsCollideWithNearbyCube();
      // console.log("isBottomCollide " + isBottomCollide);
      if (isBottomCollide) {
        intervalTimer.clear();
        countDownTimer.start(() => {
          countDownTimer.clear();
          setPolyominoToTetrisData();
          resolve(isBottomCollide);
        });
      } else {
        countDownTimer.clear();
        intervalTimer.start(() => {
          intervalTimer.clear();
          movePolyomino(DIRECTION.DOWN);
        });
      }
    });
  }, [setPolyominoToTetrisData, getPolyominoIsCollideWithNearbyCube, movePolyomino]);

  const handleClearFillRow = React.useCallback(async (): Promise<void> => {
    await clearRowFilledWithCube(filledRow);
  }, [clearRowFilledWithCube, filledRow]);

  const handleFillEmptyRow = React.useCallback(async (): Promise<void> => {
    await fillEmptyRow(rowGapInfo);
  }, [fillEmptyRow, rowGapInfo]);

  return {
    tetris: tetrisData,
    nextPolyominoType,
    polyomino: polyominoCoordinate,
    previewPolyomino,
    score,
    gameState,
    leftsec,
    prevGameState: prevGameState.current,
    isPausing,
    isTimeUp,
    rowGapInfo,
    isGameOver,
    filledRow,
    startCountdown,
    setGameState,
    setPrevGameStateRef,
    setNextPolyominoType,
    setScore,
    pauseGame,
    continueGame,
    handlePolyominoCreate,
    handleGameOver,
    handlePolyominoFalling,
    handleClearFillRow,
    handleFillEmptyRow,
    movePolyomino,
    changePolyominoShape,
    checkIsPolyominoCollideWithTetris,
  };
};

export default useGame;

import React from "react";
import useTetris from "../hooks/tetris";
import { setting } from "../common/config";
import { DIRECTION, getRandomPolyominoType, POLYOMINO_TYPE } from "../common/polyomino";
import { setRef, CountDownTimer } from "../common/utils";
import useCountdown from "./countdown";

export enum GAME_STATE {
  BEFORE_START,
  START,
  NEXT_CYCLE,
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

const useGame = function () {
  const [nextPolyominoType, setNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(null);

  const [gameState, setGameState] = React.useState<GAME_STATE>(GAME_STATE.BEFORE_START);

  const prevGameState = React.useRef<GAME_STATE>(GAME_STATE.BEFORE_START);

  const { current: polyominoFallingTimer } = React.useRef<CountDownTimer>(
    new CountDownTimer(frequencyPolyominoFalling)
  );

  const { current: polyominoCollideBottomTimer } = React.useRef<CountDownTimer>(
    new CountDownTimer(leftsecWhenPolyominoCollideBottom)
  );

  const [score, setScore] = React.useState<number>(0);

  const { leftsec, stopCountDown, startCountdown } = useCountdown(60);

  const setPrevGameStateRef = React.useCallback((state: GAME_STATE) => setRef(prevGameState, state), []);

  const isGameStart = React.useMemo(() => gameState !== GAME_STATE.BEFORE_START, [gameState]);

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

  const emptyRowGap = React.useMemo(() => {
    return getEmptyRow();
  }, [getEmptyRow]);

  const filledRow = React.useMemo(() => {
    return getRowFilledWithCube();
  }, [getRowFilledWithCube]);

  const pauseGame = React.useCallback(() => {
    // console.log("pause game!");
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    polyominoFallingTimer.pause();
    polyominoCollideBottomTimer.pause();
    setPrevGameStateRef(gameState);
    stopCountDown();
  }, [
    gameState,
    pauseClearRowAnimation,
    pauseFillRowAnimation,
    setPrevGameStateRef,
    stopCountDown,
    polyominoFallingTimer,
    polyominoCollideBottomTimer,
  ]);

  const continueGame = React.useCallback(() => {
    // console.log("continue game!");
    continueClearRowAnimation();
    continueFillRowAnimation();
    polyominoFallingTimer.pause();
    polyominoCollideBottomTimer.pause();
    // console.log("gameState is " + gameState);
    // console.log("prevGameState state is " + prevGameState);
    startCountdown();
  }, [
    continueClearRowAnimation,
    continueFillRowAnimation,
    startCountdown,
    polyominoFallingTimer,
    polyominoCollideBottomTimer,
  ]);

  const handlePolyominoCreate = React.useCallback(() => {
    if (polyominoCoordinate == null && nextPolyominoType !== null) {
      console.log("create polyomino!");
      createPolyomino(nextPolyominoType);
    }
  }, [polyominoCoordinate, createPolyomino, nextPolyominoType]);

  const handleNextPolyominoTypeCreate = React.useCallback(() => {
    setNextPolyominoType(getRandomPolyominoType());
  }, [setNextPolyominoType]);

  const handleGameOver = React.useCallback(() => {
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    polyominoFallingTimer.clear();
    polyominoCollideBottomTimer.clear();
    stopCountDown();
  }, [
    pauseClearRowAnimation,
    pauseFillRowAnimation,
    stopCountDown,
    polyominoFallingTimer,
    polyominoCollideBottomTimer,
  ]);

  const handlePolyominoFalling = React.useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const { isBottomCollide } = getPolyominoIsCollideWithNearbyCube();
      // console.log("isBottomCollide " + isBottomCollide);
      if (isBottomCollide) {
        polyominoFallingTimer.clear();
        polyominoCollideBottomTimer.start(() => {
          polyominoCollideBottomTimer.clear();
          setPolyominoToTetrisData();
          resolve(isBottomCollide);
        });
      } else {
        polyominoCollideBottomTimer.clear();
        polyominoFallingTimer.start(() => {
          polyominoFallingTimer.clear();
          movePolyomino(DIRECTION.DOWN);
        });
      }
    });
  }, [
    setPolyominoToTetrisData,
    getPolyominoIsCollideWithNearbyCube,
    movePolyomino,
    polyominoFallingTimer,
    polyominoCollideBottomTimer,
  ]);

  const handleClearFilledRow = React.useCallback(async (): Promise<void> => {
    await clearRowFilledWithCube(filledRow);
  }, [clearRowFilledWithCube, filledRow]);

  const handleFillEmptyRow = React.useCallback(async (): Promise<void> => {
    await fillEmptyRow(emptyRowGap);
  }, [fillEmptyRow, emptyRowGap]);

  return {
    tetris: tetrisData,
    nextPolyominoType,
    polyomino: polyominoCoordinate,
    previewPolyomino,
    score,
    gameState,
    leftsec,
    prevGameState: prevGameState.current,
    emptyRowGap,
    isGameOver,
    filledRow,
    isPausing,
    isTimeUp,
    isGameStart,
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
    handleNextPolyominoTypeCreate,
    handleClearFilledRow,
    handleFillEmptyRow,
    movePolyomino,
    changePolyominoShape,
    checkIsPolyominoCollideWithTetris,
  };
};

export default useGame;

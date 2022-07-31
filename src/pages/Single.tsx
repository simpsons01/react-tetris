import React from "react";
import {
  DIRECTION,
  getRandomPolyominoType,
  POLYOMINO_TYPE,
  ICube,
} from "../common/polyomino";
import { setRef, CountDownTimer } from "../common/utils";
import Tetris from "../components/Tetris";
import Game from "../components/Game";
import Next from "../components/Next";
import Score from "../components/Score";
import TetrisPanel from "../components/Tetris/Panel";
import CountDown from "../components/CountDown";
import useCountdown from "../hooks/countdown";
import useTetris from "../hooks/tetris";

export enum GAME_STATE {
  BEFORE_START,
  START,
  NEXT_CYCLE,
  PAUSE,
  BEFORE_LEAVE_PAUSE,
  CHECK_IS_GAME_OVER,
  GAME_OVER,
  POLYOMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  ROW_FILLED_CLEARING,
  CHECK_IS_ROW_EMPTY,
  ROW_EMPTY_FILLING,
  TIME_UP,
}

const polyominoFallingTimer = new CountDownTimer(0.5, true);
const polyominoCollideBottomTimer = new CountDownTimer(0.2, true);

const Single = (): JSX.Element => {
  const {
    polyominoCoordinate,
    polyomino,
    tetris,
    setPolyominoToTetris,
    createPolyomino,
    movePolyomino,
    movePolyominoToPreview,
    changePolyominoShape,
    clearRowFilledWithCube,
    getRowFilledWithCube,
    getEmptyRow,
    fillEmptyRow,
    getPolyominoIsCollideWithNearbyCube,
    getCoordinateIsCollideWithTetris,
    pauseClearRowAnimation,
    continueClearRowAnimation,
    pauseFillRowAnimation,
    continueFillRowAnimation,
    getPolyominoPreviewCoordinate,
    resetPolyomino,
    resetTetris,
  } = useTetris();

  const { leftsec, stopCountDown, startCountdown, resetCountDown } =
    useCountdown(60);

  const [nextPolyominoType, setNextPolyominoType] =
    React.useState<POLYOMINO_TYPE | null>(null);

  const [gameState, setGameState] = React.useState<GAME_STATE>(
    GAME_STATE.BEFORE_START
  );

  const [score, setScore] = React.useState<number>(0);

  const prevGameState = React.useRef<GAME_STATE>(GAME_STATE.BEFORE_START);

  const setPrevGameState = React.useCallback(
    (state: GAME_STATE) => setRef(prevGameState, state),
    []
  );

  const isGameStart = React.useMemo(
    () => gameState !== GAME_STATE.BEFORE_START,
    [gameState]
  );

  const isPausing = React.useMemo(
    () =>
      gameState === GAME_STATE.PAUSE ||
      gameState === GAME_STATE.BEFORE_LEAVE_PAUSE,
    [gameState]
  );

  const isGameOver = React.useMemo(
    () => gameState === GAME_STATE.GAME_OVER,
    [gameState]
  );

  const isTimeUp = React.useMemo(
    () => gameState === GAME_STATE.TIME_UP,
    [gameState]
  );

  const previewPolyomino = React.useMemo(() => {
    const previewCoordinate = getPolyominoPreviewCoordinate();
    if (previewCoordinate !== null && polyomino.type !== null) {
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y,
      })) as Array<ICube>;
    }
    return null;
  }, [polyomino, getPolyominoPreviewCoordinate]);

  const checkIsPolyominoCollideWithTetris = React.useCallback(() => {
    let isCollide = false;
    if (
      polyominoCoordinate !== null &&
      getCoordinateIsCollideWithTetris(polyominoCoordinate)
    ) {
      isCollide = true;
    }
    return isCollide;
  }, [polyominoCoordinate, getCoordinateIsCollideWithTetris]);

  const pauseGame = React.useCallback(() => {
    // console.log("pause game!");
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    polyominoFallingTimer.pause();
    polyominoCollideBottomTimer.pause();
    stopCountDown();
  }, [pauseClearRowAnimation, pauseFillRowAnimation, stopCountDown]);

  const continueGame = React.useCallback(() => {
    // console.log("continue game!");
    continueClearRowAnimation();
    continueFillRowAnimation();
    polyominoFallingTimer.pause();
    polyominoCollideBottomTimer.pause();
    // console.log("gameState is " + gameState);
    // console.log("prevGameState state is " + prevGameState);
    startCountdown();
  }, [continueClearRowAnimation, continueFillRowAnimation, startCountdown]);

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
  }, [pauseClearRowAnimation, pauseFillRowAnimation, stopCountDown]);

  const handleNextGame = React.useCallback(() => {
    resetTetris();
    resetPolyomino();
    resetCountDown();
    setScore(0);
    setNextPolyominoType(null);
    setGameState(GAME_STATE.BEFORE_START);
  }, [resetCountDown, resetPolyomino, resetTetris]);

  const handlePolyominoFalling = React.useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const { isBottomCollide } = getPolyominoIsCollideWithNearbyCube();
      // console.log("isBottomCollide " + isBottomCollide);
      if (isBottomCollide) {
        polyominoCollideBottomTimer.start(() => {
          setPolyominoToTetris();
          resolve(isBottomCollide);
        });
      } else {
        polyominoFallingTimer.start(() => {
          movePolyomino(DIRECTION.DOWN);
          resolve(isBottomCollide);
        });
      }
    });
  }, [
    setPolyominoToTetris,
    getPolyominoIsCollideWithNearbyCube,
    movePolyomino,
  ]);

  React.useEffect(
    function handleKeyDown() {
      const isRegisterKeyDownHandler = !isTimeUp && !isGameOver && isGameStart;
      function keydownHandler(e: KeyboardEvent) {
        // console.log("keyCode is " + e.keyCode);
        if (
          !isPausing ||
          gameState === GAME_STATE.ROW_FILLED_CLEARING ||
          gameState === GAME_STATE.ROW_EMPTY_FILLING
        ) {
          if (e.keyCode === 37) {
            movePolyomino(DIRECTION.LEFT);
          } else if (e.keyCode === 39) {
            movePolyomino(DIRECTION.RIGHT);
          } else if (e.keyCode === 40) {
            movePolyomino(DIRECTION.DOWN);
          } else if (e.keyCode === 38) {
            changePolyominoShape();
          } else if (e.keyCode === 32) {
            movePolyominoToPreview();
          }
        }
        if (e.keyCode === 27) {
          if (isPausing) {
            setGameState(GAME_STATE.BEFORE_LEAVE_PAUSE);
          } else {
            setPrevGameState(gameState);
            setGameState(GAME_STATE.PAUSE);
          }
        }
      }
      if (isRegisterKeyDownHandler) {
        window.addEventListener("keydown", keydownHandler);
      }
      return () => {
        if (isRegisterKeyDownHandler) {
          window.removeEventListener("keydown", keydownHandler);
        }
      };
    },
    [
      isPausing,
      isTimeUp,
      isGameOver,
      gameState,
      isGameStart,
      movePolyomino,
      changePolyominoShape,
      continueGame,
      pauseGame,
      setGameState,
      setPrevGameState,
      movePolyominoToPreview,
    ]
  );

  React.useEffect(
    function handleLeftSec() {
      if (leftsec === 0) {
        setGameState(GAME_STATE.TIME_UP);
      }
    },
    [leftsec, setGameState]
  );

  React.useEffect(
    function handleGameStateChange() {
      let effectCleaner = () => {};
      switch (gameState) {
        case GAME_STATE.BEFORE_START:
          if (nextPolyominoType == null) {
            handleNextPolyominoTypeCreate();
          }
          break;
        case GAME_STATE.START:
          startCountdown();
          setGameState(GAME_STATE.NEXT_CYCLE);
          break;
        case GAME_STATE.NEXT_CYCLE:
          handlePolyominoCreate();
          handleNextPolyominoTypeCreate();
          setGameState(GAME_STATE.CHECK_IS_GAME_OVER);
          break;
        case GAME_STATE.PAUSE:
          pauseGame();
          break;
        case GAME_STATE.BEFORE_LEAVE_PAUSE:
          setGameState(prevGameState.current);
          continueGame();
          break;
        case GAME_STATE.CHECK_IS_GAME_OVER:
          if (checkIsPolyominoCollideWithTetris()) {
            setGameState(GAME_STATE.GAME_OVER);
          } else {
            setGameState(GAME_STATE.POLYOMINO_FALLING);
          }
          break;
        case GAME_STATE.GAME_OVER:
          handleGameOver();
          break;
        case GAME_STATE.TIME_UP:
          handleGameOver();
          break;
        case GAME_STATE.POLYOMINO_FALLING:
          handlePolyominoFalling().then((isBottomCollide) => {
            if (isBottomCollide) {
              setGameState(GAME_STATE.CHECK_IS_ROW_FILLED);
            }
          });
          effectCleaner = () => {
            polyominoCollideBottomTimer.clear();
            polyominoFallingTimer.clear();
          };
          break;
        case GAME_STATE.CHECK_IS_ROW_FILLED:
          const filledRow = getRowFilledWithCube();
          if (filledRow) {
            setGameState(GAME_STATE.ROW_FILLED_CLEARING);
            setScore(score + filledRow.length);
            clearRowFilledWithCube(filledRow).then(() => {
              setGameState(GAME_STATE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setGameState(GAME_STATE.NEXT_CYCLE);
          }
          break;
        case GAME_STATE.ROW_FILLED_CLEARING:
          break;
        case GAME_STATE.CHECK_IS_ROW_EMPTY:
          const emptyRowGap = getEmptyRow();
          const isGapNotExist =
            emptyRowGap.length === 0 ||
            (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
          if (!isGapNotExist) {
            //console.log("fill empty row!");
            setGameState(GAME_STATE.ROW_EMPTY_FILLING);
            fillEmptyRow(emptyRowGap).then(() => {
              setGameState(GAME_STATE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setGameState(GAME_STATE.NEXT_CYCLE);
          }
          break;
        case GAME_STATE.ROW_EMPTY_FILLING:
          break;
        default:
          break;
      }
      return effectCleaner;
    },
    [
      gameState,
      score,
      prevGameState,
      nextPolyominoType,
      handlePolyominoCreate,
      handlePolyominoFalling,
      handleGameOver,
      checkIsPolyominoCollideWithTetris,
      setGameState,
      setScore,
      startCountdown,
      handleNextPolyominoTypeCreate,
      continueGame,
      pauseGame,
      getRowFilledWithCube,
      getEmptyRow,
      clearRowFilledWithCube,
      fillEmptyRow,
    ]
  );

  return (
    <Game.Single
      score={(fontSize) => <Score fontSize={fontSize} score={score} />}
      next={(cubeDistance) => (
        <Next cubeDistance={cubeDistance} polyominoType={nextPolyominoType} />
      )}
      countdown={(fontSize) => <CountDown fontSize={fontSize} sec={leftsec} />}
      tetris={(cubeDistance) => (
        <Tetris
          cubeDistance={cubeDistance}
          tetris={tetris}
          polyomino={polyominoCoordinate}
          previewPolyomino={previewPolyomino}
        />
      )}
      gameover={(fontSize) => (
        <TetrisPanel.GameOver
          fontSize={fontSize}
          isGameOver={isGameOver}
          onGameOverBtnClick={handleNextGame}
        />
      )}
      pause={(fontSize) => (
        <TetrisPanel.Pause isPausing={isPausing} fontSize={fontSize} />
      )}
      timeup={(fontSize) => (
        <TetrisPanel.TimeUp
          isTimeUp={isTimeUp}
          fontSize={fontSize}
          onTimesUpBtn={handleNextGame}
        />
      )}
      gamestart={(fontSize) => (
        <TetrisPanel.GameStart
          onGameStart={() => {
            setGameState(GAME_STATE.START);
          }}
          isGameStart={!isGameStart}
          fontSize={fontSize}
        />
      )}
    />
  );
};

export default Single;

import React from "react";
import Tetris from "../../components/Tetris";
import useTetris from "../../hooks/tetris";
import { setting } from "../../common/config";
import { CUBE_STATE, DIRECTION } from "../../common/polyomino";
import { setRef, CountDownTimer, IntervalTimer } from "../../common/utils";
import useGame, { GAME_STATE } from "../../hooks/game";
const {
  tetris: { row, col, backgroundColor, blockDistance },
  game: { frequencyPolyominoFalling, leftsecWhenPolyominoCollideBottom },
} = setting;

const countDownTimer = new CountDownTimer(leftsecWhenPolyominoCollideBottom, true);
const intervalTimer = new IntervalTimer(frequencyPolyominoFalling);

const Single: React.FC = function () {
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

  const { gameState, prevGameState, setGameState, setPrevGameStateRef, isPausing } = useGame();

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
    setGameState(prevGameState);
  }, [continueClearRowAnimation, continueFillRowAnimation, prevGameState, setGameState]);

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

  React.useEffect(
    function handleKeyDown() {
      function keydownHandler(e: KeyboardEvent) {
        // console.log("keyCode is " + e.keyCode);
        if (e.keyCode === 37) {
          movePolyomino(DIRECTION.LEFT);
        } else if (e.keyCode === 39) {
          movePolyomino(DIRECTION.RIGHT);
        } else if (e.keyCode === 40) {
          movePolyomino(DIRECTION.DOWN);
        } else if (e.keyCode === 38) {
          changePolyominoShape();
        } else if (e.keyCode === 32) {
          isPausing ? continueGame() : pauseGame();
        }
      }
      window.addEventListener("keydown", keydownHandler);
      return () => window.removeEventListener("keydown", keydownHandler);
    },
    [movePolyomino, changePolyominoShape, isPausing, continueGame, pauseGame]
  );

  React.useEffect(
    function handleGameChange() {
      switch (gameState) {
        case GAME_STATE.INITIAL:
          handlePolyominoCreate();
          break;
        case GAME_STATE.PAUSE:
          break;
        case GAME_STATE.CHECK_IS_GAME_OVER:
          if (!isGameOver) {
            setGameState(GAME_STATE.POLYOMINO_FALLING);
          } else {
            setGameState(GAME_STATE.GAME_OVER);
          }
          break;
        case GAME_STATE.GAME_OVER:
          handleGameOver();
          break;
        case GAME_STATE.POLYOMINO_FALLING:
          handlePolyominoFalling();
          break;
        case GAME_STATE.CHECK_IS_ROW_FILLED:
          if (filledRow) {
            setGameState(GAME_STATE.ROW_FILLED_CLEARING);
            handleClearFillRow();
          } else {
            setGameState(GAME_STATE.INITIAL);
          }
          break;
        case GAME_STATE.ROW_FILLED_CLEARING:
          break;
        case GAME_STATE.CHECK_IS_ROW_EMPTY:
          const isGapNotExist =
            rowGapInfo.length === 0 || (rowGapInfo.length === 1 && rowGapInfo[0].empty.length === 0);
          if (!isGapNotExist) {
            //console.log("fill empty row!");
            setGameState(GAME_STATE.EMPTY_ROW_FILLING);
            fillEmptyRow(rowGapInfo).then(() => {
              setGameState(GAME_STATE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setGameState(GAME_STATE.INITIAL);
          }
          break;
        case GAME_STATE.EMPTY_ROW_FILLING:
          break;
        default:
          break;
      }
    },
    [
      fillEmptyRow,
      filledRow,
      gameState,
      handleClearFillRow,
      handleFillEmptyRow,
      handlePolyominoCreate,
      handlePolyominoFalling,
      handleGameOver,
      isGameOver,
      rowGapInfo,
      setGameState,
    ]
  );

  return (
    <Tetris
      backgroundColor={backgroundColor}
      blockDistance={blockDistance}
      row={row}
      col={col}
      polyomino={polyominoData}
      previewPolyomino={previewPolyomino}
      data={tetrisData}
    />
  );
};

export default Single;

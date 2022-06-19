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

  const pauseGame = React.useCallback(() => {
    console.log("pause game!");
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    countDownTimer.pause();
    intervalTimer.pause();
    setPrevGameStateRef(gameState);
    setGameState(GAME_STATE.PAUSE);
  }, [pauseClearRowAnimation, pauseFillRowAnimation, setGameState]);

  const continueGame = React.useCallback(() => {
    console.log("continue game!");
    continueClearRowAnimation();
    continueFillRowAnimation();
    countDownTimer.continue();
    intervalTimer.continue();
    console.log("gameState is " + gameState);
    console.log("prevGameState state is " + prevGameState);
    setGameState(prevGameState);
  }, [continueClearRowAnimation, continueFillRowAnimation, prevGameState, setGameState, countDownTimer, intervalTimer]);

  React.useEffect(() => {
    //console.log("--------- next render start! ---------------");
    // tetrisData.forEach((cube) => {
    //   if (cube.state === CUBE_STATE.FILLED) console.log(cube);
    // });
    // console.log(" ---------------next render end ---------------");
    //console.log(getEmptyRow());
  });

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

  // React.useEffect(() => {
  //   if (gameState === GAME_STATE.GAME_OVER) {
  //     alert("game over");
  //     window.location.reload();
  //   }
  // }, [gameState, setGameState]);

  React.useEffect(
    function handlePolyominoCreate() {
      if (gameState === GAME_STATE.INITIAL && polyominoData == null) {
        console.log("create polyomino!");
        createPolyomino();
      }
    },
    [gameState, polyominoData, createPolyomino]
  );

  React.useEffect(
    function handleIsGameOver() {
      if (gameState === GAME_STATE.INITIAL && polyominoCoordinate !== null) {
        if (getCoordinateIsCollide(polyominoCoordinate)) {
          alert("game over");
          window.location.reload();
        } else {
          setGameState(GAME_STATE.POLYOMINO_FALLING);
        }
      }
    },
    [polyominoCoordinate, getCoordinateIsCollide, gameState, setGameState]
  );

  React.useEffect(
    function handlePolyominoFalling() {
      if (gameState === GAME_STATE.POLYOMINO_FALLING) {
        const { isBottomCollide } = getPolyominoIsCollideWithNearbyCube();
        // console.log("isBottomCollide " + isBottomCollide);
        if (isBottomCollide) {
          intervalTimer.clear();
          countDownTimer.start(() => {
            setPolyominoToTetrisData();
            setGameState(GAME_STATE.CHECK_IS_ROW_FILLED);
          });
        } else {
          countDownTimer.clear();
          intervalTimer.start(() => {
            movePolyomino(DIRECTION.DOWN);
          });
        }
      } else {
        intervalTimer.clear();
        countDownTimer.clear();
      }
      return () => {};
    },
    [gameState, setGameState, setPolyominoToTetrisData, getPolyominoIsCollideWithNearbyCube, movePolyomino]
  );

  React.useEffect(
    function handleClearFillRow() {
      if (gameState === GAME_STATE.CHECK_IS_ROW_FILLED) {
        const filledRow = getRowFilledWithCube();
        // console.log("filledRow is ");
        // console.log(filledRow);
        if (filledRow.length > 0) {
          console.log("clear fill row!");
          setGameState(GAME_STATE.ROW_FILLED_CLEARING);
          clearRowFilledWithCube(filledRow).then(() => {
            setGameState(GAME_STATE.ROW_FILLED_CLEARING_GAP);
          });
        } else {
          setGameState(GAME_STATE.INITIAL);
        }
      }
    },
    [tetrisData, clearRowFilledWithCube, getRowFilledWithCube, gameState, setGameState]
  );

  React.useEffect(
    function handleFillEmptyRow() {
      if (gameState === GAME_STATE.ROW_FILLED_CLEARING_GAP) {
        const rowGapInfo = getEmptyRow();
        // console.log("rowGapInfo is ");
        // console.log(rowGapInfo);
        const isGapNotExist = rowGapInfo.length === 0 || (rowGapInfo.length === 1 && rowGapInfo[0].empty.length === 0);
        if (!isGapNotExist) {
          console.log("fill empty row!");
          setGameState(GAME_STATE.EMPTY_ROW_FILLING);
          fillEmptyRow(rowGapInfo).then(() => {
            setGameState(GAME_STATE.ROW_FILLED_CLEARING_GAP);
          });
        } else {
          setGameState(GAME_STATE.INITIAL);
        }
      }
    },
    [tetrisData, fillEmptyRow, getEmptyRow, gameState, setGameState]
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

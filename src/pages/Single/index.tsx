import React from "react";
import Tetris from "../../components/Tetris";
import { DIRECTION } from "../../common/polyomino";
import useGame, { GAME_STATE } from "../../hooks/game";
import Game from "../../components/Game/Index";

const Single: React.FC = function () {
  const {
    tetris,
    polyomino,
    previewPolyomino,
    gameState,
    setGameState,
    isPausing,
    isGameOver,
    movePolyomino,
    changePolyominoShape,
    continueGame,
    pauseGame,
    handlePolyominoCreate,
    handlePolyominoFalling,
    handleGameOver,
    handleClearFillRow,
    handleFillEmptyRow,
    filledRow,
    rowGapInfo,
  } = useGame();

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
            handleFillEmptyRow();
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
    <Game
      single={true}
      tetris={(width, height, cubeDistance) => (
        <Tetris
          width={width}
          height={height}
          cubeDistance={cubeDistance}
          tetris={tetris}
          polyomino={polyomino}
          previewPolyomino={previewPolyomino}
        />
      )}
    />
  );
};

export default Single;

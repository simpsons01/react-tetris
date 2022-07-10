import React from "react";
import { DIRECTION } from "../../common/polyomino";
import useGame, { GAME_STATE } from "../../hooks/game";
import Tetris from "../../components/Tetris";
import Game from "../../components/SingleGame";
import Next from "../../components/Next";
import Score from "../../components/Score";
import Pause from "../../components/Pause";
import CountDown from "../../components/CountDown";
import GameOver from "../../components/GameOver";
import TimeUp from "../../components/TimeUp";

const Single: React.FC = function () {
  const {
    tetris,
    polyomino,
    nextPolyominoType,
    previewPolyomino,
    score,
    gameState,
    leftsec,
    isPausing,
    prevGameState,
    isTimeUp,
    isGameOver,
    filledRow,
    emptyRowGap,
    setGameState,
    setScore,
    checkIsPolyominoCollideWithTetris,
    movePolyomino,
    changePolyominoShape,
    continueGame,
    pauseGame,
    handlePolyominoCreate,
    handlePolyominoFalling,
    handleGameOver,
    handleClearFilledRow,
    handleFillEmptyRow,
    startCountdown,
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
          if (isPausing) {
            setGameState(prevGameState);
            continueGame();
          } else {
            setGameState(GAME_STATE.PAUSE);
            pauseGame();
          }
        }
      }
      window.addEventListener("keydown", keydownHandler);
      return () => window.removeEventListener("keydown", keydownHandler);
    },
    [movePolyomino, changePolyominoShape, isPausing, continueGame, pauseGame, setGameState, prevGameState]
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
    function handleGameChange() {
      switch (gameState) {
        case GAME_STATE.INITIAL:
          startCountdown();
          handlePolyominoCreate();
          setGameState(GAME_STATE.CHECK_IS_GAME_OVER);
          break;
        case GAME_STATE.PAUSE:
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
          break;
        case GAME_STATE.CHECK_IS_ROW_FILLED:
          if (filledRow) {
            setGameState(GAME_STATE.ROW_FILLED_CLEARING);
            setScore(score + filledRow.length);
            handleClearFilledRow().then(() => {
              setGameState(GAME_STATE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setGameState(GAME_STATE.INITIAL);
          }
          break;
        case GAME_STATE.ROW_FILLED_CLEARING:
          break;
        case GAME_STATE.CHECK_IS_ROW_EMPTY:
          const isGapNotExist =
            emptyRowGap.length === 0 || (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
          if (!isGapNotExist) {
            //console.log("fill empty row!");
            setGameState(GAME_STATE.EMPTY_ROW_FILLING);
            handleFillEmptyRow().then(() => {
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
      filledRow,
      gameState,
      emptyRowGap,
      score,
      handleClearFilledRow,
      handleFillEmptyRow,
      handlePolyominoCreate,
      handlePolyominoFalling,
      handleGameOver,
      checkIsPolyominoCollideWithTetris,
      setGameState,
      setScore,
      startCountdown,
    ]
  );

  return (
    <Game
      score={(fontSize) => <Score fontSize={fontSize} score={score} />}
      next={(cubeDistance) => <Next cubeDistance={cubeDistance} polyominoType={nextPolyominoType} />}
      tetris={(cubeDistance) => (
        <Tetris cubeDistance={cubeDistance} tetris={tetris} polyomino={polyomino} previewPolyomino={previewPolyomino} />
      )}
      gameover={(fontSize) => <GameOver fontSize={fontSize} isGameOver={isGameOver} />}
      countdown={(fontSize) => <CountDown fontSize={fontSize} sec={leftsec} />}
      pause={(fontSize) => <Pause isPausing={isPausing} fontSize={fontSize} />}
      timeup={(fontSize) => <TimeUp isTimeUp={isTimeUp} fontSize={fontSize} />}
    />
  );
};

export default Single;

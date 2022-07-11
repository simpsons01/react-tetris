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
import GameStart from "../../components/GameStart";

const Single = (): JSX.Element => {
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
    isGameStart,
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
    handleNextPolyominoTypeCreate,
    handleFillEmptyRow,
    startCountdown,
    setPrevGameState,
  } = useGame();

  React.useEffect(
    function handleKeyDown() {
      const isRegisterKeyDownHandler = !isTimeUp && !isGameOver;
      function keydownHandler(e: KeyboardEvent) {
        // console.log("keyCode is " + e.keyCode);
        if (!isPausing || gameState === GAME_STATE.ROW_FILLED_CLEARING || gameState === GAME_STATE.ROW_EMPTY_FILLING) {
          if (e.keyCode === 37) {
            movePolyomino(DIRECTION.LEFT);
          } else if (e.keyCode === 39) {
            movePolyomino(DIRECTION.RIGHT);
          } else if (e.keyCode === 40) {
            movePolyomino(DIRECTION.DOWN);
          } else if (e.keyCode === 38) {
            changePolyominoShape();
          }
        }
        if (e.keyCode === 32) {
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
      movePolyomino,
      changePolyominoShape,
      isPausing,
      continueGame,
      pauseGame,
      setGameState,
      prevGameState,
      isTimeUp,
      isGameOver,
      gameState,
      setPrevGameState,
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
      switch (gameState) {
        case GAME_STATE.BEFORE_START:
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
          setGameState(prevGameState);
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
          break;
        case GAME_STATE.CHECK_IS_ROW_FILLED:
          if (filledRow) {
            setGameState(GAME_STATE.ROW_FILLED_CLEARING);
            setScore(score + filledRow.length);
            handleClearFilledRow().then(() => {
              setGameState(GAME_STATE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setGameState(GAME_STATE.NEXT_CYCLE);
          }
          break;
        case GAME_STATE.ROW_FILLED_CLEARING:
          break;
        case GAME_STATE.CHECK_IS_ROW_EMPTY:
          const isGapNotExist =
            emptyRowGap.length === 0 || (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
          if (!isGapNotExist) {
            //console.log("fill empty row!");
            setGameState(GAME_STATE.ROW_EMPTY_FILLING);
            handleFillEmptyRow().then(() => {
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
    },
    [
      filledRow,
      gameState,
      emptyRowGap,
      score,
      prevGameState,
      handleClearFilledRow,
      handleFillEmptyRow,
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
      gamestart={(fontSize) => (
        <GameStart
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

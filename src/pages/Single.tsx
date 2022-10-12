import React from "react";
import { setRef } from "../common/utils";
import { createCountDownTimer } from "../common/timer";
import useCountdown from "../hooks/countdown";
import useTetris from "../hooks/tetris";
import styled from "styled-components";
import Widget from "../components/Widget";
import PlayField from "../components/PlayField";
import { ISize } from "../common/utils";
import { useSizeConfigContext } from "../context/sizeConfig";
import {
  DIRECTION,
  getRandomPolyominoType,
  POLYOMINO_TYPE,
  ICube,
  POLYOMINO_ROTATION,
} from "../common/polyomino";

const Wrapper = styled.div<ISize>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  display: flex;
`;

const Column = styled.div<ISize>`
  position: relative;
  flex: ${(props) => `0 0 ${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

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

  const {
    mode: { single: singleSizeConfig },
    font: fontConfig,
  } = useSizeConfigContext();

  const { leftsec, stopCountDown, startCountdown, resetCountDown } = useCountdown(60);

  const { current: polyominoFallingTimer } = React.useRef(createCountDownTimer());

  const { current: polyominoCollideBottomTimer } = React.useRef(createCountDownTimer());

  const [nextPolyominoType, setNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(null);

  const [gameState, setGameState] = React.useState<GAME_STATE>(GAME_STATE.BEFORE_START);

  const [score, setScore] = React.useState<number>(0);

  const prevGameState = React.useRef<GAME_STATE>(GAME_STATE.BEFORE_START);

  const setPrevGameState = React.useCallback((state: GAME_STATE) => setRef(prevGameState, state), []);

  const isGameStart = React.useMemo(() => gameState !== GAME_STATE.BEFORE_START, [gameState]);

  const isPausing = React.useMemo(
    () => gameState === GAME_STATE.PAUSE || gameState === GAME_STATE.BEFORE_LEAVE_PAUSE,
    [gameState]
  );

  const isGameOver = React.useMemo(() => gameState === GAME_STATE.GAME_OVER, [gameState]);

  const isTimeUp = React.useMemo(() => gameState === GAME_STATE.TIME_UP, [gameState]);

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
    if (polyominoCoordinate !== null && getCoordinateIsCollideWithTetris(polyominoCoordinate)) {
      isCollide = true;
    }
    return isCollide;
  }, [polyominoCoordinate, getCoordinateIsCollideWithTetris]);

  const pauseGame = React.useCallback(() => {
    // console.log("pause game!");
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    polyominoFallingTimer.clear();
    polyominoCollideBottomTimer.clear();
    stopCountDown();
  }, [
    polyominoCollideBottomTimer,
    polyominoFallingTimer,
    pauseClearRowAnimation,
    pauseFillRowAnimation,
    stopCountDown,
  ]);

  const continueGame = React.useCallback(() => {
    // console.log("continue game!");
    continueClearRowAnimation();
    continueFillRowAnimation();
    polyominoFallingTimer.clear();
    polyominoCollideBottomTimer.clear();
    // console.log("gameState is " + gameState);
    // console.log("prevGameState state is " + prevGameState);
    startCountdown();
  }, [
    polyominoCollideBottomTimer,
    polyominoFallingTimer,
    continueClearRowAnimation,
    continueFillRowAnimation,
    startCountdown,
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
    polyominoCollideBottomTimer,
    polyominoFallingTimer,
    pauseClearRowAnimation,
    pauseFillRowAnimation,
    stopCountDown,
  ]);

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
        }, 500);
      } else {
        polyominoFallingTimer.start(() => {
          movePolyomino(DIRECTION.DOWN);
          resolve(isBottomCollide);
        }, 500);
      }
    });
  }, [
    getPolyominoIsCollideWithNearbyCube,
    polyominoCollideBottomTimer,
    setPolyominoToTetris,
    polyominoFallingTimer,
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
            changePolyominoShape(POLYOMINO_ROTATION.CLOCK_WISE);
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
            emptyRowGap.length === 0 || (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
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
      polyominoCollideBottomTimer,
      polyominoFallingTimer,
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
    <Wrapper
      width={
        singleSizeConfig.playField.width +
        singleSizeConfig.distanceBetweenPlayFieldAndWidget * 2 +
        singleSizeConfig.widget.displayNumber.width +
        singleSizeConfig.widget.displayNumber.width
      }
      height={singleSizeConfig.playField.height}
    >
      <Column width={singleSizeConfig.widget.displayNumber.width} height={singleSizeConfig.playField.height}>
        <div
          style={{
            marginBottom: `${singleSizeConfig.distanceBetweenWidgetAndWidget}px`,
          }}
        >
          <Widget.DisplayNumber
            fontSize={fontConfig.level.three}
            width={singleSizeConfig.widget.displayNumber.width}
            height={singleSizeConfig.widget.displayNumber.height}
            title={"SCORE"}
            displayValue={score}
          />
        </div>
        <Widget.NextPolyomino
          fontSize={fontConfig.level.three}
          cubeDistance={singleSizeConfig.widget.nextPolyomino.cube}
          polyominoType={nextPolyominoType}
          width={singleSizeConfig.widget.nextPolyomino.width}
          height={singleSizeConfig.widget.nextPolyomino.height}
        />
      </Column>
      <Column
        width={singleSizeConfig.playField.width}
        height={singleSizeConfig.playField.height}
        style={{
          margin: `0 ${singleSizeConfig.distanceBetweenPlayFieldAndWidget}px`,
        }}
      >
        <PlayField.Wrapper
          width={singleSizeConfig.playField.width}
          height={singleSizeConfig.playField.height}
        >
          <PlayField.Renderer
            cubeDistance={singleSizeConfig.playField.cube}
            tetris={tetris}
            polyomino={polyominoCoordinate}
            previewPolyomino={previewPolyomino}
          />
          <PlayField.GameOverPanel isGameOver={isGameOver} onGameOverBtnClick={handleNextGame} />
          <PlayField.PausePanel isPausing={isPausing} />
          <PlayField.TimeUpPanel isTimeUp={isTimeUp} onTimesUpBtn={handleNextGame} />
          <PlayField.GameStartPanel
            onGameStart={() => {
              setGameState(GAME_STATE.START);
            }}
            isGameStart={!isGameStart}
          />
        </PlayField.Wrapper>
      </Column>
      <Column width={singleSizeConfig.widget.displayNumber.width} height={singleSizeConfig.playField.height}>
        <div
          style={{
            marginBottom: `${singleSizeConfig.distanceBetweenWidgetAndWidget}px`,
          }}
        >
          <Widget.DisplayNumber
            fontSize={fontConfig.level.three}
            width={singleSizeConfig.widget.displayNumber.width}
            height={singleSizeConfig.widget.displayNumber.height}
            title={"SEC"}
            displayValue={leftsec}
          />
        </div>
      </Column>
    </Wrapper>
  );
};

export default Single;

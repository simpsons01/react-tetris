import { useState, useEffect, useCallback, useMemo, useRef, FC } from "react";
import { setRef } from "../common/utils";
import { createCountDownTimer } from "../common/timer";
import useTetris from "../hooks/tetris";
import useNextTetriminoBag from "../hooks/nextTetrimino";
import styled from "styled-components";
import Widget from "../components/Widget";
import PlayField from "../components/PlayField";
import { ISize } from "../common/utils";
import { useSizeConfigContext } from "../context/sizeConfig";
import {
  DIRECTION,
  ICube,
  Tetrimino_ROTATION,
  getRandomTetriminoBag,
  getCoordinateByAnchorAndShapeAndType,
  ICoordinate,
  getSizeByCoordinates,
} from "../common/tetrimino";
import {
  DEFAULT_START_LEVEL,
  getLevelByLine,
  getTetriminoFallingDelayByLevel,
  getScoreByLevelAndLine,
} from "../common/tetris";

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
  GAME_OVER,
  TETRIMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  ROW_FILLED_CLEARING,
  CHECK_IS_ROW_EMPTY,
  ROW_EMPTY_FILLING,
}

const tetriminoFallingTimer = createCountDownTimer();

const tetriminoCollideBottomTimer = createCountDownTimer();

const Single: FC = () => {
  const {
    tetriminoCoordinates,
    tetrimino,
    displayTetris,
    displayTetriminoCoordinates,
    setTetriminoToTetris,
    getSpawnTetrimino,
    moveTetrimino,
    moveTetriminoToPreview,
    changeTetriminoShape,
    clearRowFilledWithCube,
    getRowFilledWithCube,
    getEmptyRow,
    fillEmptyRow,
    getTetriminoIsCollideWithNearbyCube,
    getCoordinatesIsCollideWithFilledCube,
    getIsCoordinatesLockOut,
    pauseClearRowAnimation,
    continueClearRowAnimation,
    pauseFillRowAnimation,
    continueFillRowAnimation,
    getTetriminoPreviewCoordinate,
    resetTetrimino,
    resetTetris,
    setTetrimino,
  } = useTetris();

  const { nextTetriminoBag, popNextTetriminoType } = useNextTetriminoBag(getRandomTetriminoBag());

  const {
    mode: { single: singleSizeConfig },
  } = useSizeConfigContext();

  const tetriminoFallingTimerHandler = useRef(() => {});

  const isHardDrop = useRef(false);

  const [gameState, setGameState] = useState<GAME_STATE>(GAME_STATE.BEFORE_START);

  const [line, setLine] = useState<number>(0);

  const [level, setLevel] = useState<number>(DEFAULT_START_LEVEL);

  const [score, setScore] = useState<number>(0);

  const [tetriminoFallingDelay, setTetriminoFallingDelay] = useState(
    getTetriminoFallingDelayByLevel(DEFAULT_START_LEVEL)
  );

  const prevGameState = useRef<GAME_STATE>(GAME_STATE.BEFORE_START);

  const setPrevGameState = useCallback((state: GAME_STATE) => setRef(prevGameState, state), []);

  const isGameStart = useMemo(() => gameState !== GAME_STATE.BEFORE_START, [gameState]);

  const isPausing = useMemo(
    () => gameState === GAME_STATE.PAUSE || gameState === GAME_STATE.BEFORE_LEAVE_PAUSE,
    [gameState]
  );

  const isGameOver = useMemo(() => gameState === GAME_STATE.GAME_OVER, [gameState]);

  const previewTetrimino = useMemo(() => {
    const previewCoordinate = getTetriminoPreviewCoordinate();
    if (previewCoordinate !== null && tetrimino.type !== null) {
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y,
      })) as Array<ICube>;
    }
    return null;
  }, [tetrimino, getTetriminoPreviewCoordinate]);

  const checkIsTetriminoCollideWithTetris = useCallback(() => {
    let isCollide = false;
    if (tetriminoCoordinates !== null && getCoordinatesIsCollideWithFilledCube(tetriminoCoordinates)) {
      isCollide = true;
    }
    return isCollide;
  }, [getCoordinatesIsCollideWithFilledCube, tetriminoCoordinates]);

  const pauseGame = useCallback(() => {
    // console.log("pause game!");
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    tetriminoFallingTimer.clear();
    tetriminoCollideBottomTimer.clear();
  }, [pauseClearRowAnimation, pauseFillRowAnimation]);

  const continueGame = useCallback(() => {
    // console.log("continue game!");
    continueClearRowAnimation();
    continueFillRowAnimation();
    tetriminoFallingTimer.clear();
    tetriminoCollideBottomTimer.clear();
    // console.log("gameState is " + gameState);
    // console.log("prevGameState state is " + prevGameState);
  }, [continueClearRowAnimation, continueFillRowAnimation]);

  const handleTetriminoCreate = useCallback(() => {
    // console.log("create Tetrimino!");
    let isCreatedSuccess = false;
    const nextTetriminoType = popNextTetriminoType();
    const spawnTetrimino = getSpawnTetrimino(nextTetriminoType);
    const spawnTetriminoCoordinates = getCoordinateByAnchorAndShapeAndType(
      spawnTetrimino.anchor,
      spawnTetrimino.type,
      spawnTetrimino.shape
    );
    const nextSpawnTetrimino = {
      ...spawnTetrimino,
      anchor: {
        x: spawnTetrimino.anchor.x,
        y: spawnTetrimino.anchor.y + getSizeByCoordinates(spawnTetriminoCoordinates).vertical,
      },
    };
    const nextSpawnTetriminoCoordinates = getCoordinateByAnchorAndShapeAndType(
      nextSpawnTetrimino.anchor,
      spawnTetrimino.type,
      spawnTetrimino.shape
    );
    if (!getCoordinatesIsCollideWithFilledCube(spawnTetriminoCoordinates)) {
      if (getCoordinatesIsCollideWithFilledCube(nextSpawnTetriminoCoordinates)) {
        setTetrimino(spawnTetrimino);
      } else {
        setTetrimino(nextSpawnTetrimino);
      }
      isCreatedSuccess = true;
      return isCreatedSuccess;
    }
    return isCreatedSuccess;
  }, [popNextTetriminoType, getSpawnTetrimino, getCoordinatesIsCollideWithFilledCube, setTetrimino]);

  const handleGameOver = useCallback(() => {
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    tetriminoFallingTimer.clear();
    tetriminoCollideBottomTimer.clear();
  }, [pauseClearRowAnimation, pauseFillRowAnimation]);

  const handleNextGame = useCallback(() => {
    resetTetris();
    resetTetrimino();
    setLine(0);
    setGameState(GAME_STATE.BEFORE_START);
  }, [resetTetrimino, resetTetris]);

  useEffect(
    function handleKeyDown() {
      const isRegisterKeyDownHandler = !isGameOver && isGameStart;
      function keydownHandler(e: KeyboardEvent) {
        // console.log("keyCode is " + e.keyCode);
        if (
          !isPausing ||
          gameState === GAME_STATE.ROW_FILLED_CLEARING ||
          gameState === GAME_STATE.ROW_EMPTY_FILLING
        ) {
          if (e.keyCode === 37) {
            moveTetrimino(DIRECTION.LEFT);
          } else if (e.keyCode === 39) {
            moveTetrimino(DIRECTION.RIGHT);
          } else if (e.keyCode === 40) {
            moveTetrimino(DIRECTION.DOWN);
          } else if (e.keyCode === 38) {
            changeTetriminoShape(Tetrimino_ROTATION.CLOCK_WISE);
          } else if (e.keyCode === 90) {
            changeTetriminoShape(Tetrimino_ROTATION.COUNTER_CLOCK_WISE);
          } else if (e.keyCode === 32) {
            setRef(isHardDrop, true);
            moveTetriminoToPreview();
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
      isGameOver,
      gameState,
      isGameStart,
      moveTetrimino,
      changeTetriminoShape,
      continueGame,
      pauseGame,
      setGameState,
      setPrevGameState,
      moveTetriminoToPreview,
    ]
  );
  useEffect(
    function handleGameStateChange() {
      let effectCleaner = () => {};
      switch (gameState) {
        case GAME_STATE.BEFORE_START:
          break;
        case GAME_STATE.START:
          setGameState(GAME_STATE.NEXT_CYCLE);
          break;
        case GAME_STATE.NEXT_CYCLE:
          const isCreatedSuccess = handleTetriminoCreate();
          setGameState(isCreatedSuccess ? GAME_STATE.TETRIMINO_FALLING : GAME_STATE.GAME_OVER);
          break;
        case GAME_STATE.PAUSE:
          pauseGame();
          break;
        case GAME_STATE.BEFORE_LEAVE_PAUSE:
          setGameState(prevGameState.current);
          continueGame();
          break;
        case GAME_STATE.GAME_OVER:
          handleGameOver();
          break;
        case GAME_STATE.TETRIMINO_FALLING:
          const { isBottomCollide } = getTetriminoIsCollideWithNearbyCube();
          if (isBottomCollide) {
            if (tetriminoFallingTimer.isPending()) {
              tetriminoFallingTimer.clear();
            }
            if (tetriminoCollideBottomTimer.isPending()) {
              tetriminoCollideBottomTimer.clear();
            }
            const _ = () => {
              if (getIsCoordinatesLockOut(tetriminoCoordinates as Array<ICoordinate>)) {
                setGameState(GAME_STATE.GAME_OVER);
              } else {
                setTetriminoToTetris();
                setGameState(GAME_STATE.CHECK_IS_ROW_FILLED);
              }
            };
            if (isHardDrop.current) {
              setRef(isHardDrop, false);
              _();
            } else {
              tetriminoCollideBottomTimer.start(() => {
                _();
              }, 500);
            }
          } else {
            if (tetriminoCollideBottomTimer.isPending()) {
              tetriminoCollideBottomTimer.clear();
            }
            if (tetriminoFallingTimer.isPending()) {
              setRef(tetriminoFallingTimerHandler, () => moveTetrimino(DIRECTION.DOWN));
            } else {
              setRef(tetriminoFallingTimerHandler, () => moveTetrimino(DIRECTION.DOWN));
              tetriminoFallingTimer.start(() => {
                tetriminoFallingTimerHandler.current();
              }, tetriminoFallingDelay);
            }
          }
          break;
        case GAME_STATE.CHECK_IS_ROW_FILLED:
          const filledRow = getRowFilledWithCube();
          if (filledRow) {
            setGameState(GAME_STATE.ROW_FILLED_CLEARING);
            const nextLineValue = line + filledRow.length;
            const nextLevel = getLevelByLine(nextLineValue);
            setScore((prevScore) => prevScore + getScoreByLevelAndLine(level, filledRow.length));
            setLine(nextLineValue);
            setLevel(getLevelByLine(nextLineValue));
            setTetriminoFallingDelay(getTetriminoFallingDelayByLevel(nextLevel));
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
      line,
      level,
      prevGameState,
      tetriminoFallingDelay,
      tetriminoCoordinates,
      handleTetriminoCreate,
      handleGameOver,
      checkIsTetriminoCollideWithTetris,
      setGameState,
      setLine,
      continueGame,
      pauseGame,
      getRowFilledWithCube,
      getEmptyRow,
      clearRowFilledWithCube,
      fillEmptyRow,
      getTetriminoIsCollideWithNearbyCube,
      setTetriminoToTetris,
      moveTetrimino,
      getIsCoordinatesLockOut,
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
            fontLevel={"three"}
            width={singleSizeConfig.widget.displayNumber.width}
            height={singleSizeConfig.widget.displayNumber.height}
            title={"LINE"}
            displayValue={line}
          />
        </div>
        <div
          style={{
            marginBottom: `${singleSizeConfig.distanceBetweenWidgetAndWidget}px`,
          }}
        >
          <Widget.DisplayNumber
            fontLevel={"three"}
            width={singleSizeConfig.widget.displayNumber.width}
            height={singleSizeConfig.widget.displayNumber.height}
            title={"LEVEL"}
            displayValue={level}
          />
        </div>
        <Widget.DisplayNumber
          fontLevel={"three"}
          width={singleSizeConfig.widget.displayNumber.width}
          height={singleSizeConfig.widget.displayNumber.height}
          title={"SCORE"}
          displayValue={score}
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
            tetris={displayTetris}
            tetrimino={displayTetriminoCoordinates}
            previewTetrimino={previewTetrimino}
          />
          <PlayField.GameOverPanel isGameOver={isGameOver} onGameOverBtnClick={handleNextGame} />
          <PlayField.PausePanel isPausing={isPausing} />
          <PlayField.GameStartPanel
            onGameStart={() => {
              setGameState(GAME_STATE.START);
            }}
            isGameStart={!isGameStart}
          />
        </PlayField.Wrapper>
      </Column>
      <Column width={singleSizeConfig.widget.displayNumber.width} height={singleSizeConfig.playField.height}>
        <Widget.NextTetrimino
          fontLevel={"three"}
          cubeDistance={singleSizeConfig.widget.nextTetrimino.cube}
          TetriminoBag={nextTetriminoBag}
          width={singleSizeConfig.widget.nextTetrimino.width}
          height={singleSizeConfig.widget.nextTetrimino.height}
        />
      </Column>
    </Wrapper>
  );
};

export default Single;

import { useState, useEffect, useCallback, useMemo, useRef, FC } from "react";
import { setRef } from "../common/utils";
import { createCountDownTimer } from "../common/timer";
import useMatrix from "../hooks/matrix";
import useNextTetriminoBag from "../hooks/nextTetriminoBag";
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
  TETRIMINO_TYPE,
} from "../common/tetrimino";
import {
  DEFAULT_START_LEVEL,
  getLevelByLine,
  getTetriminoFallingDelayByLevel,
  getScoreByLevelAndLine,
  DISPLAY_ZONE_ROW_START,
} from "../common/matrix";
import useKeydownAutoRepeat from "../hooks/keydownAutoRepeat";
import { Key } from "ts-key-enum";
import useHoldTetrimino from "../hooks/holdTetrimino";

const Wrapper = styled.div<ISize>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  display: flex;
`;

const Column = styled.div<ISize & { reverse?: boolean }>`
  position: relative;
  flex: ${(props) => `0 0 ${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

enum MATRIX_PHASE {
  TETRIMINO_CREATE = "TETRIMINO_CREATE",
  TETRIMINO_FALLING = "TETRIMINO_FALLING",
  TETRIMINO_LOCK = "TETRIMINO_LOCK",
  CHECK_IS_ROW_FILLED = "CHECK_IS_ROW_FILLED",
  ROW_FILLED_CLEARING = "ROW_FILLED_CLEARING",
  CHECK_IS_ROW_EMPTY = "CHECK_IS_ROW_EMPTY",
  ROW_EMPTY_FILLING = "ROW_EMPTY_FILLING",
}

enum GAME_STATE {
  START = "START",
  PAUSE = "PAUSE",
  OVER = "OVER",
}

const tetriminoFallingTimer = createCountDownTimer();

const tetriminoCollideBottomTimer = createCountDownTimer();

const Single: FC = () => {
  const {
    tetriminoCoordinates,
    tetrimino,
    displayMatrix,
    displayTetriminoCoordinates,
    setTetriminoToMatrix,
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
    getTetriminoPreviewCoordinates,
    resetTetrimino,
    setTetrimino,
    resetMatrix,
  } = useMatrix();

  const { nextTetriminoBag, popNextTetriminoType } = useNextTetriminoBag(getRandomTetriminoBag());

  const { isHoldable, holdTetrimino, changeHoldTetrimino, setToHoldable } = useHoldTetrimino();

  const {
    mode: { single: singleSizeConfig },
  } = useSizeConfigContext();

  const tetriminoFallingTimerHandler = useRef(() => {});

  const isHardDrop = useRef(false);

  const [matrixPhase, setMatrixPhase] = useState<MATRIX_PHASE | null>(null);

  const [gameState, setGameState] = useState<GAME_STATE | null>(null);

  const [line, setLine] = useState(0);

  const [level, setLevel] = useState(DEFAULT_START_LEVEL);

  const [score, setScore] = useState(0);

  const [tetriminoFallingDelay, setTetriminoFallingDelay] = useState(
    getTetriminoFallingDelayByLevel(DEFAULT_START_LEVEL)
  );

  const isGameStart = useMemo(() => gameState === GAME_STATE.START, [gameState]);

  const isPausing = useMemo(() => gameState === GAME_STATE.PAUSE, [gameState]);

  const isGameOver = useMemo(() => gameState === GAME_STATE.OVER, [gameState]);

  const previewTetriminoCoordinates = useMemo(() => {
    const previewCoordinates = getTetriminoPreviewCoordinates();
    if (previewCoordinates !== null && tetrimino.type !== null) {
      return previewCoordinates.map(({ x, y }) => ({
        x,
        y: y - DISPLAY_ZONE_ROW_START,
      })) as Array<ICube>;
    }
    return null;
  }, [tetrimino, getTetriminoPreviewCoordinates]);

  const handleTetriminoCreate = useCallback(
    (nextTetriminoType?: TETRIMINO_TYPE) => {
      // console.log("create Tetrimino!");
      let isCreatedSuccess = false;
      nextTetriminoType = nextTetriminoType ? nextTetriminoType : popNextTetriminoType();
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
    },
    [popNextTetriminoType, getSpawnTetrimino, getCoordinatesIsCollideWithFilledCube, setTetrimino]
  );

  const handleGameStart = useCallback(() => {
    // console.log("game start!");
    setGameState(GAME_STATE.START);
    setMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
  }, []);

  const handleGameOver = useCallback(() => {
    // console.log("game over!");
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    tetriminoFallingTimer.clear();
    tetriminoCollideBottomTimer.clear();
  }, [pauseClearRowAnimation, pauseFillRowAnimation]);

  const handleGamePause = useCallback(() => {
    // console.log("pause game!");
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    tetriminoFallingTimer.clear();
    tetriminoCollideBottomTimer.clear();
  }, [pauseClearRowAnimation, pauseFillRowAnimation]);

  const handleGameContinue = useCallback(() => {
    // console.log("continue game!");
    continueClearRowAnimation();
    continueFillRowAnimation();
    tetriminoFallingTimer.clear();
    tetriminoCollideBottomTimer.clear();
  }, [continueClearRowAnimation, continueFillRowAnimation]);

  const handleNextGame = useCallback(() => {
    resetMatrix();
    resetTetrimino();
    setLine(0);
    setScore(0);
    setLevel(0);
    setGameState(null);
    setMatrixPhase(null);
  }, [resetTetrimino, resetMatrix]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (
        !isPausing ||
        matrixPhase === MATRIX_PHASE.ROW_FILLED_CLEARING ||
        matrixPhase === MATRIX_PHASE.ROW_EMPTY_FILLING
      ) {
        if (e.key === Key.ArrowLeft) {
          moveTetrimino(DIRECTION.LEFT);
        } else if (e.key === Key.ArrowRight) {
          moveTetrimino(DIRECTION.RIGHT);
        } else if (e.key === Key.ArrowDown) {
          moveTetrimino(DIRECTION.DOWN);
        } else if (e.key === Key.ArrowUp) {
          changeTetriminoShape(Tetrimino_ROTATION.CLOCK_WISE);
        } else if (e.key === "z") {
          changeTetriminoShape(Tetrimino_ROTATION.COUNTER_CLOCK_WISE);
        } else if (e.key === " ") {
          setRef(isHardDrop, true);
          moveTetriminoToPreview();
        } else if (e.key === Key.Shift) {
          if (matrixPhase === MATRIX_PHASE.TETRIMINO_FALLING && isHoldable.current) {
            if (tetriminoFallingTimer.isPending()) {
              tetriminoFallingTimer.clear();
            }
            if (tetriminoCollideBottomTimer.isPending()) {
              tetriminoCollideBottomTimer.clear();
            }
            const prevHoldTetrimino = changeHoldTetrimino(tetrimino.type as TETRIMINO_TYPE);
            let isCreatedSuccess = false;
            if (prevHoldTetrimino) {
              isCreatedSuccess = handleTetriminoCreate(prevHoldTetrimino);
            } else {
              isCreatedSuccess = handleTetriminoCreate();
            }
            if (isCreatedSuccess) {
              setMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
            } else {
              setGameState(GAME_STATE.OVER);
              handleGameOver();
              setMatrixPhase(null);
            }
          }
        }
      }
      if (e.key === Key.Escape) {
        if (isPausing) {
          setGameState(GAME_STATE.START);
          handleGameContinue();
        } else {
          setGameState(GAME_STATE.PAUSE);
          handleGamePause();
        }
      }
    },
    [
      isGameOver,
      isPausing,
      matrixPhase,
      isHoldable,
      tetrimino.type,
      moveTetrimino,
      changeTetriminoShape,
      moveTetriminoToPreview,
      changeHoldTetrimino,
      handleTetriminoCreate,
      handleGameOver,
      handleGameContinue,
      handleGamePause,
    ]
  );

  useKeydownAutoRepeat([Key.ArrowLeft, Key.ArrowRight, Key.ArrowDown], onKeyDown);

  useEffect(() => {
    if (!isGameStart) return;
    let effectCleaner = () => {};
    switch (matrixPhase) {
      case MATRIX_PHASE.TETRIMINO_CREATE:
        const isCreatedSuccess = handleTetriminoCreate();
        if (isCreatedSuccess) {
          setMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
        } else {
          setGameState(GAME_STATE.OVER);
          handleGameOver();
          setMatrixPhase(null);
        }
        break;
      case MATRIX_PHASE.TETRIMINO_FALLING:
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
              setGameState(GAME_STATE.OVER);
              setMatrixPhase(null);
              handleGameOver();
            } else {
              setMatrixPhase(MATRIX_PHASE.TETRIMINO_LOCK);
            }
          };
          if (isHardDrop.current) {
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
      case MATRIX_PHASE.TETRIMINO_LOCK:
        setToHoldable();
        setRef(isHardDrop, false);
        setTetriminoToMatrix();
        setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_FILLED);
        break;
      case MATRIX_PHASE.CHECK_IS_ROW_FILLED:
        const filledRow = getRowFilledWithCube();
        if (filledRow) {
          setMatrixPhase(MATRIX_PHASE.ROW_FILLED_CLEARING);
          const nextLineValue = line + filledRow.length;
          const nextLevel = getLevelByLine(nextLineValue);
          setScore((prevScore) => prevScore + getScoreByLevelAndLine(level, filledRow.length));
          setLine(nextLineValue);
          setLevel(getLevelByLine(nextLineValue));
          setTetriminoFallingDelay(getTetriminoFallingDelayByLevel(nextLevel));
          clearRowFilledWithCube(filledRow).then(() => {
            setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
          });
        } else {
          setMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
        }
        break;
      case MATRIX_PHASE.ROW_FILLED_CLEARING:
        break;
      case MATRIX_PHASE.CHECK_IS_ROW_EMPTY:
        const emptyRowGap = getEmptyRow();
        const isGapNotExist =
          emptyRowGap.length === 0 || (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
        if (!isGapNotExist) {
          //console.log("fill empty row!");
          setMatrixPhase(MATRIX_PHASE.ROW_EMPTY_FILLING);
          fillEmptyRow(emptyRowGap).then(() => {
            setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
          });
        } else {
          setMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
        }
        break;
      case MATRIX_PHASE.ROW_EMPTY_FILLING:
        break;
      default:
        break;
    }
    return effectCleaner;
  }, [
    gameState,
    line,
    level,
    tetriminoFallingDelay,
    tetriminoCoordinates,
    isGameStart,
    matrixPhase,
    handleTetriminoCreate,
    handleGameOver,
    setGameState,
    setLine,
    getRowFilledWithCube,
    getEmptyRow,
    fillEmptyRow,
    getTetriminoIsCollideWithNearbyCube,
    setTetriminoToMatrix,
    moveTetrimino,
    getIsCoordinatesLockOut,
    setToHoldable,
    clearRowFilledWithCube,
  ]);

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
          <Widget.DisplayTetrimino
            title={"HOLD"}
            fontLevel={"three"}
            cubeDistance={singleSizeConfig.widget.hold.cube}
            displayTetriminoNum={1}
            tetriminoBag={holdTetrimino ? [holdTetrimino] : null}
            width={singleSizeConfig.widget.hold.width}
            height={singleSizeConfig.widget.hold.height}
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
            matrix={displayMatrix}
            tetrimino={displayTetriminoCoordinates}
            previewTetrimino={previewTetriminoCoordinates}
          />
          <PlayField.GameOverPanel isGameOver={isGameOver} onGameOverBtnClick={handleNextGame} />
          <PlayField.PausePanel isPausing={isPausing} />
          <PlayField.GameStartPanel onGameStart={handleGameStart} isGameStart={gameState == null} />
        </PlayField.Wrapper>
      </Column>
      <Column width={singleSizeConfig.widget.displayNumber.width} height={singleSizeConfig.playField.height}>
        <Widget.DisplayTetrimino
          title={"NEXT"}
          fontLevel={"three"}
          cubeDistance={singleSizeConfig.widget.nextTetrimino.cube}
          displayTetriminoNum={5}
          tetriminoBag={nextTetriminoBag}
          width={singleSizeConfig.widget.nextTetrimino.width}
          height={singleSizeConfig.widget.nextTetrimino.height}
        />
      </Column>
    </Wrapper>
  );
};

export default Single;

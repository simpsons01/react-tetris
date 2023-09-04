import type { FC } from "react";
import type { ICube, ICoordinate } from "../common/tetrimino";
import type { AnyFunction } from "../common/utils";
import useMatrix from "../hooks/matrix";
import useNextTetriminoBag from "../hooks/nextTetriminoBag";
import styled from "styled-components";
import Widget from "../components/Widget";
import PlayField from "../components/PlayField";
import ScoreText from "../components/ScoreText";
import useKeydownAutoRepeat from "../hooks/keydownAutoRepeat";
import useHoldTetrimino from "../hooks/holdTetrimino";
import Font from "../components/Font";
import Overlay from "../components/Overlay";
import useCustomRef from "../hooks/customRef";
import useGetter from "../hooks/getter";
import useTimeout from "../hooks/timeout";
import useInterval from "../hooks/interval";
import * as KEYCODE from "keycode-js";
import { useSizeConfigContext } from "../context/sizeConfig";
import {
  DIRECTION,
  TETRIMINO_ROTATION_DIRECTION,
  getCoordinateByAnchorAndShapeAndType,
  getSizeByCoordinates,
  TETRIMINO_TYPE,
  TETRIMINO_MOVE_TYPE,
} from "../common/tetrimino";
import { MATRIX_PHASE, DISPLAY_ZONE_ROW_START } from "../common/matrix";
import {
  getLevel,
  getTetriminoFallingDelayByLevel,
  getScore,
  getScoreTypeIsDifficult,
  getScoreType,
  getScoreTextByScoreType,
} from "../common/game";
import { Link } from "react-router-dom";
import { useSettingModalVisibilityContext } from "../context/settingModalVisibility";
import { useSettingContext } from "../context/setting";
import { useState, useEffect, useCallback, useMemo, Fragment } from "react";

const Wrapper = styled.div`
  position: relative;
  height: calc(70vh + 8px);
  display: flex;
`;

const Column = styled.div<{ reverse?: boolean }>`
  position: relative;
  flex: 0 0 auto;
`;

const Settings = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;

  button {
    border: none;
    background-color: transparent;
  }

  img {
    display: block;
    max-width: 100%;
  }
`;

const ToolList = styled.ul`
  li {
    &:before {
      color: #fff !important;
    }

    a {
      text-decoration: none;
    }

    button {
      border: none;
      background-color: transparent;
    }
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  right: 16px;
  top: 16px;
  border: none;
  background-color: transparent;
  width: 40px;
  height: 40px;

  &:after {
    position: absolute;
    content: "";
    display: block;
    background-color: #fff;
    width: 40px;
    height: 4px;

    transform: rotate(45deg);
    left: 0;
    top: 15px;
  }

  &:before {
    position: absolute;
    content: "";
    display: block;
    background-color: #fff;
    width: 40px;
    height: 4px;
    left: 0;
    top: 15px;
    transform: rotate(135deg);
  }
`;

const Combo = styled.div`
  max-width: calc(14vh + 16px);
  word-break: break-all;
`;

enum GAME_STATE {
  START = "START",
  PAUSE = "PAUSE",
  OVER = "OVER",
}

const Single: FC = () => {
  const { playable: isPlayable } = useSizeConfigContext();

  const {
    setting: { gameplay: gameplaySetting, control: controlSetting },
  } = useSettingContext();

  const {
    tetriminoCoordinates,
    tetrimino,
    displayMatrix,
    displayTetriminoCoordinates,
    tetriminoMoveTypeRecordRef,
    setPrevTetriminoRef,
    setTetriminoMoveTypeRecordRef,
    setTetriminoToMatrix,
    getSpawnTetrimino,
    moveTetrimino,
    moveTetriminoToPreview,
    changeTetriminoShape,
    getRowFilledWithCube,
    getEmptyRow,
    getTetriminoIsCollideWithNearbyCube,
    getCoordinatesIsCollideWithFilledCube,
    getIsCoordinatesLockOut,
    getTetriminoPreviewCoordinates,
    resetTetrimino,
    setTetrimino,
    resetMatrix,
    getTSpinType,
    resetPrevTetriminoRef,
    startFillRowAnimation,
    stopFillRowAnimation,
    resetFillRowAnimation,
    continueFillRowAnimation,
    startClearRowAnimation,
    stopClearRowAnimation,
    resetClearRowAnimation,
    continueClearRowAnimation,
    getBottommostDisplayEmptyRow,
    setPrevAnchorAtShapeChangeRef,
  } = useMatrix();

  const {
    clear: clearTetriminoFallingTimeout,
    isPending: isTetriminoFallingTimeoutPending,
    start: starTetriminoFallingTimeout,
  } = useTimeout();

  const {
    clear: clearTetriminoCollideBottomTimeout,
    isPending: isTetriminoCollideBottomTimeoutPending,
    start: starTetriminoCollideBottomTimeout,
  } = useTimeout();

  const { start: startHideScoreTextTimeout } = useTimeout({ autoClear: true });

  const {
    clear: clearAutoRepeat,
    isInInterval: isAutoRepeating,
    start: starAutoRepeat,
  } = useInterval({ autoClear: true });

  const freshMoveTetrimino = useGetter(moveTetrimino);

  const freshChangeTetriminoShape = useGetter(changeTetriminoShape);

  const [defaultStartLevelRef, setDefaultStartLevelRef] = useCustomRef(gameplaySetting.single.startLevel);

  const { nextTetriminoBag, popNextTetriminoType, initialNextTetriminoBag } = useNextTetriminoBag();

  const { isHoldableRef, holdTetrimino, changeHoldTetrimino, setIsHoldableRef, setHoldTetrimino } =
    useHoldTetrimino();

  const {
    open: openSettingModal,
    close: closeSettingModal,
    isOpen: isSettingModalOpen,
  } = useSettingModalVisibilityContext();

  const [matrixPhase, setMatrixPhase] = useState<MATRIX_PHASE | null>(null);

  const [prevMatrixPhase, setPrevMatrixPhase] = useCustomRef<MATRIX_PHASE | null>(null);

  const [gameState, setGameState] = useState<GAME_STATE | null>(null);

  const [line, setLine] = useState(0);

  const [level, setLevel] = useState(defaultStartLevelRef.current);

  const [score, setScore] = useState(0);

  const [scoreText, setScoreText] = useState({ enter: false, text: "", coordinate: { y: 0 } });

  const [combo, setCombo] = useState(-1);

  const [isLastScoreDifficultRef, setIsLastScoreDifficultRef] = useCustomRef(false);

  const [isToolOverlayOpen, setIsToolOverlayOpen] = useState(false);

  const [tetriminoFallingDelay, setTetriminoFallingDelay] = useState(
    getTetriminoFallingDelayByLevel(defaultStartLevelRef.current)
  );

  const [isHardDropRef, setIsHardDropRef] = useCustomRef(false);

  const [lastKeyDownKeyRef, setLastKeyDownKeyRef] = useCustomRef<undefined | string>(undefined);

  const [lastKeyUpKeyRef, setLastKeyUpKeyRef] = useCustomRef<undefined | string>(undefined);

  const [isDasRef, setIsDasRef] = useCustomRef(false);

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
    setMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
    handleTetriminoCreate();
  }, [handleTetriminoCreate, setMatrixPhase]);

  const handleGameOver = useCallback(() => {
    // console.log("game over!");
    resetFillRowAnimation();
    resetClearRowAnimation();
    clearTetriminoFallingTimeout();
    clearTetriminoCollideBottomTimeout();
  }, [
    resetFillRowAnimation,
    resetClearRowAnimation,
    clearTetriminoFallingTimeout,
    clearTetriminoCollideBottomTimeout,
  ]);

  const handleGamePause = useCallback(() => {
    if (isGameStart) {
      // console.log("pause game!");
      setGameState(GAME_STATE.PAUSE);
      stopFillRowAnimation();
      stopClearRowAnimation();
      setPrevMatrixPhase(matrixPhase);
      setMatrixPhase(null);
      clearTetriminoFallingTimeout();
      clearTetriminoCollideBottomTimeout();
    }
  }, [
    isGameStart,
    matrixPhase,
    clearTetriminoCollideBottomTimeout,
    clearTetriminoFallingTimeout,
    setMatrixPhase,
    setPrevMatrixPhase,
    stopClearRowAnimation,
    stopFillRowAnimation,
  ]);

  const handleGameContinue = useCallback(() => {
    if (isPausing) {
      // console.log("continue game!");
      setGameState(GAME_STATE.START);
      continueClearRowAnimation();
      continueFillRowAnimation();
      setMatrixPhase(prevMatrixPhase.current);
      setPrevMatrixPhase(null);
      clearTetriminoFallingTimeout();
      clearTetriminoCollideBottomTimeout();
    }
  }, [
    isPausing,
    prevMatrixPhase,
    continueClearRowAnimation,
    continueFillRowAnimation,
    setMatrixPhase,
    setPrevMatrixPhase,
    clearTetriminoFallingTimeout,
    clearTetriminoCollideBottomTimeout,
  ]);

  const handleNextGame = useCallback(() => {
    resetMatrix();
    resetTetrimino();
    setLine(0);
    setScore(0);
    setDefaultStartLevelRef(gameplaySetting.single.startLevel);
    setLevel(defaultStartLevelRef.current);
    setTetriminoFallingDelay(getTetriminoFallingDelayByLevel(defaultStartLevelRef.current));
    setGameState(null);
    setHoldTetrimino(null);
    setMatrixPhase(null);
    setPrevAnchorAtShapeChangeRef(null);
    resetPrevTetriminoRef();
    setTetriminoMoveTypeRecordRef([]);
    setIsHardDropRef(false);
    setIsHoldableRef(false);
    setLastKeyDownKeyRef(undefined);
    setLastKeyUpKeyRef(undefined);
    setIsDasRef(false);
    initialNextTetriminoBag();
    resetFillRowAnimation();
    resetClearRowAnimation();
    clearTetriminoCollideBottomTimeout();
    clearTetriminoFallingTimeout();
  }, [
    gameplaySetting.single.startLevel,
    defaultStartLevelRef,
    resetMatrix,
    resetTetrimino,
    setDefaultStartLevelRef,
    setHoldTetrimino,
    setMatrixPhase,
    setTetriminoMoveTypeRecordRef,
    setIsHardDropRef,
    setIsHoldableRef,
    resetPrevTetriminoRef,
    initialNextTetriminoBag,
    resetFillRowAnimation,
    resetClearRowAnimation,
    clearTetriminoCollideBottomTimeout,
    clearTetriminoFallingTimeout,
    setLastKeyDownKeyRef,
    setLastKeyUpKeyRef,
    setIsDasRef,
    setPrevAnchorAtShapeChangeRef,
  ]);

  const openToolOverlay = useCallback(() => {
    handleGamePause();
    setIsToolOverlayOpen(true);
  }, [handleGamePause]);

  const closeToolOverlay = useCallback(() => {
    handleGameContinue();
    setIsToolOverlayOpen(false);
  }, [handleGameContinue]);

  const autoRepeatMove = useGetter((moveType: TETRIMINO_MOVE_TYPE) => {
    if (!isPausing && matrixPhase === MATRIX_PHASE.TETRIMINO_FALLING) {
      const direction =
        moveType === TETRIMINO_MOVE_TYPE.LEFT_MOVE
          ? DIRECTION.LEFT
          : moveType === TETRIMINO_MOVE_TYPE.RIGHT_MOVE
          ? DIRECTION.RIGHT
          : DIRECTION.DOWN;
      const isSuccess = freshMoveTetrimino(direction);
      if (isSuccess) {
        setTetriminoMoveTypeRecordRef([...tetriminoMoveTypeRecordRef.current, moveType]);
      }
    }
  });

  const onKeyDown = useGetter((e: KeyboardEvent) => {
    if (e.key === KEYCODE.VALUE_ESCAPE) {
      if (isToolOverlayOpen) {
        closeToolOverlay();
        if (isSettingModalOpen()) {
          closeSettingModal();
        }
      } else {
        openToolOverlay();
      }
    }
    if (isGameOver) return;
    if (!isPausing && matrixPhase === MATRIX_PHASE.TETRIMINO_FALLING) {
      if (e.key === controlSetting.moveLeft) {
        const isSuccess = freshMoveTetrimino(DIRECTION.LEFT);
        if (isSuccess) {
          setTetriminoMoveTypeRecordRef([
            ...tetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.LEFT_MOVE,
          ]);
        }
      } else if (e.key === controlSetting.moveRight) {
        const isSuccess = freshMoveTetrimino(DIRECTION.RIGHT);
        if (isSuccess) {
          setTetriminoMoveTypeRecordRef([
            ...tetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.RIGHT_MOVE,
          ]);
        }
      } else if (e.key === controlSetting.softDrop) {
        const isSuccess = freshMoveTetrimino(DIRECTION.DOWN);
        if (isSuccess) {
          setTetriminoMoveTypeRecordRef([
            ...tetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.SOFT_DROP,
          ]);
        }
      } else if (e.key === controlSetting.clockwiseRotation) {
        const isSuccess = freshChangeTetriminoShape(TETRIMINO_ROTATION_DIRECTION.CLOCK_WISE);
        if (isSuccess) {
          setTetriminoMoveTypeRecordRef([
            ...tetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.CLOCK_WISE_ROTATE,
          ]);
        }
      } else if (e.key === controlSetting.counterclockwiseRotation) {
        const isSuccess = freshChangeTetriminoShape(TETRIMINO_ROTATION_DIRECTION.COUNTER_CLOCK_WISE);
        if (isSuccess) {
          setTetriminoMoveTypeRecordRef([
            ...tetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.COUNTER_CLOCK_WISE_ROTATE,
          ]);
        }
      } else if (e.key === controlSetting.hardDrop) {
        clearTetriminoFallingTimeout();
        setIsHardDropRef(true);
        const isSuccess = moveTetriminoToPreview();
        if (isSuccess) {
          setTetriminoMoveTypeRecordRef([
            ...tetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.HARD_DROP,
          ]);
        }
      } else if (e.key === controlSetting.hold) {
        setTetriminoMoveTypeRecordRef([]);
        if (matrixPhase === MATRIX_PHASE.TETRIMINO_FALLING && isHoldableRef.current) {
          if (isTetriminoFallingTimeoutPending()) {
            clearTetriminoFallingTimeout();
          }
          if (isTetriminoCollideBottomTimeoutPending()) {
            clearTetriminoCollideBottomTimeout();
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
    const repeatFn = [
      {
        condition:
          e.key !== controlSetting.moveRight &&
          lastKeyDownKeyRef.current === controlSetting.moveRight &&
          lastKeyUpKeyRef.current !== controlSetting.moveRight,
        fn: () => autoRepeatMove(TETRIMINO_MOVE_TYPE.RIGHT_MOVE),
      },
      {
        condition:
          e.key !== controlSetting.moveLeft &&
          lastKeyDownKeyRef.current === controlSetting.moveLeft &&
          lastKeyUpKeyRef.current !== controlSetting.moveLeft,
        fn: () => autoRepeatMove(TETRIMINO_MOVE_TYPE.LEFT_MOVE),
      },
      {
        condition:
          e.key !== controlSetting.softDrop &&
          lastKeyDownKeyRef.current === controlSetting.softDrop &&
          lastKeyUpKeyRef.current !== controlSetting.softDrop,
        fn: () => autoRepeatMove(TETRIMINO_MOVE_TYPE.SOFT_DROP),
      },
    ].reduce<null | AnyFunction>((repeatFn, { condition, fn }) => {
      return repeatFn ? repeatFn : condition ? fn : null;
    }, null);
    if (repeatFn) {
      setIsDasRef(true);
      starAutoRepeat(repeatFn, 33);
    }
    setLastKeyDownKeyRef(e.key);
  });

  const onKeyUp = useGetter((e: KeyboardEvent) => {
    const isDasKeyUp =
      e.key === controlSetting.moveRight ||
      e.key === controlSetting.moveLeft ||
      e.key === controlSetting.softDrop;
    if (isDasKeyUp && isDasRef.current && isAutoRepeating()) {
      clearAutoRepeat();
    }
    setLastKeyUpKeyRef(e.key);
  });

  const tetriminoFallingTimeoutHandler = useGetter(() => {
    const isSuccess = freshMoveTetrimino(DIRECTION.DOWN);
    if (isSuccess) {
      setTetriminoMoveTypeRecordRef([
        ...tetriminoMoveTypeRecordRef.current,
        TETRIMINO_MOVE_TYPE.AUTO_FALLING,
      ]);
    }
  });

  useKeydownAutoRepeat(
    [controlSetting.moveRight, controlSetting.moveLeft, controlSetting.softDrop],
    onKeyDown
  );

  useEffect(() => {
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  useEffect(() => {
    if (!isGameStart) {
      clearTetriminoCollideBottomTimeout();
      clearTetriminoFallingTimeout();
      resetClearRowAnimation();
      resetFillRowAnimation();
      return;
    }
    const tetriminoCreateFn = () => {
      const isCreatedSuccess = handleTetriminoCreate();
      if (isCreatedSuccess) {
        setMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
      } else {
        setGameState(GAME_STATE.OVER);
        setMatrixPhase(null);
        handleGameOver();
      }
    };
    let effectCleaner = () => {};
    switch (matrixPhase) {
      case MATRIX_PHASE.TETRIMINO_FALLING:
        const { isBottomCollide } = getTetriminoIsCollideWithNearbyCube();
        if (isBottomCollide) {
          const tetriminoCollideBottomFn = () => {
            if (getIsCoordinatesLockOut(tetriminoCoordinates as Array<ICoordinate>)) {
              setGameState(GAME_STATE.OVER);
              setMatrixPhase(null);
              handleGameOver();
            } else {
              setPrevTetriminoRef(tetrimino);
              setIsHoldableRef(true);
              setIsHardDropRef(false);
              setTetriminoToMatrix();
              resetTetrimino();
              setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_FILLED);
            }
          };
          if (isHardDropRef.current) {
            tetriminoCollideBottomFn();
          } else {
            starTetriminoCollideBottomTimeout(() => {
              tetriminoCollideBottomFn();
            }, 500);
          }
        } else {
          if (!isTetriminoFallingTimeoutPending()) {
            starTetriminoFallingTimeout(() => {
              tetriminoFallingTimeoutHandler();
            }, tetriminoFallingDelay);
          }
        }
        effectCleaner = () => {
          if (isBottomCollide) {
            clearTetriminoCollideBottomTimeout();
            clearTetriminoFallingTimeout();
          } else {
            clearTetriminoCollideBottomTimeout();
          }
        };
        break;
      case MATRIX_PHASE.CHECK_IS_ROW_FILLED:
        const tSpinType = getTSpinType();
        const filledRow = getRowFilledWithCube();
        if (filledRow.length > 0) {
          const nextLineValue = line + filledRow.length;
          const nextLevel = getLevel(nextLineValue, level);
          const nextCombo = combo + 1;
          const scoreType = getScoreType(tSpinType, filledRow.length);
          const isScoreDifficult = getScoreTypeIsDifficult(scoreType);
          const isBackToBack = isScoreDifficult && isLastScoreDifficultRef.current;
          const score = getScore(tSpinType, level, filledRow.length, nextCombo, isBackToBack);
          const bottommostEmptyRow = getBottommostDisplayEmptyRow();
          setScore((prevScore) => prevScore + score);
          setLine(nextLineValue);
          setLevel(nextLevel);
          setIsLastScoreDifficultRef(isScoreDifficult);
          setTetriminoFallingDelay(getTetriminoFallingDelayByLevel(nextLevel));
          setCombo(nextCombo);
          setScoreText({
            enter: true,
            text: (isBackToBack ? "B2B " : "") + getScoreTextByScoreType(scoreType) + `+${score}`,
            coordinate: {
              y: bottommostEmptyRow === -1 ? 0 : bottommostEmptyRow,
            },
          });
          startHideScoreTextTimeout(() => {
            setScoreText({ enter: false, text: "", coordinate: { y: 0 } });
          }, 500);
          setMatrixPhase(null);
          startClearRowAnimation(filledRow, () => {
            setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
          });
        } else {
          const score = getScore(tSpinType, level, 0, -1, false);
          setScore((prevScore) => prevScore + score);
          setCombo(-1);
          setIsLastScoreDifficultRef(false);
          tetriminoCreateFn();
        }
        setTetriminoMoveTypeRecordRef([]);
        resetPrevTetriminoRef();
        setPrevAnchorAtShapeChangeRef(null);
        break;
      case MATRIX_PHASE.CHECK_IS_ROW_EMPTY:
        const emptyRowGap = getEmptyRow();
        const isGapNotExist =
          emptyRowGap.length === 0 || (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
        if (!isGapNotExist) {
          //console.log("fill empty row!");
          setMatrixPhase(null);
          startFillRowAnimation(emptyRowGap, () => {
            setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
          });
        } else {
          tetriminoCreateFn();
        }
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
    tetrimino,
    isHardDropRef,
    tetriminoMoveTypeRecordRef,
    score,
    combo,
    isLastScoreDifficultRef,
    tetriminoFallingTimeoutHandler,
    handleTetriminoCreate,
    handleGameOver,
    setGameState,
    setLine,
    getRowFilledWithCube,
    getEmptyRow,
    getTetriminoIsCollideWithNearbyCube,
    setTetriminoToMatrix,
    moveTetrimino,
    getIsCoordinatesLockOut,
    setIsHoldableRef,
    getTSpinType,
    setPrevTetriminoRef,
    resetTetrimino,
    setIsHardDropRef,
    setTetriminoMoveTypeRecordRef,
    startClearRowAnimation,
    startFillRowAnimation,
    setMatrixPhase,
    starTetriminoCollideBottomTimeout,
    isTetriminoFallingTimeoutPending,
    starTetriminoFallingTimeout,
    clearTetriminoCollideBottomTimeout,
    clearTetriminoFallingTimeout,
    stopClearRowAnimation,
    stopFillRowAnimation,
    resetClearRowAnimation,
    resetFillRowAnimation,
    startHideScoreTextTimeout,
    getBottommostDisplayEmptyRow,
    setIsLastScoreDifficultRef,
    resetPrevTetriminoRef,
    setPrevAnchorAtShapeChangeRef,
  ]);

  useEffect(() => {
    if (!isPlayable) {
      setGameState(GAME_STATE.OVER);
      setMatrixPhase(null);
      handleGameOver();
    }
  }, [isPlayable, handleGameOver, setMatrixPhase]);

  return (
    <Fragment>
      <Wrapper>
        <Column>
          <div
            style={{
              marginBottom: "2vh",
            }}
          >
            <Widget.DisplayTetrimino
              title={"HOLD"}
              fontLevel={"three"}
              displayTetriminoNum={1}
              tetriminoBag={holdTetrimino ? [holdTetrimino] : null}
            />
          </div>
          <div
            style={{
              marginBottom: "2vh",
            }}
          >
            <Widget.DisplayNumber fontLevel={"three"} title={"LINE"} displayValue={line} />
          </div>
          <div
            style={{
              marginBottom: "2vh",
            }}
          >
            <Widget.DisplayNumber fontLevel={"three"} title={"LEVEL"} displayValue={level} />
          </div>
          <Widget.DisplayNumber fontLevel={"three"} title={"SCORE"} displayValue={score} />
        </Column>
        <Column
          style={{
            margin: "0 2vh",
          }}
        >
          <PlayField.Wrapper>
            <PlayField.Renderer
              matrix={displayMatrix}
              tetrimino={displayTetriminoCoordinates}
              previewTetrimino={previewTetriminoCoordinates}
            />
            <PlayField.GameOverPanel isGameOver={isGameOver} onGameOverBtnClick={handleNextGame} />
            <PlayField.GameStartPanel onGameStart={handleGameStart} isGameStart={gameState == null} />
            <ScoreText {...scoreText} />
          </PlayField.Wrapper>
        </Column>
        <Column>
          <div
            style={{
              marginBottom: "2vh",
            }}
          >
            <Widget.DisplayTetrimino
              title={"NEXT"}
              fontLevel={"three"}
              displayTetriminoNum={5}
              tetriminoBag={nextTetriminoBag.length === 0 ? null : nextTetriminoBag}
            />
          </div>
          <Combo>{combo > 0 ? <Font level={"five"}>COMBOx{combo}</Font> : null}</Combo>
        </Column>
        <Settings>
          <button onClick={openToolOverlay}>
            <img src={"/settings.png"} alt="setting" />
          </button>
        </Settings>
        {isToolOverlayOpen ? (
          <Overlay background="rgba(0, 0, 0, 0.8)">
            <ToolList className="nes-list is-circle">
              <li>
                <Link to="/">
                  <Font color="#fff" inline={true} level={"two"}>
                    HOME
                  </Font>
                </Link>
              </li>
              <li>
                <Link to="/rooms">
                  <Font color="#fff" inline={true} level={"two"}>
                    PLAY 2P
                  </Font>
                </Link>
              </li>
              <li>
                <button onClick={openSettingModal}>
                  <Font color="#fff" inline={true} level={"two"}>
                    SETTINGS
                  </Font>
                </button>
              </li>
            </ToolList>
            <CloseBtn onClick={closeToolOverlay} />
          </Overlay>
        ) : null}
      </Wrapper>
    </Fragment>
  );
};

export default Single;

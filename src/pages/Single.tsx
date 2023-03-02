import type { FC } from "react";
import type { ICube, ICoordinate } from "../utils/tetrimino";
import useMatrix from "../hooks/matrix";
import useNextTetriminoBag from "../hooks/nextTetriminoBag";
import styled from "styled-components";
import Widget from "../components/Widget";
import PlayField from "../components/PlayField";
import useKeydownAutoRepeat from "../hooks/keydownAutoRepeat";
import useHoldTetrimino from "../hooks/holdTetrimino";
import Font from "../components/Font";
import Overlay from "../components/Overlay";
import useCustomRef from "../hooks/customRef";
import useGetter from "../hooks/getter";
import * as KEYCODE from "keycode-js";
import { useSizeConfigContext } from "../context/sizeConfig";
import {
  DIRECTION,
  TETRIMINO_ROTATION_DIRECTION,
  getCoordinateByAnchorAndShapeAndType,
  getSizeByCoordinates,
  TETRIMINO_TYPE,
  TETRIMINO_MOVE_TYPE,
} from "../utils/tetrimino";
import { DISPLAY_ZONE_ROW_START, MATRIX_PHASE } from "../utils/matrix";
import {
  getLevelByLine,
  getTetriminoFallingDelayByLevel,
  getScoreByTSpinAndLevelAndLine,
} from "../utils/game";
import { Link } from "react-router-dom";
import { useSettingModalVisibilityContext } from "../context/settingModalVisibility";
import { useSettingContext } from "../context/setting";
import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { createCountDownTimer } from "../utils/timer";

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
    tetriminoMoveTypeRecordRef,
    setPrevTetriminoRef,
    setTetriminoMoveTypeRecordRef,
    setLastTetriminoRotateWallKickPositionRef,
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
    getTSpinType,
    resetPrevTetriminoRef,
  } = useMatrix();

  const freshMoveTetrimino = useGetter(moveTetrimino);

  const freshChangeTetriminoShape = useGetter(changeTetriminoShape);

  const {
    setting: { gameplay: gameplaySetting, control: controlSetting },
  } = useSettingContext();

  const [defaultStartLevelRef, setDefaultStartLevelRef] = useCustomRef(gameplaySetting.single.startLevel);

  const { nextTetriminoBag, popNextTetriminoType, initialNextTetriminoBag } = useNextTetriminoBag();

  const { isHoldableRef, holdTetrimino, changeHoldTetrimino, setIsHoldableRef, setHoldTetrimino } =
    useHoldTetrimino();

  const { playable: isPlayable } = useSizeConfigContext();

  const {
    open: openSettingModal,
    close: closeSettingModal,
    isOpen: isSettingModalOpen,
  } = useSettingModalVisibilityContext();

  const [matrixPhase, setMatrixPhase] = useState<MATRIX_PHASE | null>(null);

  const [gameState, setGameState] = useState<GAME_STATE | null>(null);

  const [line, setLine] = useState(0);

  const [level, setLevel] = useState(defaultStartLevelRef.current);

  const [score, setScore] = useState(0);

  const [isToolOverlayOpen, setIsToolOverlayOpen] = useState(false);

  const [tetriminoFallingDelay, setTetriminoFallingDelay] = useState(
    getTetriminoFallingDelayByLevel(defaultStartLevelRef.current)
  );

  const [isHardDropRef, setIsHardDropRef] = useCustomRef(false);

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
    if (isGameStart) {
      // console.log("pause game!");
      setGameState(GAME_STATE.PAUSE);
      pauseClearRowAnimation();
      pauseFillRowAnimation();
      tetriminoFallingTimer.clear();
      tetriminoCollideBottomTimer.clear();
    }
  }, [isGameStart, pauseClearRowAnimation, pauseFillRowAnimation]);

  const handleGameContinue = useCallback(() => {
    if (isPausing) {
      // console.log("continue game!");
      setGameState(GAME_STATE.START);
      continueClearRowAnimation();
      continueFillRowAnimation();
      tetriminoFallingTimer.clear();
      tetriminoCollideBottomTimer.clear();
    }
  }, [isPausing, continueClearRowAnimation, continueFillRowAnimation]);

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
    setLastTetriminoRotateWallKickPositionRef(0);
    setTetriminoMoveTypeRecordRef([]);
    setIsHardDropRef(false);
    setIsHoldableRef(false);
    resetPrevTetriminoRef();
    initialNextTetriminoBag();
  }, [
    gameplaySetting,
    defaultStartLevelRef,
    setDefaultStartLevelRef,
    resetMatrix,
    resetTetrimino,
    resetPrevTetriminoRef,
    setLastTetriminoRotateWallKickPositionRef,
    setTetriminoMoveTypeRecordRef,
    setIsHardDropRef,
    setIsHoldableRef,
    setHoldTetrimino,
    initialNextTetriminoBag,
  ]);

  const openToolOverlay = useCallback(() => {
    handleGamePause();
    setIsToolOverlayOpen(true);
  }, [handleGamePause]);

  const closeToolOverlay = useCallback(() => {
    handleGameContinue();
    setIsToolOverlayOpen(false);
  }, [handleGameContinue]);

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
        tetriminoFallingTimer.clear();
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
  });

  const tetriminoFallingTimerHandler = useGetter(() => {
    const isSuccess = freshMoveTetrimino(DIRECTION.DOWN);
    if (isSuccess) {
      setTetriminoMoveTypeRecordRef([
        ...tetriminoMoveTypeRecordRef.current,
        TETRIMINO_MOVE_TYPE.AUTO_FALLING,
      ]);
    }
  });

  useKeydownAutoRepeat([KEYCODE.VALUE_LEFT, KEYCODE.VALUE_RIGHT, KEYCODE.VALUE_DOWN], onKeyDown);

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
          setMatrixPhase(null);
          handleGameOver();
        }
        break;
      case MATRIX_PHASE.TETRIMINO_FALLING:
        const { isBottomCollide } = getTetriminoIsCollideWithNearbyCube();
        if (isBottomCollide) {
          const _ = () => {
            if (getIsCoordinatesLockOut(tetriminoCoordinates as Array<ICoordinate>)) {
              setGameState(GAME_STATE.OVER);
              setMatrixPhase(null);
              handleGameOver();
            } else {
              setMatrixPhase(MATRIX_PHASE.TETRIMINO_LOCK);
            }
          };
          if (isHardDropRef.current) {
            _();
          } else {
            tetriminoCollideBottomTimer.start(() => {
              _();
            }, 500);
          }
        } else {
          if (!tetriminoFallingTimer.isPending()) {
            tetriminoFallingTimer.start(() => {
              tetriminoFallingTimerHandler();
            }, tetriminoFallingDelay);
          }
        }
        effectCleaner = () => {
          if (isBottomCollide) {
            tetriminoFallingTimer.clear();
            tetriminoCollideBottomTimer.clear();
          } else {
            tetriminoCollideBottomTimer.clear();
          }
        };
        break;
      case MATRIX_PHASE.TETRIMINO_LOCK:
        setPrevTetriminoRef(tetrimino);
        setIsHoldableRef(true);
        setIsHardDropRef(false);
        setTetriminoToMatrix();
        resetTetrimino();
        setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_FILLED);
        break;
      case MATRIX_PHASE.CHECK_IS_ROW_FILLED:
        const tSpinType = getTSpinType();
        const filledRow = getRowFilledWithCube();
        if (filledRow.length > 0) {
          setMatrixPhase(MATRIX_PHASE.ROW_FILLED_CLEARING);
          const nextLineValue = line + filledRow.length;
          const nextLevel = getLevelByLine(nextLineValue, level);
          setScore(
            (prevScore) => prevScore + getScoreByTSpinAndLevelAndLine(tSpinType, level, filledRow.length)
          );
          setLine(nextLineValue);
          setLevel(nextLevel);
          setTetriminoFallingDelay(getTetriminoFallingDelayByLevel(nextLevel));
          setLastTetriminoRotateWallKickPositionRef(0);
          setTetriminoMoveTypeRecordRef([]);
          clearRowFilledWithCube(filledRow).then(() => {
            setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
          });
        } else {
          setLastTetriminoRotateWallKickPositionRef(0);
          setTetriminoMoveTypeRecordRef([]);
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
    tetrimino,
    isHardDropRef,
    tetriminoMoveTypeRecordRef,
    tetriminoFallingTimerHandler,
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
    setIsHoldableRef,
    clearRowFilledWithCube,
    getTSpinType,
    setPrevTetriminoRef,
    resetTetrimino,
    setIsHardDropRef,
    setLastTetriminoRotateWallKickPositionRef,
    setTetriminoMoveTypeRecordRef,
  ]);

  useEffect(() => {
    if (!isPlayable) {
      setGameState(GAME_STATE.OVER);
      setMatrixPhase(null);
      handleGameOver();
    }
  }, [handleGameOver, isPlayable]);

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
          </PlayField.Wrapper>
        </Column>
        <Column>
          <Widget.DisplayTetrimino
            title={"NEXT"}
            fontLevel={"three"}
            displayTetriminoNum={5}
            tetriminoBag={nextTetriminoBag.length === 0 ? null : nextTetriminoBag}
          />
        </Column>
        <Settings>
          <button onClick={openToolOverlay}>
            <img src={`${process.env.REACT_APP_STATIC_URL}/settings.png`} alt="setting" />
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

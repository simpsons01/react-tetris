import { useState, useEffect, useCallback, useMemo, FC, Fragment } from "react";
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
  TETRIMINO_ROTATION_DIRECTION,
  getCoordinateByAnchorAndShapeAndType,
  ICoordinate,
  getSizeByCoordinates,
  TETRIMINO_TYPE,
  TETRIMINO_MOVE_TYPE,
} from "../common/tetrimino";
import { DISPLAY_ZONE_ROW_START, MATRIX_PHASE } from "../common/matrix";
import {
  getLevelByLine,
  getTetriminoFallingDelayByLevel,
  getScoreByTSpinAndLevelAndLine,
} from "../common/game";
import useKeydownAutoRepeat from "../hooks/keydownAutoRepeat";
import { Key } from "ts-key-enum";
import useHoldTetrimino from "../hooks/holdTetrimino";
import Font from "../components/Font";
import { Link } from "react-router-dom";
import Overlay from "../components/Overlay";
import { useSettingModalVisibilityContext } from "../context/settingModalVisibility";
import useCustomRef from "../hooks/customRef";
import { AnyFunction } from "../common/utils";
import { useSettingContext } from "../context/setting";

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

  i {
    transform: scale(2);
    color: #fff;
  }

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

  const { settingRef } = useSettingContext();

  const [defaultStartLevelRef] = useCustomRef(settingRef.current.gameplay.single.startLevel);

  const { nextTetriminoBag, popNextTetriminoType, setNextTetriminoBag, initialNextTetriminoBag } =
    useNextTetriminoBag();

  const { isHoldableRef, holdTetrimino, changeHoldTetrimino, setIsHoldableRef, setHoldTetrimino } =
    useHoldTetrimino();

  const {
    mode: { single: singleSizeConfig },
  } = useSizeConfigContext();

  const { open: openSettingModal } = useSettingModalVisibilityContext();

  const [matrixPhase, setMatrixPhase] = useState<MATRIX_PHASE | null>(null);

  const [gameState, setGameState] = useState<GAME_STATE | null>(null);

  const [line, setLine] = useState(0);

  const [level, setLevel] = useState(defaultStartLevelRef.current);

  const [score, setScore] = useState(0);

  const [isToolOverlayOpen, setIsToolOverlayOpen] = useState(false);

  const [tetriminoFallingDelay, setTetriminoFallingDelay] = useState(
    getTetriminoFallingDelayByLevel(defaultStartLevelRef.current)
  );

  const [tetriminoFallingTimerHandlerRef, setTetriminoFallingTimerHandlerRef] = useCustomRef<AnyFunction>(
    () => {}
  );

  const [isHardDropRef, setIsHardDropRef] = useCustomRef(false);

  const [isSoftDropPressRef, setIsSoftDropPressRef] = useCustomRef(false);

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
    setLevel(defaultStartLevelRef.current);
    setTetriminoFallingDelay(getTetriminoFallingDelayByLevel(defaultStartLevelRef.current));
    setGameState(null);
    setHoldTetrimino(null);
    setMatrixPhase(null);
    setLastTetriminoRotateWallKickPositionRef(0);
    setTetriminoMoveTypeRecordRef([]);
    setIsHardDropRef(false);
    setIsSoftDropPressRef(false);
    setIsHoldableRef(false);
    resetPrevTetriminoRef();
    initialNextTetriminoBag();
  }, [
    defaultStartLevelRef,
    resetMatrix,
    resetTetrimino,
    resetPrevTetriminoRef,
    setLastTetriminoRotateWallKickPositionRef,
    setTetriminoMoveTypeRecordRef,
    setIsHardDropRef,
    setIsSoftDropPressRef,
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

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isGameOver) {
        if (e.key === Key.Escape) {
          if (isToolOverlayOpen) {
            closeToolOverlay();
          } else {
            openToolOverlay();
          }
        }
        return;
      }
      if (!isPausing && matrixPhase === MATRIX_PHASE.TETRIMINO_FALLING) {
        if (e.key === Key.ArrowLeft) {
          const isSuccess = moveTetrimino(DIRECTION.LEFT);
          if (isSuccess) {
            setTetriminoMoveTypeRecordRef([
              ...tetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.LEFT_MOVE,
            ]);
          }
        } else if (e.key === Key.ArrowRight) {
          const isSuccess = moveTetrimino(DIRECTION.RIGHT);
          if (isSuccess) {
            setTetriminoMoveTypeRecordRef([
              ...tetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.RIGHT_MOVE,
            ]);
          }
        } else if (e.key === Key.ArrowDown) {
          if (e.repeat) setIsSoftDropPressRef(true);
          const isSuccess = moveTetrimino(DIRECTION.DOWN);
          if (isSuccess) {
            setTetriminoMoveTypeRecordRef([
              ...tetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.SOFT_DROP,
            ]);
          }
        } else if (e.key === Key.ArrowUp) {
          const isSuccess = changeTetriminoShape(TETRIMINO_ROTATION_DIRECTION.CLOCK_WISE);
          if (isSuccess) {
            setTetriminoMoveTypeRecordRef([
              ...tetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.CLOCK_WISE_ROTATE,
            ]);
          }
        } else if (e.key === "z") {
          const isSuccess = changeTetriminoShape(TETRIMINO_ROTATION_DIRECTION.COUNTER_CLOCK_WISE);
          if (isSuccess) {
            setTetriminoMoveTypeRecordRef([
              ...tetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.COUNTER_CLOCK_WISE_ROTATE,
            ]);
          }
        } else if (e.key === " ") {
          tetriminoFallingTimer.clear();
          setIsHardDropRef(true);
          const isSuccess = moveTetriminoToPreview();
          if (isSuccess) {
            setTetriminoMoveTypeRecordRef([
              ...tetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.HARD_DROP,
            ]);
          }
        } else if (e.key === Key.Shift) {
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
      if (e.key === Key.Escape) {
        if (isToolOverlayOpen) {
          closeToolOverlay();
        } else {
          openToolOverlay();
        }
      }
    },
    [
      isGameOver,
      isPausing,
      matrixPhase,
      isToolOverlayOpen,
      tetriminoMoveTypeRecordRef,
      isHoldableRef,
      tetrimino.type,
      closeToolOverlay,
      openToolOverlay,
      moveTetrimino,
      setTetriminoMoveTypeRecordRef,
      setIsSoftDropPressRef,
      changeTetriminoShape,
      setIsHardDropRef,
      moveTetriminoToPreview,
      changeHoldTetrimino,
      handleTetriminoCreate,
      handleGameOver,
    ]
  );

  useKeydownAutoRepeat([Key.ArrowLeft, Key.ArrowRight, Key.ArrowDown], onKeyDown);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === Key.ArrowDown) {
        setIsSoftDropPressRef(false);
      }
    };
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [setIsSoftDropPressRef]);

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
          if (isSoftDropPressRef.current) {
            tetriminoFallingTimer.clear();
          } else {
            setTetriminoFallingTimerHandlerRef(() => {
              moveTetrimino(DIRECTION.DOWN);
            });
            if (!tetriminoFallingTimer.isPending()) {
              tetriminoFallingTimer.start(() => {
                tetriminoFallingTimerHandlerRef.current();
              }, tetriminoFallingDelay);
            }
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
    isSoftDropPressRef,
    isHardDropRef,
    tetriminoFallingTimerHandlerRef,
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
    setTetriminoFallingTimerHandlerRef,
    setLastTetriminoRotateWallKickPositionRef,
    setTetriminoMoveTypeRecordRef,
  ]);

  return (
    <Fragment>
      <Wrapper
        width={
          singleSizeConfig.playField.width +
          singleSizeConfig.distanceBetweenPlayFieldAndWidget * 2 +
          singleSizeConfig.widget.displayNumber.width +
          singleSizeConfig.widget.displayNumber.width
        }
        height={singleSizeConfig.playField.height}
      >
        <Column
          width={singleSizeConfig.widget.displayNumber.width}
          height={singleSizeConfig.playField.height}
        >
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
            <PlayField.GameStartPanel onGameStart={handleGameStart} isGameStart={gameState == null} />
          </PlayField.Wrapper>
        </Column>
        <Column
          width={singleSizeConfig.widget.displayNumber.width}
          height={singleSizeConfig.playField.height}
        >
          <Widget.DisplayTetrimino
            title={"NEXT"}
            fontLevel={"three"}
            cubeDistance={singleSizeConfig.widget.nextTetrimino.cube}
            displayTetriminoNum={5}
            tetriminoBag={nextTetriminoBag.length === 0 ? null : nextTetriminoBag}
            width={singleSizeConfig.widget.nextTetrimino.width}
            height={singleSizeConfig.widget.nextTetrimino.height}
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
                <button onClick={() => {}}>
                  <Font color="#fff" inline={true} level={"two"}>
                    PLAY 2P
                  </Font>
                </button>
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

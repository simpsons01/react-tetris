import { useState, useEffect, useCallback, useMemo, useRef, FC, Fragment } from "react";
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
  TETRIMINO_ROTATION_DIRECTION,
  getCoordinateByAnchorAndShapeAndType,
  ICoordinate,
  getSizeByCoordinates,
  TETRIMINO_TYPE,
  TETRIMINO_MOVE_TYPE,
} from "../common/tetrimino";
import {
  DEFAULT_START_LEVEL,
  getLevelByLine,
  getTetriminoFallingDelayByLevel,
  getScoreByTSpinAndLevelAndLine,
  getScoreTextByTSpinAndLine,
  DISPLAY_ZONE_ROW_START,
} from "../common/matrix";
import useKeydownAutoRepeat from "../hooks/keydownAutoRepeat";
import { Key } from "ts-key-enum";
import useHoldTetrimino from "../hooks/holdTetrimino";
import Modal from "../components/Modal";
import Font from "../components/Font";
import { Link } from "react-router-dom";

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

const ToolModalList = styled.ul`
  li {
    a {
      text-decoration: none;
    }

    button {
      border: none;
      background-color: transparent;
    }
  }
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
    prevTetrimino,
    setPrevTetrimino,
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
    resetTetriminoMoveTypeRecord,
    pushTetriminoMoveTypeRecord,
    resetLastTetriminoRotateWallKickPosition,
    resetPrevTetrimino,
  } = useMatrix();

  const { nextTetriminoBag, popNextTetriminoType } = useNextTetriminoBag();

  const {
    isHoldable,
    holdTetrimino,
    changeHoldTetrimino,
    setToHoldable: setHoldTetriminoToHoldable,
  } = useHoldTetrimino();

  const {
    mode: { single: singleSizeConfig },
  } = useSizeConfigContext();

  const tetriminoFallingTimerHandler = useRef(() => {});

  const isHardDrop = useRef(false);

  const isSoftDropPress = useRef(false);

  const [matrixPhase, setMatrixPhase] = useState<MATRIX_PHASE | null>(null);

  const [gameState, setGameState] = useState<GAME_STATE | null>(null);

  const [line, setLine] = useState(0);

  const [level, setLevel] = useState(DEFAULT_START_LEVEL);

  const [score, setScore] = useState(0);

  const [scoreText, setScoreText] = useState({ enter: false, text: "", coordinate: { x: 0, y: 0 } });

  const [tetriminoFallingDelay, setTetriminoFallingDelay] = useState(
    getTetriminoFallingDelayByLevel(DEFAULT_START_LEVEL)
  );

  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

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
    setGameState(GAME_STATE.PAUSE);
    pauseClearRowAnimation();
    pauseFillRowAnimation();
    tetriminoFallingTimer.clear();
    tetriminoCollideBottomTimer.clear();
  }, [pauseClearRowAnimation, pauseFillRowAnimation]);

  const handleGameContinue = useCallback(() => {
    // console.log("continue game!");
    setGameState(GAME_STATE.START);
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
    setTetriminoFallingDelay(getTetriminoFallingDelayByLevel(DEFAULT_START_LEVEL));
    setGameState(null);
    setMatrixPhase(null);
    resetLastTetriminoRotateWallKickPosition();
    resetTetriminoMoveTypeRecord();
    resetPrevTetrimino();
  }, [
    resetMatrix,
    resetTetrimino,
    resetLastTetriminoRotateWallKickPosition,
    resetTetriminoMoveTypeRecord,
    resetPrevTetrimino,
  ]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (!isPausing && matrixPhase === MATRIX_PHASE.TETRIMINO_FALLING) {
        if (e.key === Key.ArrowLeft) {
          const isSuccess = moveTetrimino(DIRECTION.LEFT);
          if (isSuccess) {
            pushTetriminoMoveTypeRecord(TETRIMINO_MOVE_TYPE.LEFT_MOVE);
          }
        } else if (e.key === Key.ArrowRight) {
          const isSuccess = moveTetrimino(DIRECTION.RIGHT);
          if (isSuccess) {
            pushTetriminoMoveTypeRecord(TETRIMINO_MOVE_TYPE.RIGHT_MOVE);
          }
        } else if (e.key === Key.ArrowDown) {
          if (e.repeat) setRef(isSoftDropPress, true);
          const isSuccess = moveTetrimino(DIRECTION.DOWN);
          if (isSuccess) {
            pushTetriminoMoveTypeRecord(TETRIMINO_MOVE_TYPE.SOFT_DROP);
          }
        } else if (e.key === Key.ArrowUp) {
          const isSuccess = changeTetriminoShape(TETRIMINO_ROTATION_DIRECTION.CLOCK_WISE);
          if (isSuccess) {
            pushTetriminoMoveTypeRecord(TETRIMINO_MOVE_TYPE.CLOCK_WISE_ROTATE);
          }
        } else if (e.key === "z") {
          const isSuccess = changeTetriminoShape(TETRIMINO_ROTATION_DIRECTION.COUNTER_CLOCK_WISE);
          if (isSuccess) {
            pushTetriminoMoveTypeRecord(TETRIMINO_MOVE_TYPE.COUNTER_CLOCK_WISE_ROTATE);
          }
        } else if (e.key === " ") {
          setRef(isHardDrop, true);
          const isSuccess = moveTetriminoToPreview();
          if (isSuccess) {
            pushTetriminoMoveTypeRecord(TETRIMINO_MOVE_TYPE.HARD_DROP);
          }
        } else if (e.key === Key.Shift) {
          resetTetriminoMoveTypeRecord();
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
        setIsToolModalOpen((prevIsToolModalOpen) => !prevIsToolModalOpen);
      }
    },
    [
      isGameOver,
      isPausing,
      matrixPhase,
      isHoldable,
      tetrimino.type,
      moveTetrimino,
      pushTetriminoMoveTypeRecord,
      changeTetriminoShape,
      moveTetriminoToPreview,
      changeHoldTetrimino,
      handleTetriminoCreate,
      handleGameOver,
      resetTetriminoMoveTypeRecord,
    ]
  );

  useKeydownAutoRepeat([Key.ArrowLeft, Key.ArrowRight, Key.ArrowDown], onKeyDown);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === Key.ArrowDown) {
        setRef(isSoftDropPress, false);
      }
    };
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

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
          if (isSoftDropPress.current) {
            if (tetriminoFallingTimer.isPending()) {
              tetriminoFallingTimer.clear();
            }
          } else {
            if (tetriminoFallingTimer.isPending()) {
              setRef(tetriminoFallingTimerHandler, () => moveTetrimino(DIRECTION.DOWN));
            } else {
              setRef(tetriminoFallingTimerHandler, () => moveTetrimino(DIRECTION.DOWN));
              tetriminoFallingTimer.start(() => {
                tetriminoFallingTimerHandler.current();
              }, tetriminoFallingDelay);
            }
          }
        }
        break;
      case MATRIX_PHASE.TETRIMINO_LOCK:
        setPrevTetrimino(tetrimino);
        setHoldTetriminoToHoldable();
        setRef(isHardDrop, false);
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
          const nextLevel = getLevelByLine(nextLineValue);
          setScore(
            (prevScore) => prevScore + getScoreByTSpinAndLevelAndLine(tSpinType, level, filledRow.length)
          );
          setLine(nextLineValue);
          setLevel(getLevelByLine(nextLineValue));
          setScoreText(() => {
            const offset = 3;
            return {
              enter: true,
              text: getScoreTextByTSpinAndLine(tSpinType, filledRow.length),
              coordinate: {
                ...prevTetrimino.current.anchor,
                y: prevTetrimino.current.anchor.y - DISPLAY_ZONE_ROW_START - offset,
              },
            };
          });
          setTetriminoFallingDelay(getTetriminoFallingDelayByLevel(nextLevel));
          resetLastTetriminoRotateWallKickPosition();
          resetTetriminoMoveTypeRecord();
          clearRowFilledWithCube(filledRow).then(() => {
            setMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
          });
        } else {
          resetLastTetriminoRotateWallKickPosition();
          resetTetriminoMoveTypeRecord();
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
    prevTetrimino,
    isSoftDropPress,
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
    setHoldTetriminoToHoldable,
    clearRowFilledWithCube,
    resetTetriminoMoveTypeRecord,
    resetLastTetriminoRotateWallKickPosition,
    getTSpinType,
    setPrevTetrimino,
    resetTetrimino,
  ]);

  useEffect(() => {
    let timer: number | undefined;
    if (scoreText.enter) {
      timer = window.setTimeout(() => {
        setScoreText((prevScoreText) => ({ ...prevScoreText, enter: false }));
      }, 500);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [scoreText]);

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
              scoreText={scoreText}
              cubeDistance={singleSizeConfig.playField.cube}
              matrix={displayMatrix}
              tetrimino={displayTetriminoCoordinates}
              previewTetrimino={previewTetriminoCoordinates}
            />
            <PlayField.GameOverPanel isGameOver={isGameOver} onGameOverBtnClick={handleNextGame} />
            <PlayField.PausePanel onPauseBtnClick={handleGameContinue} isPausing={isPausing} />
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
            tetriminoBag={nextTetriminoBag}
            width={singleSizeConfig.widget.nextTetrimino.width}
            height={singleSizeConfig.widget.nextTetrimino.height}
          />
        </Column>
        <Settings>
          <button onClick={() => setIsToolModalOpen(true)}>
            <img src={`${process.env.REACT_APP_STATIC_URL}/settings.png`} alt="setting" />
          </button>
        </Settings>
        <Modal.Base
          isOpen={isToolModalOpen}
          onCloseBtnClick={() => setIsToolModalOpen(false)}
          body={
            <ToolModalList className="nes-list is-circle">
              <li>
                <Link to="/">
                  <Font inline={true} level={"two"}>
                    HOME
                  </Font>
                </Link>
              </li>
              <li>
                <button onClick={() => {}}>
                  <Font inline={true} level={"two"}>
                    PLAY 2P
                  </Font>
                </button>
              </li>
              <li>
                <button>
                  <Font inline={true} level={"two"}>
                    SETTINGS
                  </Font>
                </button>
              </li>
            </ToolModalList>
          }
        />
      </Wrapper>
    </Fragment>
  );
};

export default Single;

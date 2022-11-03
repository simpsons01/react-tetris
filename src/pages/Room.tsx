import { useCallback, useState, useContext, useEffect, useRef, useMemo, useLayoutEffect, FC } from "react";
import {
  DIRECTION,
  getRandomTetriminoType,
  TETRIMINO_TYPE,
  ICube,
  TETRIMINO_ROTATION_DIRECTION,
  getCoordinateByAnchorAndShapeAndType,
} from "../common/tetrimino";
import { IPlayFieldRenderer } from "../components/PlayField/Renderer";
import Overlay from "../components/Overlay";
import Loading from "../components/Loading";
import useMatrix from "../hooks/matrix";
import useNextTetriminoBag from "../hooks/nextTetriminoBag";
import { useNavigate } from "react-router-dom";
import { ITetrimino } from "../hooks/tetrimino";
import { setRef } from "../common/utils";
import { createAlertModal } from "../common/alert";
import { createCountDownTimer } from "../common/timer";
import { ISocketContext, SocketContext } from "../context/socket";
import { ISize } from "../common/utils";
import { ClientToServerCallback } from "../common/socket";
import styled from "styled-components";
import { useSizeConfigContext } from "../context/sizeConfig";
import Widget from "../components/Widget";
import PlayField from "../components/PlayField";
import Font from "../components/Font";

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const SelfGame = styled.div`
  width: calc(50% - 2px);
  height: 100%;
  left: 0;
  top: 0;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.div`
  width: 4px;
  position: absolute;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #212529;
`;

const CountDown = styled.div`
  width: 50px;
  height: 50px;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  z-index: 1;
  position: absolute;
  color: #212521;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
`;

const OpponentGame = styled.div`
  width: calc(50% - 2px);
  height: 100%;
  left: calc(50%);
  top: 0;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Column = styled.div<ISize>`
  position: relative;
  flex: ${(props) => `0 0 ${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

const Notifier = styled.div`
  text-align: center;
`;

const NotifierWithButton = styled(Notifier)`
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: left;

  button {
    font-size: 16px;
    width: 150px;
    margin-top: 16px;
  }
`;

enum GAME_STATE {
  BEFORE_START,
  START,
  NEXT_CYCLE,
  TETRIMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  ROW_FILLED_CLEARING,
  CHECK_IS_ROW_EMPTY,
  ROW_EMPTY_FILLING,
  CHECK_IS_Tetrimino_COLLIDE_WITH_matrix,
  ALL_ROW_FILLING,
  GAME_OVER,
}

enum ROOM_STATE {
  READY,
  WAIT_OTHER_READY,
  BEFORE_START,
  START,
  END,
  PARTICIPANT_LEAVE,
  HOST_LEAVE,
  ERROR,
}

enum GameDataType {
  NEXT_TETRIMINO_TYPE = "NEXT_TETRIMINO_TYPE",
  Tetrimino = "Tetrimino",
  matrix = "matrix",
  SCORE = "SCORE",
}

enum RESULT {
  WIN,
  LOSE,
  TIE,
}

type GameData = ITetrimino | IPlayFieldRenderer["matrix"] | TETRIMINO_TYPE | number | null;

type GameDataUpdatedPayloads = Array<{ data: GameData; type: GameDataType }>;

const Room: FC = () => {
  const {
    tetrimino: selfTetrimino,
    matrix: selfMatrix,
    tetriminoCoordinates: selfTetriminoCoordinates,
    resetMatrix: resetSelfMatrix,
    setTetrimino: setSelfTetrimino,
    resetTetrimino: resetSelfTetrimino,
    setTetriminoToMatrix: setSelfTetriminoToMatrix,
    getSpawnTetrimino: getSelfSpawnTetrimino,
    moveTetrimino: moveSelfTetrimino,
    changeTetriminoShape: changeSelfTetriminoShape,
    clearRowFilledWithCube: clearSelfRowFilledWithCube,
    getRowFilledWithCube: getSelfRowFilledWithCube,
    getEmptyRow: getSelfEmptyRow,
    fillEmptyRow: fillSelfEmptyRow,
    getTetriminoIsCollideWithNearbyCube: getSelfTetriminoIsCollideWithNearbyCube,
    getCoordinatesIsCollideWithFilledCube: getSelfCoordinatesIsCollideWithFilledCube,
    pauseClearRowAnimation: pauseSelfClearRowAnimation,
    pauseFillRowAnimation: pauseSelfFillRowAnimation,
    fillAllRow: fillSelfAllRow,
    pauseFillAllRowAnimation: pauseSelfFillAllRowAnimation,
    getTetriminoPreviewCoordinates: getSelfTetriminoPreviewCoordinates,
    moveTetriminoToPreview: moveSelfTetriminoToPreview,
  } = useMatrix();

  const { nextTetriminoBag: selfNextTetriminoBag, popNextTetriminoType: popSelfNextTetrimino } =
    useNextTetriminoBag();

  const {
    tetrimino: opponentTetrimino,
    tetriminoCoordinates: opponentTetriminoCoordinates,
    matrix: opponentMatrix,
    setMatrix: setOpponentMatrix,
    setTetrimino: setOpponentTetrimino,
    resetTetrimino: resetOpponentTetrimino,
    resetMatrix: resetOpponentMatrix,
    getTetriminoPreviewCoordinates: getOpponentTetriminoPreviewCoordinates,
  } = useMatrix();

  const navigate = useNavigate();

  const {
    mode: { double: doubleSizeConfig },
  } = useSizeConfigContext();

  const { socketInstance, isConnected } = useContext<
    ISocketContext<
      {
        error_occur: () => void;
        before_start_game: (leftsec: number) => void;
        game_start: () => void;
        game_leftSec: (leftsec: number) => void;
        game_over: (result: { isTie: boolean; winnerId: string; loserId: string }) => void;
        room_participant_leave: () => void;
        room_host_leave: () => void;
        other_game_data_updated: (updatedPayloads: GameDataUpdatedPayloads) => void;
      },
      {
        get_socket_data: (done: ClientToServerCallback<{ roomId: string; name: string }>) => void;
        ready: (done: ClientToServerCallback<{}>) => void;
        leave_room: (done: ClientToServerCallback<{}>) => void;
        force_leave_room: (done: ClientToServerCallback<{}>) => void;
        reset_room: (done: ClientToServerCallback<{}>) => void;
        game_data_updated: (updatedPayloads: GameDataUpdatedPayloads) => void;
      }
    >
  >(SocketContext);

  const [isCheckComplete, setIsCheckComplete] = useState(false);

  const [beforeStartCountDown, setBeforeStartCountDown] = useState<number>(0);

  const [result, setResult] = useState<number>(RESULT.LOSE);

  const [leftSec, setLeftSec] = useState<number | null>(null);

  const [roomState, setRoomState] = useState<ROOM_STATE>(ROOM_STATE.READY);

  const [selfNextTetriminoType, setSelfNextTetriminoType] = useState<TETRIMINO_TYPE | null>(null);

  const [selfScore, setSelfScore] = useState<number>(0);

  const [opponentNextTetriminoType, setOpponentNextTetriminoType] = useState<TETRIMINO_TYPE | null>(null);

  const { current: TetriminoFallingTimer } = useRef(createCountDownTimer());

  const { current: TetriminoCollideBottomTimer } = useRef(createCountDownTimer());

  const [opponentScore, setOpponentScore] = useState<number>(0);

  const [gameState, setGameState] = useState<GAME_STATE>(GAME_STATE.BEFORE_START);

  const prevSelfTetrimino = useRef<ITetrimino>(selfTetrimino);

  const prevSelfMatrix = useRef<IPlayFieldRenderer["matrix"]>(selfMatrix);

  const prevSelfScore = useRef<number | undefined>(selfScore);

  const prevSelfNextTetriminoType = useRef<TETRIMINO_TYPE>(selfNextTetriminoType);

  const selfPreviewTetrimino = useMemo((): Array<ICube> | null => {
    const previewCoordinate = getSelfTetriminoPreviewCoordinates();
    if (previewCoordinate !== null && selfTetrimino.type !== null) {
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y,
      })) as Array<ICube>;
    }
    return null;
  }, [getSelfTetriminoPreviewCoordinates, selfTetrimino]);

  const opponentPreviewTetrimino = useMemo((): Array<ICube> | null => {
    const previewCoordinate = getOpponentTetriminoPreviewCoordinates();
    if (previewCoordinate !== null && opponentTetrimino.type !== null) {
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y,
      })) as Array<ICube>;
    }
    return null;
  }, [getOpponentTetriminoPreviewCoordinates, opponentTetrimino]);

  const handleReady = useCallback(() => {
    if (isConnected) {
      socketInstance.emit("ready", ({ metadata: { isSuccess, isError, message } }) => {
        if (isError) return;
        if (isSuccess) {
          setRoomState(ROOM_STATE.WAIT_OTHER_READY);
        } else {
          createAlertModal(message ? message : "READY FAIL");
        }
      });
    }
  }, [isConnected, socketInstance]);

  const handleNextGame = useCallback(() => {
    if (isConnected) {
      socketInstance.emit("reset_room", ({ metadata: { isSuccess, isError, message } }) => {
        if (isError) return;
        if (isSuccess) {
          resetOpponentTetrimino();
          resetOpponentMatrix();
          resetSelfTetrimino();
          resetSelfMatrix();
          setSelfScore(0);
          setOpponentScore(0);
          setLeftSec(null);
          setSelfNextTetriminoType(null);
          setOpponentNextTetriminoType(null);
          setRoomState(ROOM_STATE.READY);
        } else {
          createAlertModal(message ? message : "OOPS", {
            text: "TO ROOMS",
            onClick: () => navigate("/rooms"),
          });
        }
      });
    }
  }, [
    isConnected,
    socketInstance,
    resetOpponentTetrimino,
    resetOpponentMatrix,
    resetSelfTetrimino,
    resetSelfMatrix,
    navigate,
  ]);

  const handleLeaveRoom = useCallback(() => {
    if (isConnected) {
      socketInstance.emit("leave_room", ({ metadata: { isError } }) => {
        if (isError) {
          socketInstance.emit("force_leave_room", () => {
            navigate("/rooms");
          });
          return;
        }
        navigate("/rooms");
      });
    }
  }, [isConnected, navigate, socketInstance]);

  const handleTetriminoFalling = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const { isBottomCollide } = getSelfTetriminoIsCollideWithNearbyCube();
      // console.log("isBottomCollide " + isBottomCollide);
      if (isBottomCollide) {
        TetriminoCollideBottomTimer.start(() => {
          setSelfTetriminoToMatrix();
          resolve(isBottomCollide);
        }, 500);
      } else {
        TetriminoFallingTimer.start(() => {
          moveSelfTetrimino(DIRECTION.DOWN);
          resolve(isBottomCollide);
        }, 500);
      }
    });
  }, [
    getSelfTetriminoIsCollideWithNearbyCube,
    moveSelfTetrimino,
    TetriminoCollideBottomTimer,
    TetriminoFallingTimer,
    setSelfTetriminoToMatrix,
  ]);

  const handleTetriminoCreate = useCallback(() => {
    let isCreatedSuccess = false;
    const nextTetriminoType = popSelfNextTetrimino();
    const spawnTetrimino = getSelfSpawnTetrimino(nextTetriminoType);
    const spawnetriminoCoordinates = getCoordinateByAnchorAndShapeAndType(
      spawnTetrimino.anchor,
      spawnTetrimino.type,
      spawnTetrimino.shape
    );
    if (!getSelfCoordinatesIsCollideWithFilledCube(spawnetriminoCoordinates)) {
      setSelfTetrimino(spawnTetrimino);
      isCreatedSuccess = true;
      return;
    }
    return isCreatedSuccess;
  }, [
    getSelfSpawnTetrimino,
    getSelfCoordinatesIsCollideWithFilledCube,
    setSelfTetrimino,
    popSelfNextTetrimino,
  ]);

  const handleNextTetriminoTypeCreate = useCallback(() => {
    setSelfNextTetriminoType(getRandomTetriminoType());
  }, [setSelfNextTetriminoType]);

  const handleGameOver = useCallback(() => {
    TetriminoFallingTimer.clear();
    TetriminoCollideBottomTimer.clear();
    pauseSelfFillAllRowAnimation();
    pauseSelfClearRowAnimation();
    pauseSelfFillRowAnimation();
  }, [
    TetriminoFallingTimer,
    TetriminoCollideBottomTimer,
    pauseSelfFillAllRowAnimation,
    pauseSelfClearRowAnimation,
    pauseSelfFillRowAnimation,
  ]);

  const checkIsTetriminoCollideWithMatrix = useCallback(() => {
    let isCollide = false;
    if (
      selfTetriminoCoordinates !== null &&
      getSelfCoordinatesIsCollideWithFilledCube(selfTetriminoCoordinates)
    ) {
      isCollide = true;
    }
    return isCollide;
  }, [selfTetriminoCoordinates, getSelfCoordinatesIsCollideWithFilledCube]);

  useLayoutEffect(
    function notifyOtherGameDataChange() {
      const updatedPayloads: GameDataUpdatedPayloads = [];
      if (prevSelfNextTetriminoType.current !== selfNextTetriminoType) {
        updatedPayloads.push({
          type: GameDataType.NEXT_TETRIMINO_TYPE,
          data: selfNextTetriminoType,
        });
        setRef(prevSelfNextTetriminoType, selfNextTetriminoType);
      }
      if (prevSelfTetrimino.current !== selfTetrimino) {
        updatedPayloads.push({
          type: GameDataType.Tetrimino,
          data: selfTetrimino,
        });
        setRef(prevSelfTetrimino, selfTetrimino);
      }
      if (prevSelfMatrix.current !== selfMatrix) {
        updatedPayloads.push({
          type: GameDataType.matrix,
          data: selfMatrix,
        });
        setRef(prevSelfMatrix, selfMatrix);
      }
      if (prevSelfScore.current !== selfScore) {
        updatedPayloads.push({
          type: GameDataType.SCORE,
          data: selfScore,
        });
        setRef(prevSelfScore, selfScore);
      }
      if (isConnected && updatedPayloads.length > 0) {
        socketInstance.emit("game_data_updated", updatedPayloads);
      }
    },
    [selfMatrix, selfScore, selfTetrimino, selfNextTetriminoType, socketInstance, isConnected]
  );

  useEffect(() => {
    if (isConnected) {
      socketInstance.emit("get_socket_data", ({ data: { name, roomId } }) => {
        setIsCheckComplete(true);
        if (!name || !roomId) {
          navigate("/");
        }
      });
    } else {
      navigate("/");
    }
    return () => {
      if (isConnected) {
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    function handleKeyDown() {
      const isRegisterKeyDownHandler =
        roomState === ROOM_STATE.START &&
        (gameState === GAME_STATE.START ||
          gameState === GAME_STATE.NEXT_CYCLE ||
          gameState === GAME_STATE.TETRIMINO_FALLING);
      function keydownHandler(e: KeyboardEvent) {
        // console.log("keyCode is " + e.keyCode);
        if (e.keyCode === 37) {
          moveSelfTetrimino(DIRECTION.LEFT);
        } else if (e.keyCode === 39) {
          moveSelfTetrimino(DIRECTION.RIGHT);
        } else if (e.keyCode === 40) {
          moveSelfTetrimino(DIRECTION.DOWN);
        } else if (e.keyCode === 38) {
          changeSelfTetriminoShape(TETRIMINO_ROTATION_DIRECTION.CLOCK_WISE);
        } else if (e.keyCode === 32) {
          moveSelfTetriminoToPreview();
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
    [roomState, gameState, changeSelfTetriminoShape, moveSelfTetrimino, moveSelfTetriminoToPreview]
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
          handleTetriminoCreate();
          handleNextTetriminoTypeCreate();
          setGameState(GAME_STATE.CHECK_IS_Tetrimino_COLLIDE_WITH_matrix);
          break;
        case GAME_STATE.CHECK_IS_Tetrimino_COLLIDE_WITH_matrix:
          if (checkIsTetriminoCollideWithMatrix()) {
            setGameState(GAME_STATE.ALL_ROW_FILLING);
            fillSelfAllRow().then(() => {
              resetSelfTetrimino();
              resetSelfMatrix();
              setGameState(GAME_STATE.NEXT_CYCLE);
            });
          } else {
            setGameState(GAME_STATE.TETRIMINO_FALLING);
          }
          break;
        case GAME_STATE.ALL_ROW_FILLING:
          break;
        case GAME_STATE.GAME_OVER:
          handleGameOver();
          break;
        case GAME_STATE.TETRIMINO_FALLING:
          handleTetriminoFalling().then((isBottomCollide) => {
            if (isBottomCollide) {
              setGameState(GAME_STATE.CHECK_IS_ROW_FILLED);
            }
          });
          effectCleaner = () => {
            TetriminoCollideBottomTimer.clear();
            TetriminoFallingTimer.clear();
          };
          break;
        case GAME_STATE.CHECK_IS_ROW_FILLED:
          const filledRow = getSelfRowFilledWithCube();
          if (filledRow) {
            setGameState(GAME_STATE.ROW_FILLED_CLEARING);
            setSelfScore(selfScore + filledRow.length);
            clearSelfRowFilledWithCube(filledRow).then(() => {
              setGameState(GAME_STATE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setGameState(GAME_STATE.NEXT_CYCLE);
          }
          break;
        case GAME_STATE.ROW_FILLED_CLEARING:
          break;
        case GAME_STATE.CHECK_IS_ROW_EMPTY:
          const emptyRowGap = getSelfEmptyRow();
          const isGapNotExist =
            emptyRowGap.length === 0 || (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
          if (!isGapNotExist) {
            //console.log("fill empty row!");
            setGameState(GAME_STATE.ROW_EMPTY_FILLING);
            fillSelfEmptyRow(emptyRowGap).then(() => {
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
      selfScore,
      checkIsTetriminoCollideWithMatrix,
      handleNextTetriminoTypeCreate,
      handleTetriminoCreate,
      getSelfEmptyRow,
      getSelfRowFilledWithCube,
      fillSelfEmptyRow,
      handleTetriminoFalling,
      clearSelfRowFilledWithCube,
      setGameState,
      setSelfScore,
      handleGameOver,
      fillSelfAllRow,
      resetSelfTetrimino,
      resetSelfMatrix,
      TetriminoCollideBottomTimer,
      TetriminoFallingTimer,
    ]
  );

  useEffect(
    function socketHandler() {
      if (isConnected) {
        socketInstance.on("before_start_game", (leftSec) => {
          if (roomState !== ROOM_STATE.BEFORE_START) {
            setSelfNextTetriminoType(getRandomTetriminoType());
            setRoomState(ROOM_STATE.BEFORE_START);
          }
          console.log("left sec is ", leftSec);
          setBeforeStartCountDown(leftSec);
        });
        socketInstance.on("game_start", () => {
          if (roomState !== ROOM_STATE.START) {
            setGameState(GAME_STATE.START);
            setRoomState(ROOM_STATE.START);
          }
        });
        socketInstance.on("game_leftSec", (leftSec: number) => {
          setLeftSec(leftSec);
        });
        socketInstance.on("game_over", ({ isTie, winnerId }) => {
          if (isTie) {
            setResult(RESULT.TIE);
          } else {
            if (socketInstance.id === winnerId) {
              setResult(RESULT.WIN);
            } else {
              setResult(RESULT.LOSE);
            }
          }
          setRoomState(ROOM_STATE.END);
          setGameState(GAME_STATE.GAME_OVER);
        });
        socketInstance.on("other_game_data_updated", (updatedPayloads: GameDataUpdatedPayloads) => {
          updatedPayloads.forEach(({ type, data }) => {
            if (type === GameDataType.NEXT_TETRIMINO_TYPE) {
              setOpponentNextTetriminoType(data as TETRIMINO_TYPE);
            } else if (type === GameDataType.SCORE) {
              setOpponentScore(data as number);
            } else if (type === GameDataType.matrix) {
              setOpponentMatrix(data as IPlayFieldRenderer["matrix"]);
            } else if (type === GameDataType.Tetrimino) {
              setOpponentTetrimino(data as ITetrimino);
            }
          });
        });
        socketInstance.on("room_participant_leave", () => {
          setGameState(GAME_STATE.GAME_OVER);
          setRoomState(ROOM_STATE.PARTICIPANT_LEAVE);
        });
        socketInstance.on("room_host_leave", () => {
          setGameState(GAME_STATE.GAME_OVER);
          setRoomState(ROOM_STATE.HOST_LEAVE);
        });
        socketInstance.on("error_occur", () => {
          setGameState(GAME_STATE.GAME_OVER);
          setRoomState(ROOM_STATE.ERROR);
        });
      } else {
        if (isCheckComplete) {
          setGameState(GAME_STATE.GAME_OVER);
          setRoomState(ROOM_STATE.ERROR);
        }
      }
      return () => {
        if (isConnected) {
          socketInstance.off("before_start_game");
          socketInstance.off("game_start");
          socketInstance.off("game_leftSec");
          socketInstance.off("game_over");
          socketInstance.off("other_game_data_updated");
          socketInstance.off("room_participant_leave");
          socketInstance.off("room_host_leave");
        }
      };
    },
    [
      setRoomState,
      setOpponentMatrix,
      setOpponentTetrimino,
      socketInstance,
      isConnected,
      roomState,
      isCheckComplete,
    ]
  );

  return (
    <Wrapper>
      <SelfGame>
        <Column
          width={doubleSizeConfig.widget.displayNumber.width}
          height={doubleSizeConfig.playField.height}
        >
          <div
            style={{
              marginBottom: `${doubleSizeConfig.distanceBetweenWidgetAndWidget}px`,
            }}
          >
            <Widget.DisplayNumber
              fontLevel={["six", "xl-five"]}
              width={doubleSizeConfig.widget.displayNumber.width}
              height={doubleSizeConfig.widget.displayNumber.height}
              title={"SCORE"}
              displayValue={selfScore}
            />
          </div>
        </Column>
        <Column
          width={doubleSizeConfig.playField.width}
          height={doubleSizeConfig.playField.height}
          style={{
            margin: `0 ${doubleSizeConfig.distanceBetweenPlayFieldAndWidget}px`,
          }}
        >
          <PlayField.Wrapper
            width={doubleSizeConfig.playField.width}
            height={doubleSizeConfig.playField.height}
          >
            <PlayField.Renderer
              scoreText={{ enter: false, text: "", coordinate: { x: 0, y: 0 } }}
              cubeDistance={doubleSizeConfig.playField.cube}
              matrix={selfMatrix}
              tetrimino={selfTetriminoCoordinates}
              previewTetrimino={selfPreviewTetrimino}
            />
          </PlayField.Wrapper>
        </Column>
        <Column
          width={doubleSizeConfig.widget.displayNumber.width}
          height={doubleSizeConfig.playField.height}
        >
          <Widget.NextTetrimino
            fontLevel={["six", "xl-five"]}
            cubeDistance={doubleSizeConfig.widget.nextTetrimino.cube}
            TetriminoBag={selfNextTetriminoBag}
            width={doubleSizeConfig.widget.nextTetrimino.width}
            height={doubleSizeConfig.widget.nextTetrimino.height}
          />
        </Column>
      </SelfGame>
      <Divider></Divider>
      <CountDown className="nes-container">
        <Font level={"three"}>{leftSec}</Font>
      </CountDown>
      <OpponentGame>
        <Column
          width={doubleSizeConfig.widget.displayNumber.width}
          height={doubleSizeConfig.playField.height}
        >
          <Widget.NextTetrimino
            fontLevel={["six", "xl-five"]}
            cubeDistance={doubleSizeConfig.widget.nextTetrimino.cube}
            TetriminoBag={[]}
            width={doubleSizeConfig.widget.nextTetrimino.width}
            height={doubleSizeConfig.widget.nextTetrimino.height}
          />
        </Column>
        <Column
          width={doubleSizeConfig.playField.width}
          height={doubleSizeConfig.playField.height}
          style={{
            margin: `0 ${doubleSizeConfig.distanceBetweenPlayFieldAndWidget}px`,
          }}
        >
          <PlayField.Wrapper
            width={doubleSizeConfig.playField.width}
            height={doubleSizeConfig.playField.height}
          >
            <PlayField.Renderer
              scoreText={{ enter: false, text: "", coordinate: { x: 0, y: 0 } }}
              cubeDistance={doubleSizeConfig.playField.cube}
              matrix={opponentMatrix}
              tetrimino={opponentTetriminoCoordinates}
              previewTetrimino={opponentPreviewTetrimino}
            />
          </PlayField.Wrapper>
        </Column>
        <Column
          width={doubleSizeConfig.widget.displayNumber.width}
          height={doubleSizeConfig.playField.height}
        >
          <div
            style={{
              marginBottom: `${doubleSizeConfig.distanceBetweenWidgetAndWidget}px`,
            }}
          >
            <Widget.DisplayNumber
              fontLevel={["six", "xl-five"]}
              width={doubleSizeConfig.widget.displayNumber.width}
              height={doubleSizeConfig.widget.displayNumber.height}
              title={"SCORE"}
              displayValue={opponentScore}
            />
          </div>
        </Column>
      </OpponentGame>
      {(() => {
        const roomStateNotifier = (() => {
          let notifier = null;
          if (roomState === ROOM_STATE.READY || roomState === ROOM_STATE.WAIT_OTHER_READY) {
            notifier = (
              <NotifierWithButton>
                <Font level={"one"} color="#fff">
                  READY OR NOT
                </Font>
                <button className="nes-btn" onClick={handleReady}>
                  <span
                    style={{
                      position: "relative",
                      left: roomState === ROOM_STATE.READY ? "0" : "-16px",
                    }}
                  >
                    {roomState === ROOM_STATE.READY ? "READY" : <Loading.Dot>WAIT</Loading.Dot>}
                  </span>
                </button>
                <button onClick={handleLeaveRoom} className="nes-btn">
                  QUIT
                </button>
              </NotifierWithButton>
            );
          } else if (roomState === ROOM_STATE.BEFORE_START) {
            notifier = (
              <Notifier>
                <Font level={"one"} color="#fff">
                  {beforeStartCountDown}
                </Font>
              </Notifier>
            );
          } else if (roomState === ROOM_STATE.PARTICIPANT_LEAVE) {
            notifier = (
              <NotifierWithButton>
                <Font level={"one"} color="#fff">
                  GAME INTERRUPTED
                </Font>
                <button onClick={handleNextGame} className="nes-btn">
                  NEXT
                </button>
                <button onClick={handleLeaveRoom} className="nes-btn">
                  QUIT
                </button>
              </NotifierWithButton>
            );
          } else if (roomState === ROOM_STATE.HOST_LEAVE) {
            notifier = (
              <NotifierWithButton>
                <Font level={"one"} color="#fff">
                  HOST LEAVE
                </Font>
                <button onClick={handleLeaveRoom} className="nes-btn">
                  QUIT
                </button>
              </NotifierWithButton>
            );
          } else if (roomState === ROOM_STATE.END) {
            let text = "";
            if (result === RESULT.TIE) {
              text = "GAME IS TIE";
            } else if (result === RESULT.WIN) {
              text = "YOU WIN";
            } else if (result === RESULT.LOSE) {
              text = "YOU LOSE";
            }
            notifier = (
              <NotifierWithButton>
                <Font level={"one"} color="#fff">
                  {text}
                </Font>
                <button onClick={handleNextGame} className="nes-btn">
                  NEXT
                </button>
                <button onClick={handleLeaveRoom} className="nes-btn">
                  QUIT
                </button>
              </NotifierWithButton>
            );
          } else if (roomState === ROOM_STATE.ERROR) {
            notifier = (
              <NotifierWithButton>
                <Font level={"one"} color="#fff">
                  ERROR
                </Font>
                <button onClick={() => navigate("/")} className="nes-btn">
                  QUIT
                </button>
              </NotifierWithButton>
            );
          }

          return notifier;
        })();
        return roomStateNotifier !== null ? <Overlay>{roomStateNotifier}</Overlay> : null;
      })()}
    </Wrapper>
  );
};

export default Room;

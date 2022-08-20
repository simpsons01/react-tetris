import React from "react";
import {
  DIRECTION,
  getRandomPolyominoType,
  POLYOMINO_TYPE,
  ICube,
} from "../common/polyomino";
import Tetris, { ITetris } from "../components/Tetris";
import Game from "../components/Game";
import Next from "../components/Next";
import Score from "../components/Score";
import Overlay from "../components/Overlay";
import useTetris from "../hooks/tetris";
import { useNavigate } from "react-router-dom";
import { IPolyomino } from "../hooks/polyomino";
import { CountDownTimer, createAlertModal, setRef } from "../common/utils";
import { ISocketContext, SocketContext } from "../context/socket";
import { ClientToServerCallback, AnyFunction } from "../common/utils";

enum GAME_STATE {
  BEFORE_START,
  START,
  NEXT_CYCLE,
  POLYOMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  ROW_FILLED_CLEARING,
  CHECK_IS_ROW_EMPTY,
  ROW_EMPTY_FILLING,
  CHECK_IS_POLYOMINO_COLLIDE_WITH_TETRIS,
  ALL_ROW_FILLING,
  GAME_OVER,
}

enum ROOM_STATE {
  READY,
  WAIT_OTHER_READY,
  BEFORE_START,
  START,
  END,
  INTERRUPTED,
  ERROR,
}

enum GameDataType {
  NEXT_POLYOMINO_TYPE,
  POLYOMINO,
  TETRIS,
  SCORE,
}

type GameData = IPolyomino | ITetris["tetris"] | POLYOMINO_TYPE | number | null;

type GameDataUpdatedQueue = Array<{ data: GameData; type: GameDataType }>;

const polyominoFallingTimer = new CountDownTimer(0.3, true);
const polyominoCollideBottomTimer = new CountDownTimer(0.2, true);

const Room = (): JSX.Element => {
  const {
    polyomino: selfPolyomino,
    tetris: selfTetris,
    resetTetris: resetSelfTetris,
    resetPolyomino: resetSelfPolyomino,
    polyominoCoordinate: selfPolyominoCoordinate,
    setPolyominoToTetris: setSelfPolyominoToTetris,
    createPolyomino: createSelfPolyomino,
    movePolyomino: moveSelfPolyomino,
    changePolyominoShape: changeSelfPolyominoShape,
    clearRowFilledWithCube: clearSelfRowFilledWithCube,
    getRowFilledWithCube: getSelfRowFilledWithCube,
    getEmptyRow: getSelfEmptyRow,
    fillEmptyRow: fillSelfEmptyRow,
    getPolyominoIsCollideWithNearbyCube:
      getSelfPolyominoIsCollideWithNearbyCube,
    getCoordinateIsCollideWithTetris: getSelfCoordinateIsCollideWithTetris,
    pauseClearRowAnimation: pauseSelfClearRowAnimation,
    pauseFillRowAnimation: pauseSelfFillRowAnimation,
    fillAllRow: fillSelfAllRow,
    pauseFillAllRowAnimation: pauseSelfFillAllRowAnimation,
    getPolyominoPreviewCoordinate: getSelfPolyominoPreviewCoordinate,
    movePolyominoToPreview: moveSelfPolyominoToPreview,
  } = useTetris();

  const {
    polyomino: opponentPolyomino,
    polyominoCoordinate: opponentPolyominoCoordinate,
    tetris: opponentTetris,
    setTetris: setOpponentTetris,
    setPolyomino: setOpponentPolyomino,
    resetPolyomino: resetOpponentPolyomino,
    resetTetris: resetOpponentTetris,
    getPolyominoPreviewCoordinate: getOpponentPolyominoPreviewCoordinate,
  } = useTetris();

  const { socketInstance, isConnected } = React.useContext<
    ISocketContext<
      {
        error_occur: AnyFunction;
        before_start_game: (leftsec: number) => void;
        game_start: () => void;
        game_leftSec: (leftsec: number) => void;
        game_interrupted: () => void;
        game_over: () => void;
        other_game_data_updated: (updatedQueue: GameDataUpdatedQueue) => void;
      },
      {
        ready: (done: ClientToServerCallback<{}>) => void;
        leave_room: (done: ClientToServerCallback<{}>) => void;
        force_leave_room: (done: ClientToServerCallback<{}>) => void;
        reset_room: (done: ClientToServerCallback<{}>) => void;
        game_data_updated: (updatedQueue: GameDataUpdatedQueue) => void;
      }
    >
  >(SocketContext);

  const navigate = useNavigate();

  const [beforeStartCountDown, setBeforeStartCountDown] =
    React.useState<number>(0);

  const [leftSec, setLeftSec] = React.useState<number | null>(null);

  const [roomState, setRoomState] = React.useState<ROOM_STATE>(
    ROOM_STATE.READY
  );

  const [selfNextPolyominoType, setSelfNextPolyominoType] =
    React.useState<POLYOMINO_TYPE | null>(null);

  const [selfScore, setSelfScore] = React.useState<number>(0);

  const [opponentNextPolyominoType, setOpponentNextPolyominoType] =
    React.useState<POLYOMINO_TYPE | null>(null);

  const [opponentScore, setOpponentScore] = React.useState<number>(0);

  const [gameState, setGameState] = React.useState<GAME_STATE>(
    GAME_STATE.BEFORE_START
  );

  const prevSelfPolyomino = React.useRef<IPolyomino>(selfPolyomino);

  const prevSelfTetris = React.useRef<ITetris["tetris"]>(selfTetris);

  const prevSelfScore = React.useRef<number | undefined>(selfScore);

  const prevSelfNextPolyominoType = React.useRef<POLYOMINO_TYPE>(
    selfNextPolyominoType
  );

  const selfPreviewPolyomino = React.useMemo((): Array<ICube> | null => {
    const previewCoordinate = getSelfPolyominoPreviewCoordinate();
    if (previewCoordinate !== null && selfPolyomino.type !== null) {
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y,
      })) as Array<ICube>;
    }
    return null;
  }, [getSelfPolyominoPreviewCoordinate, selfPolyomino]);

  const opponentPreviewPolyomino = React.useMemo((): Array<ICube> | null => {
    const previewCoordinate = getOpponentPolyominoPreviewCoordinate();
    if (previewCoordinate !== null && opponentPolyomino.type !== null) {
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y,
      })) as Array<ICube>;
    }
    return null;
  }, [getOpponentPolyominoPreviewCoordinate, opponentPolyomino]);

  const handleReady = React.useCallback(() => {
    if (isConnected) {
      socketInstance.emit("ready", ({ metadata: { isSuccess, isError } }) => {
        if (isError) return;
        if (isSuccess) {
          setRoomState(ROOM_STATE.WAIT_OTHER_READY);
        }
      });
    }
  }, [isConnected, socketInstance]);

  const handleNextGame = React.useCallback(() => {
    if (isConnected) {
      socketInstance.emit(
        "reset_room",
        ({ metadata: { isSuccess, isError } }) => {
          if (isError) return;
          if (isSuccess) {
            resetOpponentPolyomino();
            resetOpponentTetris();
            resetSelfPolyomino();
            resetSelfTetris();
            setSelfScore(0);
            setOpponentScore(0);
            setLeftSec(null);
            setSelfNextPolyominoType(null);
            setOpponentNextPolyominoType(null);
            setRoomState(ROOM_STATE.READY);
          } else {
            createAlertModal("OOPS!", {
              text: "TO ROOMS",
              onClick: () => navigate("/rooms"),
            });
          }
        }
      );
    }
  }, [
    isConnected,
    socketInstance,
    resetOpponentPolyomino,
    resetOpponentTetris,
    resetSelfPolyomino,
    resetSelfTetris,
    navigate,
  ]);

  const handleLeaveRoom = React.useCallback(() => {
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

  const handlePolyominoFalling = React.useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const { isBottomCollide } = getSelfPolyominoIsCollideWithNearbyCube();
      // console.log("isBottomCollide " + isBottomCollide);
      if (isBottomCollide) {
        polyominoCollideBottomTimer.start(() => {
          setSelfPolyominoToTetris();
          resolve(isBottomCollide);
        });
      } else {
        polyominoFallingTimer.start(() => {
          moveSelfPolyomino(DIRECTION.DOWN);
          resolve(isBottomCollide);
        });
      }
    });
  }, [
    getSelfPolyominoIsCollideWithNearbyCube,
    moveSelfPolyomino,
    setSelfPolyominoToTetris,
  ]);

  const handlePolyominoCreate = React.useCallback(() => {
    if (selfPolyominoCoordinate == null && selfNextPolyominoType !== null) {
      console.log("create polyomino!");
      createSelfPolyomino(selfNextPolyominoType);
    }
  }, [selfPolyominoCoordinate, createSelfPolyomino, selfNextPolyominoType]);

  const handleNextPolyominoTypeCreate = React.useCallback(() => {
    setSelfNextPolyominoType(getRandomPolyominoType());
  }, [setSelfNextPolyominoType]);

  const handleGameOver = React.useCallback(() => {
    polyominoFallingTimer.clear();
    polyominoCollideBottomTimer.clear();
    pauseSelfFillAllRowAnimation();
    pauseSelfClearRowAnimation();
    pauseSelfFillRowAnimation();
  }, [
    pauseSelfClearRowAnimation,
    pauseSelfFillRowAnimation,
    pauseSelfFillAllRowAnimation,
  ]);

  const checkIsPolyominoCollideWithTetris = React.useCallback(() => {
    let isCollide = false;
    if (
      selfPolyominoCoordinate !== null &&
      getSelfCoordinateIsCollideWithTetris(selfPolyominoCoordinate)
    ) {
      isCollide = true;
    }
    return isCollide;
  }, [selfPolyominoCoordinate, getSelfCoordinateIsCollideWithTetris]);

  React.useLayoutEffect(
    function notifyOtherGameDataChange() {
      const updatedQueue: GameDataUpdatedQueue = [];
      if (prevSelfNextPolyominoType.current !== selfNextPolyominoType) {
        updatedQueue.push({
          type: GameDataType.NEXT_POLYOMINO_TYPE,
          data: selfNextPolyominoType,
        });
        setRef(prevSelfNextPolyominoType, selfNextPolyominoType);
      }
      if (prevSelfPolyomino.current !== selfPolyomino) {
        updatedQueue.push({
          type: GameDataType.POLYOMINO,
          data: selfPolyomino,
        });
        setRef(prevSelfPolyomino, selfPolyomino);
      }
      if (prevSelfTetris.current !== selfTetris) {
        updatedQueue.push({
          type: GameDataType.TETRIS,
          data: selfTetris,
        });
        setRef(prevSelfTetris, selfTetris);
      }
      if (prevSelfScore.current !== selfScore) {
        updatedQueue.push({
          type: GameDataType.SCORE,
          data: selfScore,
        });
        setRef(prevSelfScore, selfScore);
      }
      if (isConnected && updatedQueue.length > 0) {
        socketInstance.emit("game_data_updated", updatedQueue);
      }
    },
    [
      selfTetris,
      selfScore,
      selfPolyomino,
      selfNextPolyominoType,
      socketInstance,
      isConnected,
    ]
  );

  React.useEffect(
    function handleKeyDown() {
      const isRegisterKeyDownHandler =
        roomState === ROOM_STATE.START &&
        (gameState === GAME_STATE.START ||
          gameState === GAME_STATE.NEXT_CYCLE ||
          gameState === GAME_STATE.POLYOMINO_FALLING);
      function keydownHandler(e: KeyboardEvent) {
        // console.log("keyCode is " + e.keyCode);
        if (e.keyCode === 37) {
          moveSelfPolyomino(DIRECTION.LEFT);
        } else if (e.keyCode === 39) {
          moveSelfPolyomino(DIRECTION.RIGHT);
        } else if (e.keyCode === 40) {
          moveSelfPolyomino(DIRECTION.DOWN);
        } else if (e.keyCode === 38) {
          changeSelfPolyominoShape();
        } else if (e.keyCode === 32) {
          moveSelfPolyominoToPreview();
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
      roomState,
      gameState,
      changeSelfPolyominoShape,
      moveSelfPolyomino,
      moveSelfPolyominoToPreview,
    ]
  );

  React.useEffect(
    function handleGameStateChange() {
      let effectCleaner = () => {};
      switch (gameState) {
        case GAME_STATE.BEFORE_START:
          break;
        case GAME_STATE.START:
          setGameState(GAME_STATE.NEXT_CYCLE);
          break;
        case GAME_STATE.NEXT_CYCLE:
          handlePolyominoCreate();
          handleNextPolyominoTypeCreate();
          setGameState(GAME_STATE.CHECK_IS_POLYOMINO_COLLIDE_WITH_TETRIS);
          break;
        case GAME_STATE.CHECK_IS_POLYOMINO_COLLIDE_WITH_TETRIS:
          if (checkIsPolyominoCollideWithTetris()) {
            setGameState(GAME_STATE.ALL_ROW_FILLING);
            fillSelfAllRow().then(() => {
              resetSelfPolyomino();
              resetSelfTetris();
              setGameState(GAME_STATE.NEXT_CYCLE);
            });
          } else {
            setGameState(GAME_STATE.POLYOMINO_FALLING);
          }
          break;
        case GAME_STATE.ALL_ROW_FILLING:
          break;
        case GAME_STATE.GAME_OVER:
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
            emptyRowGap.length === 0 ||
            (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
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
      checkIsPolyominoCollideWithTetris,
      handleNextPolyominoTypeCreate,
      handlePolyominoCreate,
      getSelfEmptyRow,
      getSelfRowFilledWithCube,
      fillSelfEmptyRow,
      handlePolyominoFalling,
      clearSelfRowFilledWithCube,
      setGameState,
      setSelfScore,
      handleGameOver,
      fillSelfAllRow,
      resetSelfPolyomino,
      resetSelfTetris,
    ]
  );

  React.useEffect(
    function socketHandler() {
      if (isConnected) {
        socketInstance.on("before_start_game", (leftSec) => {
          if (roomState !== ROOM_STATE.BEFORE_START) {
            setSelfNextPolyominoType(getRandomPolyominoType());
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
        socketInstance.on("game_interrupted", () => {
          setGameState(GAME_STATE.GAME_OVER);
          setRoomState(ROOM_STATE.INTERRUPTED);
        });
        socketInstance.on("game_over", () => {
          setRoomState(ROOM_STATE.END);
          setGameState(GAME_STATE.GAME_OVER);
        });
        socketInstance.on(
          "other_game_data_updated",
          (updatedQueue: GameDataUpdatedQueue) => {
            updatedQueue.forEach(({ type, data }) => {
              if (type === GameDataType.NEXT_POLYOMINO_TYPE) {
                setOpponentNextPolyominoType(data as POLYOMINO_TYPE);
              } else if (type === GameDataType.SCORE) {
                setOpponentScore(data as number);
              } else if (type === GameDataType.TETRIS) {
                setOpponentTetris(data as ITetris["tetris"]);
              } else if (type === GameDataType.POLYOMINO) {
                setOpponentPolyomino(data as IPolyomino);
              }
            });
          }
        );
      }
      return () => {
        if (isConnected) {
          socketInstance.off("before_start_game");
          socketInstance.off("game_start");
          socketInstance.off("game_leftSec");
          socketInstance.off("game_interrupted");
          socketInstance.off("game_over");
          socketInstance.off("other_game_data_updated");
        }
      };
    },
    [
      setRoomState,
      roomState,
      setOpponentTetris,
      setOpponentPolyomino,
      socketInstance,
      isConnected,
    ]
  );

  return (
    <Game.Double
      self={{
        score: (fontSize) => <Score fontSize={fontSize} score={selfScore} />,
        next: (cubeDistance) => (
          <Next
            cubeDistance={cubeDistance}
            polyominoType={selfNextPolyominoType}
          />
        ),
        tetris: (cubeDistance) => (
          <Tetris
            cubeDistance={cubeDistance}
            tetris={selfTetris}
            polyomino={selfPolyominoCoordinate}
            previewPolyomino={selfPreviewPolyomino}
          />
        ),
      }}
      opponent={{
        score: (fontSize) => (
          <Score fontSize={fontSize} score={opponentScore} />
        ),
        next: (cubeDistance) => (
          <Next
            cubeDistance={cubeDistance}
            polyominoType={opponentNextPolyominoType}
          />
        ),
        tetris: (cubeDistance) => (
          <Tetris
            cubeDistance={cubeDistance}
            tetris={opponentTetris}
            polyomino={opponentPolyominoCoordinate}
            previewPolyomino={opponentPreviewPolyomino}
          />
        ),
      }}
      countdown={() => <div>{leftSec}</div>}
      roomStateNotifier={() => {
        let notifier = null;
        if (
          roomState === ROOM_STATE.READY ||
          roomState === ROOM_STATE.WAIT_OTHER_READY
        ) {
          notifier = (
            <Overlay.Ready>
              <div>READY OR NOT</div>
              <button className="nes-btn" onClick={handleReady}>
                <span
                  className={roomState === ROOM_STATE.READY ? "" : "waiting"}
                >
                  {roomState === ROOM_STATE.READY ? "READY" : "WAIT"}
                </span>
              </button>
              <button onClick={handleLeaveRoom} className="nes-btn">
                QUIT
              </button>
            </Overlay.Ready>
          );
        } else if (roomState === ROOM_STATE.BEFORE_START) {
          notifier = (
            <Overlay.BeforeStart>{beforeStartCountDown}</Overlay.BeforeStart>
          );
        } else if (roomState === ROOM_STATE.INTERRUPTED) {
          notifier = (
            <Overlay.Interrupted>
              <div>INTERRUPTED</div>
              <button onClick={handleLeaveRoom} className="nes-btn">
                QUIT
              </button>
            </Overlay.Interrupted>
          );
        } else if (roomState === ROOM_STATE.END) {
          notifier = (
            <Overlay.End>
              <div>YOU WIN!</div>
              <button onClick={handleNextGame} className="nes-btn">
                NEXT
              </button>
              <button onClick={handleLeaveRoom} className="nes-btn">
                QUIT
              </button>
            </Overlay.End>
          );
        } else if (roomState === ROOM_STATE.ERROR) {
          notifier = (
            <Overlay.Error>
              <div>ERROR</div>
              <button onClick={handleLeaveRoom} className="nes-btn">
                QUIT
              </button>
            </Overlay.Error>
          );
        }

        return notifier;
      }}
    />
  );
};

export default Room;

import React from "react";
import { DIRECTION, getRandomPolyominoType, POLYOMINO_TYPE } from "../common/polyomino";
import Tetris, { ITetris } from "../components/Tetris";
import Game from "../components/Game";
import Next from "../components/Next";
import Score from "../components/Score";
import Room from "../components/Room";
import useTetris from "../hooks/tetris";
import getSocketInstance from "../common/socket/index";
import http from "../common/http";
import { useNavigate } from "react-router-dom";
import { IPolyomino } from "../hooks/polyomino";
import { CountDownTimer, setRef } from "../common/utils";

const socket = getSocketInstance();

export enum GAME_STATE {
  BEFORE_START,
  START,
  NEXT_CYCLE,
  POLYOMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  ROW_FILLED_CLEARING,
  CHECK_IS_ROW_EMPTY,
  ROW_EMPTY_FILLING,
  CHECK_IS_GAME_OVER,
  GAME_OVER,
  GAME_OVER_PENDING,
}

export enum ROOM_STATE {
  INITIAL,
  WAITING,
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

const Single = (): JSX.Element => {
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
    getPolyominoIsCollideWithNearbyCube: getSelfPolyominoIsCollideWithNearbyCube,
    getCoordinateIsCollideWithTetris: getSelfCoordinateIsCollideWithTetris,
    previewPolyomino: selfPreviewPolyomino,
    pauseClearRowAnimation: pauseSelfClearRowAnimation,
    pauseFillRowAnimation: pauseSelfFillRowAnimation,
  } = useTetris();

  const {
    polyominoCoordinate: opponentPolyominoCoordinate,
    tetris: opponentTetris,
    setTetris: setOpponentTetris,
    setPolyomino: setOpponentPolyomino,
    previewPolyomino: opponentPreviewPolyomino,
  } = useTetris();

  const navigate = useNavigate();

  const [beforeStartCountDown, setBeforeStartCountDown] = React.useState<number>(0);

  const [leftSec, setLeftSec] = React.useState<number | undefined>(undefined);

  const [roomState, setRoomState] = React.useState<ROOM_STATE>(ROOM_STATE.INITIAL);

  const [selfNextPolyominoType, setSelfNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(null);

  const [selfScore, setSelfScore] = React.useState<number>(0);

  const [opponentNextPolyominoType, setOpponentNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(null);

  const [opponentScore, setOpponentScore] = React.useState<number>(0);

  const [gameState, setGameState] = React.useState<GAME_STATE>(GAME_STATE.BEFORE_START);

  const prevSelfPolyomino = React.useRef<IPolyomino>(selfPolyomino);

  const prevSelfTetris = React.useRef<ITetris["tetris"]>(selfTetris);

  const prevSelfScore = React.useRef<number | undefined>(selfScore);

  const prevSelfNextPolyominoType = React.useRef<POLYOMINO_TYPE>(selfNextPolyominoType);

  const { current: polyominoFallingTimer } = React.useRef<CountDownTimer>(new CountDownTimer(0.5, true));

  const { current: polyominoCollideBottomTimer } = React.useRef<CountDownTimer>(new CountDownTimer(0.8, true));

  const handleReady = React.useCallback(() => {
    socket.emit("ready", (isReady: boolean) => {
      setRoomState(ROOM_STATE.WAIT_OTHER_READY);
      if (isReady) {
        console.log("everyone is ready");
      } else {
        console.log("other is not ready");
      }
    });
  }, []);

  const handleNextGame = React.useCallback(() => {
    socket.emit("leave_game", () => {
      setRoomState(ROOM_STATE.WAITING);
      socket.emit("try_join_game", (isJoined: boolean) => {
        if (!isJoined) {
          console.log("not yet!");
        } else {
          console.log("waiting someone to joined");
        }
      });
    });
  }, []);

  const handleBackToIndex = React.useCallback(() => {
    http.post("game/offline").then(() => {
      socket.disconnect();
      socket.off();
      navigate("/");
    });
  }, [navigate]);

  const handlePolyominoFalling = React.useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const { isBottomCollide } = getSelfPolyominoIsCollideWithNearbyCube();
      // console.log("isBottomCollide " + isBottomCollide);
      if (isBottomCollide) {
        polyominoFallingTimer.clear();
        polyominoCollideBottomTimer.start(() => {
          polyominoCollideBottomTimer.clear();
          setSelfPolyominoToTetris();
          resolve(isBottomCollide);
        });
      } else {
        polyominoCollideBottomTimer.clear();
        polyominoFallingTimer.start(() => {
          polyominoFallingTimer.clear();
          moveSelfPolyomino(DIRECTION.DOWN);
          resolve(isBottomCollide);
        });
      }
    });
  }, [
    getSelfPolyominoIsCollideWithNearbyCube,
    moveSelfPolyomino,
    polyominoCollideBottomTimer,
    polyominoFallingTimer,
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
    resetSelfTetris();
    resetSelfPolyomino();
    polyominoFallingTimer.pause();
    polyominoCollideBottomTimer.pause();
  }, [resetSelfTetris, resetSelfPolyomino, polyominoFallingTimer, polyominoCollideBottomTimer]);

  const handlePauseGame = React.useCallback(() => {
    pauseSelfClearRowAnimation();
    pauseSelfFillRowAnimation();
    polyominoFallingTimer.pause();
    polyominoCollideBottomTimer.pause();
  }, [pauseSelfClearRowAnimation, pauseSelfFillRowAnimation, polyominoCollideBottomTimer, polyominoFallingTimer]);

  const checkIsPolyominoCollideWithTetris = React.useCallback(() => {
    let isCollide = false;
    if (selfPolyominoCoordinate !== null && getSelfCoordinateIsCollideWithTetris(selfPolyominoCoordinate)) {
      isCollide = true;
    }
    return isCollide;
  }, [selfPolyominoCoordinate, getSelfCoordinateIsCollideWithTetris]);

  React.useEffect(
    function handleKeyDown() {
      const isRegisterKeyDownHandler =
        roomState === ROOM_STATE.START ||
        gameState === GAME_STATE.START ||
        gameState === GAME_STATE.NEXT_CYCLE ||
        gameState === GAME_STATE.POLYOMINO_FALLING;
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
    [roomState, gameState, changeSelfPolyominoShape, moveSelfPolyomino]
  );

  React.useEffect(
    function handleGameStateChange() {
      switch (gameState) {
        case GAME_STATE.BEFORE_START:
          break;
        case GAME_STATE.START:
          setGameState(GAME_STATE.NEXT_CYCLE);
          break;
        case GAME_STATE.NEXT_CYCLE:
          handlePolyominoCreate();
          handleNextPolyominoTypeCreate();
          setGameState(GAME_STATE.CHECK_IS_GAME_OVER);
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
          setGameState(GAME_STATE.GAME_OVER_PENDING);
          const nextRoundCountDownTimer = new CountDownTimer(2, true);
          nextRoundCountDownTimer.start(() => {
            setGameState(GAME_STATE.NEXT_CYCLE);
          });
          break;
        case GAME_STATE.GAME_OVER_PENDING:
          break;
        case GAME_STATE.POLYOMINO_FALLING:
          handlePolyominoFalling().then((isBottomCollide) => {
            if (isBottomCollide) {
              setGameState(GAME_STATE.CHECK_IS_ROW_FILLED);
            }
          });
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
    ]
  );

  React.useEffect(
    function socketHandler() {
      if (roomState === ROOM_STATE.INITIAL) {
        setRoomState(ROOM_STATE.WAITING);
        return;
      }
      socket.on("connect", () => {
        console.log("connected");
        socket.emit("try_join_game", (isJoined: boolean) => {
          if (!isJoined) {
            console.log("not yet!");
          } else {
            console.log("waiting someone to joined");
          }
        });
      });
      socket.on("join_game", () => {
        setRoomState(ROOM_STATE.READY);
      });
      socket.on("before_start_game", (leftSec: number) => {
        if (roomState !== ROOM_STATE.BEFORE_START) {
          setSelfNextPolyominoType(getRandomPolyominoType());
          setRoomState(ROOM_STATE.BEFORE_START);
        }
        console.log("left sec is ", leftSec);
        setBeforeStartCountDown(leftSec);
      });
      socket.on("game_start", () => {
        if (roomState !== ROOM_STATE.START) {
          setGameState(GAME_STATE.START);
          setRoomState(ROOM_STATE.START);
        }
      });
      socket.on("game_leftSec", (leftSec: number) => {
        setLeftSec(leftSec);
      });
      socket.on("game_interrupted", () => {
        handlePauseGame();
        setRoomState(ROOM_STATE.INTERRUPTED);
      });
      socket.on("game_over", () => {
        handlePauseGame();
        setRoomState(ROOM_STATE.END);
      });
      socket.on("connect_error", (err) => {
        handlePauseGame();
        setRoomState(ROOM_STATE.ERROR);
        socket.disconnect();
      });
      socket.on("disconnect", () => {
        console.log("disconnect");
      });
      socket.on("other_game_data_updated", (updatedQueue: GameDataUpdatedQueue) => {
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
      });
      return () => {
        socket.off();
      };
    },
    [setRoomState, roomState, setOpponentTetris, setOpponentPolyomino, handlePauseGame]
  );

  React.useEffect(
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
      if (updatedQueue.length > 0) {
        socket.emit("game_data_updated", updatedQueue);
      }
    },
    [selfTetris, selfScore, selfPolyomino, selfNextPolyominoType]
  );

  return (
    <Game.Double
      self={{
        score: (fontSize) => <Score fontSize={fontSize} score={selfScore} />,
        next: (cubeDistance) => <Next cubeDistance={cubeDistance} polyominoType={selfNextPolyominoType} />,
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
        score: (fontSize) => <Score fontSize={fontSize} score={opponentScore} />,
        next: (cubeDistance) => <Next cubeDistance={cubeDistance} polyominoType={opponentNextPolyominoType} />,
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
        if (roomState === ROOM_STATE.WAITING) {
          notifier = <Room.Waiting>WAIT</Room.Waiting>;
        } else if (roomState === ROOM_STATE.READY || roomState === ROOM_STATE.WAIT_OTHER_READY) {
          notifier = (
            <Room.Ready>
              <div>JOIN GAME</div>
              <button className="nes-btn" onClick={handleReady}>
                <span className={roomState === ROOM_STATE.READY ? "" : "waiting"}>
                  {roomState === ROOM_STATE.READY ? "READY" : "WAIT"}
                </span>
              </button>
              <button onClick={handleBackToIndex} className="nes-btn">
                QUIT
              </button>
            </Room.Ready>
          );
        } else if (roomState === ROOM_STATE.BEFORE_START) {
          notifier = <Room.BeforeStart>{beforeStartCountDown}</Room.BeforeStart>;
        } else if (roomState === ROOM_STATE.INTERRUPTED) {
          notifier = (
            <Room.Interrupted>
              <div>INTERRUPTED</div>
              <button onClick={handleNextGame} className="nes-btn">
                NEXT
              </button>
              <button onClick={handleBackToIndex} className="nes-btn">
                QUIT
              </button>
            </Room.Interrupted>
          );
        } else if (roomState === ROOM_STATE.END) {
          notifier = (
            <Room.End>
              <div>YOU WIN!</div>
              <button onClick={handleNextGame} className="nes-btn">
                NEXT
              </button>
              <button onClick={handleBackToIndex} className="nes-btn">
                QUIT
              </button>
            </Room.End>
          );
        } else if (roomState === ROOM_STATE.ERROR) {
          notifier = (
            <Room.Error>
              <div>ERROR</div>
              <button onClick={handleBackToIndex} className="nes-btn">
                QUIT
              </button>
            </Room.Error>
          );
        }

        return notifier;
      }}
    />
  );
};

export default Single;

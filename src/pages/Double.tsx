import React from "react";
import { DIRECTION, getRandomPolyominoType, POLYOMINO_TYPE } from "../common/polyomino";
import Tetris, { ITetris } from "../components/Tetris";
import Game from "../components/Game";
import Next from "../components/Next";
import Score from "../components/Score";
import Room from "../components/Room";
import useTetris from "../hooks/tetris";
import createSocketInstance from "../common/socket/index";
import http from "../common/http";
import { useNavigate } from "react-router-dom";
import { IPolyomino } from "../hooks/polyomino";
import { setRef } from "../common/utils";

export enum GAME_STATE {
  GAME_START,
  GAME_RESTART,
  NEXT_CYCLE,
  POLYOMINO_FALLING,
  CHECK_IS_ROW_FILLED,
  ROW_FILLED_CLEARING,
  CHECK_IS_ROW_EMPTY,
  ROW_EMPTY_FILLING,
  GAME_OVER,
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
  } = useTetris();

  const {
    polyominoCoordinate: opponentPolyominoCoordinate,
    tetris: opponentTetris,
    setTetris: setOpponentTetris,
    setPolyomino: setOpponentPolyomino,
    previewPolyomino: opponentPreviewPolyomino,
  } = useTetris();

  const navigate = useNavigate();

  const { current: socket } = React.useRef(createSocketInstance());

  const [beforeStartCountDown, setBeforeStartCountDown] = React.useState<number>(0);

  const [leftSec, setLeftSec] = React.useState<number | undefined>(undefined);

  const [roomState, setRoomState] = React.useState<ROOM_STATE>(ROOM_STATE.INITIAL);

  const [selfNextPolyominoType, setSelfNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(null);

  const [selfScore, setSelfScore] = React.useState<number>(0);

  const [opponentNextPolyominoType, setOpponentNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(null);

  const [opponentScore, setOpponentScore] = React.useState<number>(0);

  const prevSelfPolyomino = React.useRef<IPolyomino>(selfPolyomino);
  const prevSelfTetris = React.useRef<ITetris["tetris"]>(selfTetris);
  const prevSelfScore = React.useRef<number | undefined>(selfScore);
  const prevSelfNextPolyominoType = React.useRef<POLYOMINO_TYPE>(selfNextPolyominoType);

  const ready = React.useCallback(() => {
    socket.emit("ready", (isReady: boolean) => {
      setRoomState(ROOM_STATE.WAIT_OTHER_READY);
      if (isReady) {
        console.log("everyone is ready");
      } else {
        console.log("other is not ready");
      }
    });
  }, [socket]);

  const nextGame = React.useCallback(() => {
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
  }, [socket]);

  const backToIndex = React.useCallback(() => {
    http.post("game/offline").then(() => {
      socket.disconnect();
      socket.off();
      navigate("/");
    });
  }, [navigate, socket]);

  React.useEffect(
    function handleKeyDown() {
      const isRegisterKeyDownHandler = roomState === ROOM_STATE.START;
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
    [roomState, changeSelfPolyominoShape, moveSelfPolyomino]
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
          setRoomState(ROOM_STATE.BEFORE_START);
          const nextPolyominoType = getRandomPolyominoType();
          setSelfNextPolyominoType(nextPolyominoType);
        }
        console.log("left sec is ", leftSec);
        setBeforeStartCountDown(leftSec);
      });
      socket.on("game_start", () => {
        if (roomState !== ROOM_STATE.START) {
          setRoomState(ROOM_STATE.START);
        }
      });
      socket.on("game_leftSec", (leftSec: number) => {
        setLeftSec(leftSec);
      });
      socket.on("game_interrupted", () => {
        setRoomState(ROOM_STATE.INTERRUPTED);
      });
      socket.on("game_over", () => {
        setRoomState(ROOM_STATE.END);
      });
      socket.on("connect_error", (err) => {
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
    [setRoomState, socket, roomState, setOpponentTetris, setOpponentPolyomino]
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
    [selfTetris, selfScore, selfPolyomino, selfNextPolyominoType, socket]
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
              <button className="nes-btn" onClick={ready}>
                <span className={roomState === ROOM_STATE.READY ? "" : "waiting"}>
                  {roomState === ROOM_STATE.READY ? "READY" : "WAIT"}
                </span>
              </button>
              <button onClick={backToIndex} className="nes-btn">
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
              <button onClick={nextGame} className="nes-btn">
                NEXT
              </button>
              <button onClick={backToIndex} className="nes-btn">
                QUIT
              </button>
            </Room.Interrupted>
          );
        } else if (roomState === ROOM_STATE.END) {
          notifier = (
            <Room.End>
              <div>YOU WIN!</div>
              <button onClick={nextGame} className="nes-btn">
                NEXT
              </button>
              <button onClick={backToIndex} className="nes-btn">
                QUIT
              </button>
            </Room.End>
          );
        } else if (roomState === ROOM_STATE.ERROR) {
          notifier = (
            <Room.Error>
              <div>ERROR</div>
              <button onClick={backToIndex} className="nes-btn">
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

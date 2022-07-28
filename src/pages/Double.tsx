import React from "react";
import { getRandomPolyominoType, POLYOMINO_TYPE } from "../common/polyomino";
import Tetris from "../components/Tetris";
import Game from "../components/Game";
import Next from "../components/Next";
import Score from "../components/Score";
import useTetris from "../hooks/tetris";
import createSocketInstance from "../common/socket/index";
import styled, { keyframes, css } from "styled-components";
import http from "../common/http";
import { useNavigate } from "react-router-dom";

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

const DotWaiting = css`
  &::before {
    content: "";
    display: block;
    position: absolute;
    right: 0;
    bottom: 50%;
    transform: translateX(100%) translateY(50%);
    animation: ${keyframes`
      33% { 
        display: block;
        content: "." 
      }
      66% { 
        display: block;
        content: ".." 
      }
      99% { 
        display: block;
        content: "..." 
      }
    `} 1.5s linear infinite;
  }
`;

const Waiting = styled.div`
  position: relative;
  ${DotWaiting}
`;

const NotifierWithButton = css`
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    font-size: 16px;
    width: 150px;
    margin-top: 16px;
  }
`;

const Ready = styled.div`
  ${NotifierWithButton}

  .waiting {
    position: relative;
    left: -10px;
    ${DotWaiting}
  }
`;

const End = styled.div`
  ${NotifierWithButton}
`;

const Interrupted = styled.div`
  ${NotifierWithButton}
`;

const Error = styled.div`
  ${NotifierWithButton}
`;

const BeforeStart = styled.div``;

const Single = (): JSX.Element => {
  const {
    polyominoCoordinate,
    setPolyominoToTetrisData,
    tetrisData,
    createPolyomino,
    movePolyomino,
    changePolyominoShape,
    clearRowFilledWithCube,
    getRowFilledWithCube,
    getEmptyRow,
    fillEmptyRow,
    getPolyominoIsCollideWithNearbyCube,
    getCoordinateIsCollideWithTetris,
    previewPolyomino,
    pauseClearRowAnimation,
    continueClearRowAnimation,
    pauseFillRowAnimation,
    continueFillRowAnimation,
  } = useTetris();

  const navigate = useNavigate();

  const { current: socket } = React.useRef(createSocketInstance());

  const [beforeStartCountDown, setBeforeStartCountDown] = React.useState<number>(0);

  const [leftSec, setLeftSec] = React.useState<number | undefined>(undefined);

  const [roomState, setRoomState] = React.useState<ROOM_STATE>(ROOM_STATE.INITIAL);

  const [nextPolyominoType, setNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(null);

  const [score, setScore] = React.useState<number>(0);

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

  React.useEffect(() => {
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
        setNextPolyominoType(getRandomPolyominoType());
      }
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
    return () => {
      socket.off();
    };
  }, [setRoomState, socket, roomState]);

  return (
    <Game.Double
      self={{
        score: (fontSize) => <Score fontSize={fontSize} score={score} />,
        next: (cubeDistance) => <Next cubeDistance={cubeDistance} polyominoType={nextPolyominoType} />,
        tetris: (cubeDistance) => (
          <Tetris
            cubeDistance={cubeDistance}
            tetris={tetrisData}
            polyomino={polyominoCoordinate}
            previewPolyomino={previewPolyomino}
          />
        ),
      }}
      opponent={{
        score: (fontSize) => <Score fontSize={fontSize} score={score} />,
        next: (cubeDistance) => <Next cubeDistance={cubeDistance} polyominoType={nextPolyominoType} />,
        tetris: (cubeDistance) => (
          <Tetris
            cubeDistance={cubeDistance}
            tetris={tetrisData}
            polyomino={polyominoCoordinate}
            previewPolyomino={previewPolyomino}
          />
        ),
      }}
      countdown={() => <div>{leftSec}</div>}
      roomStateNotifier={() => {
        let notifier = null;
        if (roomState === ROOM_STATE.WAITING) {
          notifier = <Waiting>WAIT</Waiting>;
        } else if (roomState === ROOM_STATE.READY || roomState === ROOM_STATE.WAIT_OTHER_READY) {
          notifier = (
            <Ready>
              <div>JOIN GAME</div>
              <button className="nes-btn" onClick={ready}>
                <span className={roomState === ROOM_STATE.READY ? "" : "waiting"}>
                  {roomState === ROOM_STATE.READY ? "READY" : "WAIT"}
                </span>
              </button>
              <button onClick={backToIndex} className="nes-btn">
                QUIT
              </button>
            </Ready>
          );
        } else if (roomState === ROOM_STATE.BEFORE_START) {
          notifier = <BeforeStart>{beforeStartCountDown}</BeforeStart>;
        } else if (roomState === ROOM_STATE.INTERRUPTED) {
          notifier = (
            <Interrupted>
              <div>INTERRUPTED</div>
              <button onClick={nextGame} className="nes-btn">
                NEXT
              </button>
              <button onClick={backToIndex} className="nes-btn">
                QUIT
              </button>
            </Interrupted>
          );
        } else if (roomState === ROOM_STATE.END) {
          notifier = (
            <End>
              <div>YOU WIN!</div>
              <button onClick={nextGame} className="nes-btn">
                NEXT
              </button>
              <button onClick={backToIndex} className="nes-btn">
                QUIT
              </button>
            </End>
          );
        } else if (roomState === ROOM_STATE.ERROR) {
          notifier = (
            <Error>
              <div>ERROR</div>
              <button onClick={backToIndex} className="nes-btn">
                QUIT
              </button>
            </Error>
          );
        }

        return notifier;
      }}
    />
  );
};

export default Single;

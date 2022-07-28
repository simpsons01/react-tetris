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

export enum ROOM_STATE {
  INITIAL,
  WAITING,
  READY,
  BEFORE_START,
  START,
  END,
  INTERRUPTED,
}

const Waiting = styled.div`
  position: relative;

  &::after {
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
`;

const End = styled.div`
  ${NotifierWithButton}
`;

const Interrupted = styled.div`
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

  const { current: socket } = React.useRef(createSocketInstance());

  const [roomState, setRoomState] = React.useState<ROOM_STATE>(ROOM_STATE.INITIAL);

  const [nextPolyominoType, setNextPolyominoType] = React.useState<POLYOMINO_TYPE>(getRandomPolyominoType());

  const [score, setScore] = React.useState<number>(0);

  // React.useEffect(() => {
  //   async function connect() {
  //     await http.post<{ name: string; socketId: string; roomId: string }>("/game/online");
  //     socket.on("connect", () => {
  //       console.log("connected");
  //       socket.emit("try_join_game", (isJoined: boolean) => {
  //         if (!isJoined) {
  //           console.log("not yet!");
  //         }
  //       });
  //     });
  //     socket.on("join_game", (sec) => {
  //       socket.emit("ready", (isReady: boolean) => {
  //         if (isReady) {
  //           console.log("i am ready");
  //         }
  //       });
  //     });
  //     // @ts-ignore
  //     window.temp = () => {
  //       socket.emit("try_join_game", (isJoined: boolean) => {
  //         if (!isJoined) {
  //           console.log("not yet!");
  //         }
  //       });
  //     };
  //     socket.on("before_start_game", (leftSec: number) => {
  //       console.log("before game start and leftSec is " + leftSec + "s");
  //     });
  //     socket.on("game_interrupted", () => {
  //       console.log("game_interrupted");
  //       socket.emit("leave_game");
  //     });
  //     socket.on("game_leftSec", (leftSec: number) => {
  //       console.log("game start and leftSec is " + leftSec + " s");
  //     });
  //     socket.on("game_over", (result) => {
  //       console.log(result);
  //       socket.emit("leave_game");
  //     });
  //     socket.on("connect_error", (err) => {
  //       socket.disconnect();
  //       console.log(err);
  //     });
  //     socket.on("disconnect", () => {
  //       console.log("disconnect");
  //     });
  //   }

  //   connect();
  // }, []);

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
      countdown={() => <div>60</div>}
      roomStateNotifier={() => {
        let notifier = null;
        if (roomState === ROOM_STATE.WAITING) {
          notifier = <Waiting>WAITING</Waiting>;
        } else if (roomState === ROOM_STATE.READY) {
          notifier = (
            <Ready>
              <div>JOIN GAME</div>
              <button className="nes-btn">READY</button>
              <button className="nes-btn">QUIT</button>
            </Ready>
          );
        } else if (roomState === ROOM_STATE.BEFORE_START) {
          notifier = <BeforeStart>1</BeforeStart>;
        } else if (roomState === ROOM_STATE.INTERRUPTED) {
          notifier = (
            <Interrupted>
              <div>INTERRUPTED</div>
              <button className="nes-btn">NEXT</button>
              <button className="nes-btn">QUIT</button>
            </Interrupted>
          );
        } else if (roomState === ROOM_STATE.END) {
          notifier = (
            <End>
              <div>YOU WIN!</div>
              <button className="nes-btn">NEXT</button>
              <button className="nes-btn">QUIT</button>
            </End>
          );
        }
        return notifier;
      }}
    />
  );
};

export default Single;

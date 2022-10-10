import React from "react";
import {
  DIRECTION,
  getRandomPolyominoType,
  POLYOMINO_TYPE,
  ICube,
  POLYOMINO_ROTATION,
} from "../common/polyomino";
import { IPlayFieldRenderer as ITetris } from "../components/PlayField/Renderer";
import Overlay from "../components/Overlay";
import Loading from "../components/Loading";
import useTetris from "../hooks/tetris";
import { useNavigate } from "react-router-dom";
import { IPolyomino } from "../hooks/polyomino";
import { CountDownTimer, createAlertModal, setRef } from "../common/utils";
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
  font-size: 1.5rem;
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
  PARTICIPANT_LEAVE,
  HOST_LEAVE,
  ERROR,
}

enum GameDataType {
  NEXT_POLYOMINO_TYPE = "NEXT_POLYOMINO_TYPE",
  POLYOMINO = "POLYOMINO",
  TETRIS = "TETRIS",
  SCORE = "SCORE",
}

enum RESULT {
  WIN,
  LOSE,
  TIE,
}

type GameData = IPolyomino | ITetris["tetris"] | POLYOMINO_TYPE | number | null;

type GameDataUpdatedPayloads = Array<{ data: GameData; type: GameDataType }>;

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
    getPolyominoIsCollideWithNearbyCube: getSelfPolyominoIsCollideWithNearbyCube,
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

  const navigate = useNavigate();

  const {
    mode: { double: doubleSizeConfig },
    font: fontConfig,
  } = useSizeConfigContext();

  const { socketInstance, isConnected } = React.useContext<
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

  const [isCheckComplete, setIsCheckComplete] = React.useState(false);

  const [beforeStartCountDown, setBeforeStartCountDown] = React.useState<number>(0);

  const [result, setResult] = React.useState<number>(RESULT.LOSE);

  const [leftSec, setLeftSec] = React.useState<number | null>(null);

  const [roomState, setRoomState] = React.useState<ROOM_STATE>(ROOM_STATE.READY);

  const [selfNextPolyominoType, setSelfNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(null);

  const [selfScore, setSelfScore] = React.useState<number>(0);

  const [opponentNextPolyominoType, setOpponentNextPolyominoType] = React.useState<POLYOMINO_TYPE | null>(
    null
  );

  const [opponentScore, setOpponentScore] = React.useState<number>(0);

  const [gameState, setGameState] = React.useState<GAME_STATE>(GAME_STATE.BEFORE_START);

  const prevSelfPolyomino = React.useRef<IPolyomino>(selfPolyomino);

  const prevSelfTetris = React.useRef<ITetris["tetris"]>(selfTetris);

  const prevSelfScore = React.useRef<number | undefined>(selfScore);

  const prevSelfNextPolyominoType = React.useRef<POLYOMINO_TYPE>(selfNextPolyominoType);

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

  const handleNextGame = React.useCallback(() => {
    if (isConnected) {
      socketInstance.emit("reset_room", ({ metadata: { isSuccess, isError, message } }) => {
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
  }, [getSelfPolyominoIsCollideWithNearbyCube, moveSelfPolyomino, setSelfPolyominoToTetris]);

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
  }, [pauseSelfClearRowAnimation, pauseSelfFillRowAnimation, pauseSelfFillAllRowAnimation]);

  const checkIsPolyominoCollideWithTetris = React.useCallback(() => {
    let isCollide = false;
    if (selfPolyominoCoordinate !== null && getSelfCoordinateIsCollideWithTetris(selfPolyominoCoordinate)) {
      isCollide = true;
    }
    return isCollide;
  }, [selfPolyominoCoordinate, getSelfCoordinateIsCollideWithTetris]);

  React.useLayoutEffect(
    function notifyOtherGameDataChange() {
      const updatedPayloads: GameDataUpdatedPayloads = [];
      if (prevSelfNextPolyominoType.current !== selfNextPolyominoType) {
        updatedPayloads.push({
          type: GameDataType.NEXT_POLYOMINO_TYPE,
          data: selfNextPolyominoType,
        });
        setRef(prevSelfNextPolyominoType, selfNextPolyominoType);
      }
      if (prevSelfPolyomino.current !== selfPolyomino) {
        updatedPayloads.push({
          type: GameDataType.POLYOMINO,
          data: selfPolyomino,
        });
        setRef(prevSelfPolyomino, selfPolyomino);
      }
      if (prevSelfTetris.current !== selfTetris) {
        updatedPayloads.push({
          type: GameDataType.TETRIS,
          data: selfTetris,
        });
        setRef(prevSelfTetris, selfTetris);
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
    [selfTetris, selfScore, selfPolyomino, selfNextPolyominoType, socketInstance, isConnected]
  );

  React.useEffect(() => {
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
          changeSelfPolyominoShape(POLYOMINO_ROTATION.CLOCK_WISE);
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
    [roomState, gameState, changeSelfPolyominoShape, moveSelfPolyomino, moveSelfPolyominoToPreview]
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
      setOpponentTetris,
      setOpponentPolyomino,
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
              fontSize={fontConfig.level.five}
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
              cubeDistance={doubleSizeConfig.playField.cube}
              tetris={selfTetris}
              polyomino={selfPolyominoCoordinate}
              previewPolyomino={selfPreviewPolyomino}
            />
          </PlayField.Wrapper>
        </Column>
        <Column
          width={doubleSizeConfig.widget.displayNumber.width}
          height={doubleSizeConfig.playField.height}
        >
          <Widget.NextPolyomino
            fontSize={fontConfig.level.five}
            cubeDistance={doubleSizeConfig.widget.nextPolyomino.cube}
            polyominoType={selfNextPolyominoType}
            width={doubleSizeConfig.widget.nextPolyomino.width}
            height={doubleSizeConfig.widget.nextPolyomino.height}
          />
        </Column>
      </SelfGame>
      <Divider></Divider>
      <CountDown className="nes-container">{leftSec}</CountDown>
      <OpponentGame>
        <Column
          width={doubleSizeConfig.widget.displayNumber.width}
          height={doubleSizeConfig.playField.height}
        >
          <Widget.NextPolyomino
            fontSize={fontConfig.level.five}
            cubeDistance={doubleSizeConfig.widget.nextPolyomino.cube}
            polyominoType={selfNextPolyominoType}
            width={doubleSizeConfig.widget.nextPolyomino.width}
            height={doubleSizeConfig.widget.nextPolyomino.height}
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
              cubeDistance={doubleSizeConfig.playField.cube}
              tetris={opponentTetris}
              polyomino={opponentPolyominoCoordinate}
              previewPolyomino={opponentPreviewPolyomino}
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
              fontSize={fontConfig.level.five}
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
                <Font fontSize={fontConfig.level.one} color="#fff">
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
                <Font fontSize={fontConfig.level.one} color="#fff">
                  {beforeStartCountDown}
                </Font>
              </Notifier>
            );
          } else if (roomState === ROOM_STATE.PARTICIPANT_LEAVE) {
            notifier = (
              <NotifierWithButton>
                <Font fontSize={fontConfig.level.one} color="#fff">
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
                <Font fontSize={fontConfig.level.one} color="#fff">
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
                <Font fontSize={fontConfig.level.one} color="#fff">
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
                <Font fontSize={fontConfig.level.one} color="#fff">
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

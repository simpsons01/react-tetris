import type { FC } from "react";
import type { IPlayFieldRenderer } from "../components/PlayField/Renderer";
import type { IRoomPlayer } from "../utils/rooms";
import type { ICube, ICoordinate } from "../utils/tetrimino";
import {
  DIRECTION,
  TETRIMINO_TYPE,
  TETRIMINO_ROTATION_DIRECTION,
  TETRIMINO_MOVE_TYPE,
  getCoordinateByAnchorAndShapeAndType,
  getSizeByCoordinates,
} from "../utils/tetrimino";
import styled from "styled-components";
import Overlay from "../components/Overlay";
import Loading from "../components/Loading";
import useMatrix from "../hooks/matrix";
import useNextTetriminoBag from "../hooks/nextTetriminoBag";
import Widget from "../components/Widget";
import Font from "../components/Font";
import PlayField from "../components/PlayField";
import useCustomRef from "../hooks/customRef";
import useHoldTetrimino from "../hooks/holdTetrimino";
import useKeydownAutoRepeat from "../hooks/keydownAutoRepeat";
import useSocket from "../hooks/socket";
import useGetter from "../hooks/getter";
import * as KEYCODE from "keycode-js";
import { useNavigate, useParams } from "react-router-dom";
import { createCountDownTimer } from "../utils/timer";
import { ClientToServerCallback, EVENT_OPERATION_STATUS } from "../utils/socket";
import { useSizeConfigContext } from "../context/sizeConfig";
import { DISPLAY_ZONE_ROW_START, MATRIX_PHASE } from "../utils/matrix";
import {
  getLevelByLine,
  getScoreByTSpinAndLevelAndLine,
  getTetriminoFallingDelayByLevel,
} from "../utils/game";
import { useSettingModalVisibilityContext } from "../context/settingModalVisibility";
import { getToken } from "../utils/token";
import { usePlayerContext } from "../context/player";
import { useSettingContext } from "../context/setting";
import { useCallback, useState, useEffect, useMemo, useLayoutEffect, Fragment } from "react";

const Wrapper = styled.div`
  position: relative;
  height: calc(70vh + 8px);
  display: flex;
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
  width: 5vh;
  height: 5vh;
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

const Column = styled.div`
  position: relative;
  flex: 0 0 auto;
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
    font-size: 1rem;
    width: 150px;
    margin-top: 16px;
  }
`;

const Name = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  padding: 8px;
  transform: translate(-50%, calc(-100% - 4px));
  border-bottom: 0;
`;

const ToolList = styled.ul`
  li {
    &:before {
      color: #fff !important;
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
  width: 4vh;
  height: 4vh;

  &:after {
    position: absolute;
    content: "";
    display: block;
    background-color: #fff;
    width: 4vh;
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
    width: 4vh;
    height: 4px;
    left: 0;
    top: 15px;
    transform: rotate(135deg);
  }
`;

const Settings = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1001;

  button {
    border: none;
    background-color: transparent;
  }

  img {
    display: block;
    max-width: 100%;
  }
`;

enum ROOM_STATE {
  CONNECTING = "CONNECTING",
  SELF_NOT_READY = "SELF_NOT_READY",
  WAIT_OTHER_READY = "WAIT_OTHER_READY",
  BEFORE_GAME_START = "BEFORE_GAME_START",
  GAME_START = "GAME_START",
  GAME_END = "GAME_END",
  PARTICIPANT_LEAVE = "PARTICIPANT_LEAVE",
  HOST_LEAVE = "HOST_LEAVE",
  ERROR = "ERROR",
}

enum GAME_STATE_TYPE {
  NEXT_TETRIMINO_BAG = "NEXT_TETRIMINO_BAG",
  HOLD_TETRIMINO = "HOLD_TETRIMINO",
  MATRIX = "MATRIX",
  SCORE = "SCORE",
  LEVEL = "LEVEL",
  LINE = "LINE",
}

enum RESULT {
  WIN,
  LOSE,
  TIE,
}

type GameDataUpdatedPayloads = Array<{ data: any; type: GAME_STATE_TYPE }>;

const selfTetriminoFallingTimer = createCountDownTimer();

const selfTetriminoCollideBottomTimer = createCountDownTimer();

const Room: FC = () => {
  const navigate = useNavigate();

  const { playable: isPlayable } = useSizeConfigContext();

  const {
    setting: { control: controlSetting },
  } = useSettingContext();

  const { playerRef } = usePlayerContext();

  const {
    open: openSettingModal,
    close: closeSettingModal,
    isOpen: isSettingModalOpen,
  } = useSettingModalVisibilityContext();

  const { id: roomId } = useParams();

  const { socketInstanceRef, isConnected, isConnectErrorOccur, isDisconnected, isSocketInstanceNotNil } =
    useSocket<
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
        room_config: (done: ClientToServerCallback<{ initialLevel: number }>) => void;
        ready: (done: ClientToServerCallback<{ players?: Array<IRoomPlayer> }>) => void;
        leave_room: (done: ClientToServerCallback<{}>) => void;
        force_leave_room: (done: ClientToServerCallback<{}>) => void;
        reset_room: (done: ClientToServerCallback<{}>) => void;
        game_data_updated: (updatedPayloads: GameDataUpdatedPayloads) => void;
        ping: (done: ClientToServerCallback<{}>) => void;
      }
    >(getToken() as string, {
      roomId,
      playerId: playerRef.current.id,
      playerName: playerRef.current.name,
    });

  // self state
  const {
    tetrimino: selfTetrimino,
    matrix: selfMatrix,
    displayMatrix: selfDisplayMatrix,
    displayTetriminoCoordinates: selfDisplayTetriminoCoordinates,
    resetPrevTetriminoRef: resetSelfPrevTetriminoRef,
    tetriminoMoveTypeRecordRef: selfTetriminoMoveTypeRecordRef,
    tetriminoCoordinates: selfTetriminoCoordinates,
    setPrevTetriminoRef: setSelfPrevTetriminoRef,
    setTetriminoMoveTypeRecordRef: setSelfTetriminoMoveTypeRecordRef,
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
    getIsCoordinatesLockOut: getSelfIsCoordinatesLockOut,
    getTSpinType: getSelfTSpinType,
    setLastTetriminoRotateWallKickPositionRef: setSelfLastTetriminoRotateWallKickPositionRef,
  } = useMatrix();

  const freshMoveSelfTetrimino = useGetter(moveSelfTetrimino);

  const freshChangeSelfTetriminoShape = useGetter(changeSelfTetriminoShape);

  const {
    nextTetriminoBag: selfNextTetriminoBag,
    popNextTetriminoType: popSelfNextTetriminoType,
    initialNextTetriminoBag: initialSelfNextTetriminoBag,
    setNextTetriminoBag: setSelfNextTetriminoBag,
  } = useNextTetriminoBag(false);

  const {
    isHoldableRef: isSelfHoldableRef,
    holdTetrimino: selfHoldTetrimino,
    changeHoldTetrimino: changeSelfHoldTetrimino,
    setIsHoldableRef: setIsSelfHoldableRef,
    setHoldTetrimino: setSelfHoldTetrimino,
  } = useHoldTetrimino();

  const [selfScore, setSelfScore] = useState(0);

  const [selfLine, setSelfLine] = useState(0);

  const [selfLevel, setSelfLevel] = useState(1);

  const [selfTetriminoFallingDelay, setSelfTetriminoFallingDelay] = useState(
    getTetriminoFallingDelayByLevel(selfLevel)
  );

  const [selfMatrixPhase, setSelfMatrixPhase] = useState<MATRIX_PHASE | null>(null);

  const [selfName, setSelfName] = useState("");

  const [isSelMatrixAnimationRunningRef, setIsSelMatrixAnimationRunningRef] = useCustomRef(false);

  const [isSelfHardDropRef, setIsSelfHardDropRef] = useCustomRef(false);

  const [prevSelfRenderTetriminoRef, setPrevSelfRenderTetriminoRef] = useCustomRef(selfTetrimino);

  const [prevSelfRenderMatrixRef, setPrevSelfRenderMatrixRef] = useCustomRef(selfMatrix);

  const [prevSelfRenderScoreRef, setPrevSelfRenderScoreRef] = useCustomRef(selfScore);

  const [prevSelfRenderLineRef, setPrevSelfRenderLineRef] = useCustomRef(selfLine);

  const [prevSelfRenderLevelRef, setPrevSelfRenderLevelRef] = useCustomRef(selfLevel);

  const [prevSelfRenderNextTetriminoBagRef, setPrevSelfRenderNextTetriminoBagRef] =
    useCustomRef(selfNextTetriminoBag);

  const [prevSelfRenderHoldTetriminoRef, setPrevSelRenderHoldTetriminoRef] = useCustomRef(selfHoldTetrimino);

  const selfPreviewTetrimino = useMemo((): Array<ICube> | null => {
    const previewCoordinate = getSelfTetriminoPreviewCoordinates();
    if (previewCoordinate !== null && selfTetrimino.type !== null) {
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y: y - DISPLAY_ZONE_ROW_START,
      })) as Array<ICube>;
    }
    return null;
  }, [getSelfTetriminoPreviewCoordinates, selfTetrimino]);

  // opponent state
  const {
    displayMatrix: opponentDisplayMatrix,
    displayTetriminoCoordinates: opponentDisplayTetriminoCoordinates,
    tetrimino: opponentTetrimino,
    setMatrix: setOpponentMatrix,
    setTetrimino: setOpponentTetrimino,
    resetTetrimino: resetOpponentTetrimino,
    resetMatrix: resetOpponentMatrix,
    getTetriminoPreviewCoordinates: getOpponentTetriminoPreviewCoordinates,
  } = useMatrix();

  const {
    nextTetriminoBag: opponentNextTetriminoBag,
    setNextTetriminoBag: setOpponentNextTetriminoBag,
    initialNextTetriminoBag: initialOpponentNextTetriminoBag,
  } = useNextTetriminoBag(false);

  const { holdTetrimino: opponentHoldTetrimino, setHoldTetrimino: setOpponentHoldTetrimino } =
    useHoldTetrimino();

  const [opponentScore, setOpponentScore] = useState(0);

  const [opponentLine, setOpponentLine] = useState(0);

  const [opponentLevel, setOpponentLevel] = useState(1);

  const [opponentName, setOpponentName] = useState("");

  const opponentPreviewTetrimino = useMemo((): Array<ICube> | null => {
    const previewCoordinate = getOpponentTetriminoPreviewCoordinates();
    if (previewCoordinate !== null && opponentTetrimino.type !== null) {
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y: y - DISPLAY_ZONE_ROW_START,
      })) as Array<ICube>;
    }
    return null;
  }, [getOpponentTetriminoPreviewCoordinates, opponentTetrimino]);

  const [beforeStartCountDown, setBeforeStartCountDown] = useState<number>(0);

  const [result, setResult] = useState<number | null>(null);

  const [leftSec, setLeftSec] = useState<number | null>(null);

  const [roomState, setRoomState] = useState<ROOM_STATE>(ROOM_STATE.CONNECTING);

  const [isToolOverlayOpen, setIsToolOverlayOpen] = useState(false);

  const [gameInitialLevelRef, setGameInitialLevelRef] = useCustomRef(1);

  const isGameStart = useMemo(() => roomState === ROOM_STATE.GAME_START, [roomState]);

  const handleResetAllSelfState = useCallback(() => {
    resetSelfMatrix();
    resetSelfTetrimino();
    setSelfLevel(gameInitialLevelRef.current);
    setSelfScore(0);
    setSelfLine(0);
    setSelfTetriminoFallingDelay(getTetriminoFallingDelayByLevel(gameInitialLevelRef.current));
    setSelfHoldTetrimino(null);
    setSelfMatrixPhase(null);
    setSelfLastTetriminoRotateWallKickPositionRef(0);
    setSelfTetriminoMoveTypeRecordRef([]);
    setIsSelfHardDropRef(false);
    setIsSelfHoldableRef(false);
    resetSelfPrevTetriminoRef();
    setSelfNextTetriminoBag([]);
  }, [
    gameInitialLevelRef,
    resetSelfMatrix,
    resetSelfPrevTetriminoRef,
    resetSelfTetrimino,
    setIsSelfHardDropRef,
    setIsSelfHoldableRef,
    setSelfHoldTetrimino,
    setSelfLastTetriminoRotateWallKickPositionRef,
    setSelfTetriminoMoveTypeRecordRef,
    setSelfNextTetriminoBag,
  ]);

  const handleResetAllOpponentState = useCallback(() => {
    resetOpponentMatrix();
    resetOpponentTetrimino();
    setOpponentHoldTetrimino(null);
    setOpponentNextTetriminoBag([]);
    setOpponentScore(0);
    setOpponentLevel(gameInitialLevelRef.current);
    setOpponentLine(0);
  }, [
    gameInitialLevelRef,
    resetOpponentMatrix,
    resetOpponentTetrimino,
    setOpponentHoldTetrimino,
    setOpponentNextTetriminoBag,
  ]);

  const handleResetGameState = useCallback(() => {
    setResult(null);
    setLeftSec(null);
    setRoomState(ROOM_STATE.SELF_NOT_READY);
  }, []);

  const handleSelfReady = useCallback(() => {
    if (isSocketInstanceNotNil(socketInstanceRef.current)) {
      socketInstanceRef.current.emit("ready", ({ data: { players }, metadata: { status } }) => {
        if (status === EVENT_OPERATION_STATUS.SUCCESS) {
          setRoomState(ROOM_STATE.WAIT_OTHER_READY);
          if (players) {
            players.forEach((player) => {
              if (player.id === playerRef.current.id) {
                setSelfName(player.name);
              } else {
                setOpponentName(player.name);
              }
            });
          }
        }
      });
    }
  }, [socketInstanceRef, playerRef, isSocketInstanceNotNil]);

  const handleSelfNextGame = useCallback(() => {
    if (isSocketInstanceNotNil(socketInstanceRef.current)) {
      socketInstanceRef.current.emit("reset_room", ({ metadata: { status } }) => {
        if (status === EVENT_OPERATION_STATUS.SUCCESS) {
          handleResetAllSelfState();
          handleResetAllOpponentState();
          handleResetGameState();
        }
      });
    }
  }, [
    socketInstanceRef,
    handleResetAllSelfState,
    handleResetAllOpponentState,
    handleResetGameState,
    isSocketInstanceNotNil,
  ]);

  const handleRoomConfig = useCallback(() => {
    if (isSocketInstanceNotNil(socketInstanceRef.current)) {
      socketInstanceRef.current.emit("room_config", ({ data: { initialLevel }, metadata: { status } }) => {
        if (status === EVENT_OPERATION_STATUS.SUCCESS) {
          setGameInitialLevelRef(initialLevel);
          setOpponentLevel(initialLevel);
          setSelfLevel(initialLevel);
          setSelfTetriminoFallingDelay(getTetriminoFallingDelayByLevel(initialLevel));
        }
      });
    }
  }, [socketInstanceRef, setGameInitialLevelRef, isSocketInstanceNotNil]);

  const handleSelfLeaveRoom = useCallback(
    (path = "/rooms") => {
      navigate(path);
    },
    [navigate]
  );

  const handleSelfTetriminoCreate = useCallback(
    (nextTetriminoType?: TETRIMINO_TYPE) => {
      // console.log("create Tetrimino!");
      let isCreatedSuccess = false;
      nextTetriminoType = nextTetriminoType ? nextTetriminoType : popSelfNextTetriminoType();
      const spawnTetrimino = getSelfSpawnTetrimino(nextTetriminoType);
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
      if (!getSelfCoordinatesIsCollideWithFilledCube(spawnTetriminoCoordinates)) {
        if (getSelfCoordinatesIsCollideWithFilledCube(nextSpawnTetriminoCoordinates)) {
          setSelfTetrimino(spawnTetrimino);
        } else {
          setSelfTetrimino(nextSpawnTetrimino);
        }
        isCreatedSuccess = true;
        return isCreatedSuccess;
      }
      return isCreatedSuccess;
    },
    [
      getSelfCoordinatesIsCollideWithFilledCube,
      getSelfSpawnTetrimino,
      popSelfNextTetriminoType,
      setSelfTetrimino,
    ]
  );

  const handleSelfMatrixNextCycle = useCallback(() => {
    resetSelfMatrix();
    resetSelfTetrimino();
    setSelfTetriminoFallingDelay(getTetriminoFallingDelayByLevel(gameInitialLevelRef.current));
    setSelfHoldTetrimino(null);
    setSelfLastTetriminoRotateWallKickPositionRef(0);
    setSelfTetriminoMoveTypeRecordRef([]);
    setIsSelfHardDropRef(false);
    setIsSelfHoldableRef(false);
    resetSelfPrevTetriminoRef();
  }, [
    gameInitialLevelRef,
    resetSelfMatrix,
    resetSelfPrevTetriminoRef,
    resetSelfTetrimino,
    setIsSelfHardDropRef,
    setIsSelfHoldableRef,
    setSelfHoldTetrimino,
    setSelfLastTetriminoRotateWallKickPositionRef,
    setSelfTetriminoMoveTypeRecordRef,
  ]);

  const handlePauseSelfMatrixAnimation = useCallback(() => {
    pauseSelfClearRowAnimation();
    pauseSelfFillAllRowAnimation();
    pauseSelfFillRowAnimation();
    selfTetriminoFallingTimer.clear();
    selfTetriminoCollideBottomTimer.clear();
  }, [pauseSelfClearRowAnimation, pauseSelfFillAllRowAnimation, pauseSelfFillRowAnimation]);

  useLayoutEffect(() => {
    const updatedPayloads: GameDataUpdatedPayloads = [];
    [
      {
        type: GAME_STATE_TYPE.NEXT_TETRIMINO_BAG,
        current: selfNextTetriminoBag,
        prevRef: prevSelfRenderNextTetriminoBagRef,
        syncPrevRef: () => setPrevSelfRenderNextTetriminoBagRef(selfNextTetriminoBag),
        condition: () => true,
      },
      {
        type: GAME_STATE_TYPE.MATRIX,
        current: selfMatrix,
        prevRef: prevSelfRenderMatrixRef,
        syncPrevRef: () => setPrevSelfRenderMatrixRef(selfMatrix),
        condition: () => !isSelMatrixAnimationRunningRef.current,
      },
      {
        type: GAME_STATE_TYPE.SCORE,
        current: selfScore,
        prevRef: prevSelfRenderScoreRef,
        syncPrevRef: () => setPrevSelfRenderScoreRef(selfScore),
        condition: () => true,
      },
      {
        type: GAME_STATE_TYPE.LEVEL,
        current: selfLevel,
        prevRef: prevSelfRenderLevelRef,
        syncPrevRef: () => setPrevSelfRenderLevelRef(selfLevel),
        condition: () => true,
      },
      {
        type: GAME_STATE_TYPE.HOLD_TETRIMINO,
        current: selfHoldTetrimino,
        prevRef: prevSelfRenderHoldTetriminoRef,
        syncPrevRef: () => setPrevSelRenderHoldTetriminoRef(selfHoldTetrimino),
        condition: () => true,
      },
      {
        type: GAME_STATE_TYPE.LINE,
        current: selfLine,
        prevRef: prevSelfRenderLineRef,
        syncPrevRef: () => setPrevSelfRenderLineRef(selfLine),
        condition: () => true,
      },
    ].forEach(({ type, current, prevRef, syncPrevRef, condition }) => {
      if (condition() && current !== prevRef.current) {
        updatedPayloads.push({ type, data: current });
        syncPrevRef();
      }
    });
    if (isSocketInstanceNotNil(socketInstanceRef.current) && updatedPayloads.length > 0) {
      socketInstanceRef.current.emit("game_data_updated", updatedPayloads);
    }
  }, [
    prevSelfRenderHoldTetriminoRef,
    prevSelfRenderLevelRef,
    prevSelfRenderLineRef,
    prevSelfRenderMatrixRef,
    prevSelfRenderNextTetriminoBagRef,
    prevSelfRenderScoreRef,
    prevSelfRenderTetriminoRef,
    selfHoldTetrimino,
    selfLevel,
    selfLine,
    selfMatrix,
    selfNextTetriminoBag,
    selfScore,
    selfTetrimino,
    socketInstanceRef,
    isSelMatrixAnimationRunningRef,
    setPrevSelRenderHoldTetriminoRef,
    setPrevSelfRenderLevelRef,
    setPrevSelfRenderLineRef,
    setPrevSelfRenderMatrixRef,
    setPrevSelfRenderNextTetriminoBagRef,
    setPrevSelfRenderScoreRef,
    setPrevSelfRenderTetriminoRef,
    isSocketInstanceNotNil,
  ]);

  const onKeyDown = useGetter((e: KeyboardEvent) => {
    if (isGameStart && selfMatrixPhase === MATRIX_PHASE.TETRIMINO_FALLING) {
      if (e.key === controlSetting.moveLeft) {
        const isSuccess = freshMoveSelfTetrimino(DIRECTION.LEFT);
        if (isSuccess) {
          setSelfTetriminoMoveTypeRecordRef([
            ...selfTetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.LEFT_MOVE,
          ]);
        }
      } else if (e.key === controlSetting.moveRight) {
        const isSuccess = freshMoveSelfTetrimino(DIRECTION.RIGHT);
        if (isSuccess) {
          setSelfTetriminoMoveTypeRecordRef([
            ...selfTetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.RIGHT_MOVE,
          ]);
        }
      } else if (e.key === controlSetting.softDrop) {
        const isSuccess = freshMoveSelfTetrimino(DIRECTION.DOWN);
        if (isSuccess) {
          setSelfTetriminoMoveTypeRecordRef([
            ...selfTetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.SOFT_DROP,
          ]);
        }
      } else if (e.key === controlSetting.clockwiseRotation) {
        const isSuccess = freshChangeSelfTetriminoShape(TETRIMINO_ROTATION_DIRECTION.CLOCK_WISE);
        if (isSuccess) {
          setSelfTetriminoMoveTypeRecordRef([
            ...selfTetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.CLOCK_WISE_ROTATE,
          ]);
        }
      } else if (e.key === controlSetting.counterclockwiseRotation) {
        const isSuccess = freshChangeSelfTetriminoShape(TETRIMINO_ROTATION_DIRECTION.COUNTER_CLOCK_WISE);
        if (isSuccess) {
          setSelfTetriminoMoveTypeRecordRef([
            ...selfTetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.COUNTER_CLOCK_WISE_ROTATE,
          ]);
        }
      } else if (e.key === controlSetting.hardDrop) {
        selfTetriminoFallingTimer.clear();
        setIsSelfHardDropRef(true);
        const isSuccess = moveSelfTetriminoToPreview();
        if (isSuccess) {
          setSelfTetriminoMoveTypeRecordRef([
            ...selfTetriminoMoveTypeRecordRef.current,
            TETRIMINO_MOVE_TYPE.HARD_DROP,
          ]);
        }
      } else if (e.key === controlSetting.hold) {
        setSelfTetriminoMoveTypeRecordRef([]);
        if (selfMatrixPhase === MATRIX_PHASE.TETRIMINO_FALLING && isSelfHoldableRef.current) {
          if (selfTetriminoFallingTimer.isPending()) {
            selfTetriminoFallingTimer.clear();
          }
          if (selfTetriminoCollideBottomTimer.isPending()) {
            selfTetriminoCollideBottomTimer.clear();
          }
          const prevHoldTetrimino = changeSelfHoldTetrimino(selfTetrimino.type as TETRIMINO_TYPE);
          let isCreatedSuccess = false;
          if (prevHoldTetrimino) {
            isCreatedSuccess = handleSelfTetriminoCreate(prevHoldTetrimino);
          } else {
            isCreatedSuccess = handleSelfTetriminoCreate();
          }
          if (isCreatedSuccess) {
            setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
          } else {
            setSelfMatrixPhase(null);
            setIsSelMatrixAnimationRunningRef(true);
            fillSelfAllRow().then(() => {
              setIsSelMatrixAnimationRunningRef(false);
              handleSelfMatrixNextCycle();
              setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
            });
          }
        }
      }
    }
    if (e.key === KEYCODE.VALUE_ESCAPE) {
      if (isToolOverlayOpen) {
        setIsToolOverlayOpen(false);
        if (isSettingModalOpen()) {
          closeSettingModal();
        }
      } else {
        setIsToolOverlayOpen(true);
      }
    }
  });

  const selfTetriminoFallingTimerHandler = useGetter(() => {
    const isSuccess = freshMoveSelfTetrimino(DIRECTION.DOWN);
    if (isSuccess) {
      setSelfTetriminoMoveTypeRecordRef([
        ...selfTetriminoMoveTypeRecordRef.current,
        TETRIMINO_MOVE_TYPE.AUTO_FALLING,
      ]);
    }
  });

  useKeydownAutoRepeat([KEYCODE.VALUE_LEFT, KEYCODE.VALUE_RIGHT, KEYCODE.VALUE_DOWN], onKeyDown);

  useEffect(() => {
    let effectCleaner = () => {};
    if (selfMatrixPhase) {
      switch (selfMatrixPhase) {
        case MATRIX_PHASE.TETRIMINO_CREATE:
          const isCreatedSuccess = handleSelfTetriminoCreate();
          if (isCreatedSuccess) {
            setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
          } else {
            setSelfMatrixPhase(null);
            setIsSelMatrixAnimationRunningRef(true);
            fillSelfAllRow().then(() => {
              setIsSelMatrixAnimationRunningRef(false);
              handleSelfMatrixNextCycle();
              setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
            });
          }
          break;
        case MATRIX_PHASE.TETRIMINO_FALLING:
          const { isBottomCollide } = getSelfTetriminoIsCollideWithNearbyCube();
          if (isBottomCollide) {
            const _ = () => {
              if (getSelfIsCoordinatesLockOut(selfTetriminoCoordinates as Array<ICoordinate>)) {
                setSelfMatrixPhase(null);
                setIsSelMatrixAnimationRunningRef(true);
                fillSelfAllRow().then(() => {
                  setIsSelMatrixAnimationRunningRef(false);
                  handleSelfMatrixNextCycle();
                  setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
                });
              } else {
                setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_LOCK);
              }
            };
            if (isSelfHardDropRef.current) {
              _();
            } else {
              selfTetriminoCollideBottomTimer.start(() => {
                _();
              }, 500);
            }
          } else {
            if (!selfTetriminoFallingTimer.isPending()) {
              selfTetriminoFallingTimer.start(() => {
                selfTetriminoFallingTimerHandler();
              }, selfTetriminoFallingDelay);
            }
          }
          effectCleaner = () => {
            if (isBottomCollide) {
              selfTetriminoFallingTimer.clear();
              selfTetriminoCollideBottomTimer.clear();
            } else {
              selfTetriminoCollideBottomTimer.clear();
            }
          };
          break;
        case MATRIX_PHASE.TETRIMINO_LOCK:
          setSelfPrevTetriminoRef(selfTetrimino);
          setIsSelfHoldableRef(true);
          setIsSelfHardDropRef(false);
          setSelfTetriminoToMatrix();
          resetSelfTetrimino();
          setSelfMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_FILLED);
          break;
        case MATRIX_PHASE.CHECK_IS_ROW_FILLED:
          const tSpinType = getSelfTSpinType();
          const filledRow = getSelfRowFilledWithCube();
          if (filledRow.length > 0) {
            setSelfMatrixPhase(MATRIX_PHASE.ROW_FILLED_CLEARING);
            const nextLineValue = selfLine + filledRow.length;
            const nextLevel = getLevelByLine(nextLineValue, selfLevel);
            setSelfScore(
              (prevSelfScore) =>
                prevSelfScore + getScoreByTSpinAndLevelAndLine(tSpinType, selfLevel, filledRow.length)
            );
            setSelfLine(nextLineValue);
            setSelfLevel(nextLevel);
            setSelfTetriminoFallingDelay(getTetriminoFallingDelayByLevel(nextLevel));
            setSelfLastTetriminoRotateWallKickPositionRef(0);
            setSelfTetriminoMoveTypeRecordRef([]);
            setIsSelMatrixAnimationRunningRef(true);
            clearSelfRowFilledWithCube(filledRow).then(() => {
              setIsSelMatrixAnimationRunningRef(false);
              setSelfMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setSelfLastTetriminoRotateWallKickPositionRef(0);
            setSelfTetriminoMoveTypeRecordRef([]);
            setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
          }
          break;
        case MATRIX_PHASE.ROW_FILLED_CLEARING:
          break;
        case MATRIX_PHASE.CHECK_IS_ROW_EMPTY:
          const emptyRowGap = getSelfEmptyRow();
          const isGapNotExist =
            emptyRowGap.length === 0 || (emptyRowGap.length === 1 && emptyRowGap[0].empty.length === 0);
          if (!isGapNotExist) {
            //console.log("fill empty row!");
            setSelfMatrixPhase(MATRIX_PHASE.ROW_EMPTY_FILLING);
            setIsSelMatrixAnimationRunningRef(true);
            fillSelfEmptyRow(emptyRowGap).then(() => {
              setIsSelMatrixAnimationRunningRef(false);
              setSelfMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
          }
          break;
        case MATRIX_PHASE.ROW_EMPTY_FILLING:
          break;
        default:
          break;
      }
    }

    return effectCleaner;
  }, [
    selfLevel,
    selfLine,
    selfMatrixPhase,
    selfTetrimino,
    selfTetriminoCoordinates,
    selfTetriminoFallingDelay,
    isSelfHardDropRef,
    selfTetriminoMoveTypeRecordRef,
    selfTetriminoFallingTimerHandler,
    clearSelfRowFilledWithCube,
    setIsSelMatrixAnimationRunningRef,
    fillSelfAllRow,
    fillSelfEmptyRow,
    getSelfEmptyRow,
    getSelfIsCoordinatesLockOut,
    getSelfRowFilledWithCube,
    getSelfTSpinType,
    getSelfTetriminoIsCollideWithNearbyCube,
    handleSelfMatrixNextCycle,
    handleSelfTetriminoCreate,
    moveSelfTetrimino,
    resetSelfTetrimino,
    setIsSelfHardDropRef,
    setIsSelfHoldableRef,
    setSelfLastTetriminoRotateWallKickPositionRef,
    setSelfPrevTetriminoRef,
    setSelfTetriminoMoveTypeRecordRef,
    setSelfTetriminoToMatrix,
  ]);

  useEffect(() => {
    if (isConnected && isSocketInstanceNotNil(socketInstanceRef.current)) {
      if (roomState === ROOM_STATE.CONNECTING) {
        setRoomState(ROOM_STATE.SELF_NOT_READY);
        handleRoomConfig();
      }
      socketInstanceRef.current.on("before_start_game", (leftSec) => {
        if (roomState !== ROOM_STATE.BEFORE_GAME_START) {
          initialOpponentNextTetriminoBag();
          initialSelfNextTetriminoBag();
          setRoomState(ROOM_STATE.BEFORE_GAME_START);
        }
        // console.log("before game start left sec is ", leftSec);
        setBeforeStartCountDown(leftSec);
      });
      socketInstanceRef.current.on("game_start", () => {
        if (roomState !== ROOM_STATE.GAME_START) {
          setRoomState(ROOM_STATE.GAME_START);
          setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
        }
      });
      socketInstanceRef.current.on("game_leftSec", (leftSec: number) => {
        setLeftSec(leftSec);
      });
      socketInstanceRef.current.on("game_over", ({ isTie, winnerId }) => {
        setSelfMatrixPhase(null);
        handlePauseSelfMatrixAnimation();
        if (isTie) {
          setResult(RESULT.TIE);
        } else {
          if (playerRef.current.id === winnerId) {
            setResult(RESULT.WIN);
          } else {
            setResult(RESULT.LOSE);
          }
        }
        setRoomState(ROOM_STATE.GAME_END);
      });
      socketInstanceRef.current.on("other_game_data_updated", (updatedPayloads: GameDataUpdatedPayloads) => {
        updatedPayloads.forEach(({ type, data }) => {
          if (type === GAME_STATE_TYPE.SCORE) {
            setOpponentScore(data as number);
          } else if (type === GAME_STATE_TYPE.MATRIX) {
            setOpponentMatrix(data as IPlayFieldRenderer["matrix"]);
          } else if (type === GAME_STATE_TYPE.NEXT_TETRIMINO_BAG) {
            setOpponentNextTetriminoBag(data as Array<TETRIMINO_TYPE>);
          } else if (type === GAME_STATE_TYPE.HOLD_TETRIMINO) {
            setOpponentHoldTetrimino(data as TETRIMINO_TYPE | null);
          } else if (type === GAME_STATE_TYPE.LEVEL) {
            setOpponentLevel(data as number);
          } else if (type === GAME_STATE_TYPE.LINE) {
            setOpponentLine(data as number);
          }
        });
      });
      socketInstanceRef.current.on("room_participant_leave", () => {
        setSelfMatrixPhase(null);
        setRoomState(ROOM_STATE.PARTICIPANT_LEAVE);
        handlePauseSelfMatrixAnimation();
      });
      socketInstanceRef.current.on("room_host_leave", () => {
        setSelfMatrixPhase(null);
        setRoomState(ROOM_STATE.HOST_LEAVE);
        handlePauseSelfMatrixAnimation();
      });
      socketInstanceRef.current.on("error_occur", () => {
        setSelfMatrixPhase(null);
        setRoomState(ROOM_STATE.ERROR);
        handlePauseSelfMatrixAnimation();
      });
    } else {
      if (isConnectErrorOccur || isDisconnected) {
        setRoomState(ROOM_STATE.ERROR);
      } else {
        setRoomState(ROOM_STATE.CONNECTING);
      }
    }
    return () => {
      if (isSocketInstanceNotNil(socketInstanceRef.current)) {
        socketInstanceRef.current.off("before_start_game");
        socketInstanceRef.current.off("game_start");
        socketInstanceRef.current.off("game_leftSec");
        socketInstanceRef.current.off("game_over");
        socketInstanceRef.current.off("other_game_data_updated");
        socketInstanceRef.current.off("room_participant_leave");
        socketInstanceRef.current.off("room_host_leave");
      }
    };
  }, [
    isConnected,
    isDisconnected,
    isConnectErrorOccur,
    playerRef,
    socketInstanceRef,
    roomState,
    handleRoomConfig,
    setRoomState,
    setOpponentMatrix,
    setOpponentTetrimino,
    setOpponentNextTetriminoBag,
    setOpponentHoldTetrimino,
    initialOpponentNextTetriminoBag,
    initialSelfNextTetriminoBag,
    handlePauseSelfMatrixAnimation,
    isSocketInstanceNotNil,
  ]);

  useEffect(() => {
    if (!isPlayable) {
      if (isSocketInstanceNotNil(socketInstanceRef.current)) {
        socketInstanceRef.current.offAny();
        socketInstanceRef.current.disconnect();
      }
      setSelfMatrixPhase(null);
      setRoomState(ROOM_STATE.ERROR);
      handlePauseSelfMatrixAnimation();
    }
  }, [socketInstanceRef, isPlayable, handlePauseSelfMatrixAnimation, isSocketInstanceNotNil]);

  useEffect(() => {
    const checkSocketLatencyInterval = 5 * 1000;
    const timer = setInterval(() => {
      if (isSocketInstanceNotNil(socketInstanceRef.current)) {
        const prev = performance.now();
        socketInstanceRef.current.emit("ping", () => {
          console.log(`socket latency is ${performance.now() - prev} ms`);
        });
      }
    }, checkSocketLatencyInterval);
    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <SelfGame>
        <Wrapper>
          <Column>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayTetrimino
                title={"HOLD"}
                fontLevel={["six", "xl-five"]}
                displayTetriminoNum={1}
                tetriminoBag={selfHoldTetrimino ? [selfHoldTetrimino] : null}
              />
            </div>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayNumber fontLevel={["six", "xl-five"]} title={"LINE"} displayValue={selfLine} />
            </div>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayNumber fontLevel={["six", "xl-five"]} title={"LEVEL"} displayValue={selfLevel} />
            </div>
            <Widget.DisplayNumber fontLevel={["six", "xl-five"]} title={"SCORE"} displayValue={selfScore} />
          </Column>
          <Column
            style={{
              margin: "0 2vh",
            }}
          >
            <PlayField.Wrapper>
              {selfName ? <Name className="nes-container">{selfName}</Name> : null}
              <PlayField.Renderer
                matrix={selfDisplayMatrix}
                tetrimino={selfDisplayTetriminoCoordinates}
                previewTetrimino={selfPreviewTetrimino}
              />
            </PlayField.Wrapper>
          </Column>
          <Column>
            <Widget.DisplayTetrimino
              title="NEXT"
              fontLevel={["six", "xl-five"]}
              displayTetriminoNum={5}
              tetriminoBag={selfNextTetriminoBag.length === 0 ? null : selfNextTetriminoBag}
            />
          </Column>
        </Wrapper>
      </SelfGame>
      <Divider></Divider>
      <CountDown className="nes-container">
        <Font level={leftSec && leftSec > 100 ? "five" : "four"}>{leftSec}</Font>
      </CountDown>
      <OpponentGame>
        <Wrapper>
          <Column>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayTetrimino
                title={"HOLD"}
                fontLevel={["six", "xl-five"]}
                displayTetriminoNum={1}
                tetriminoBag={opponentHoldTetrimino ? [opponentHoldTetrimino] : null}
              />
            </div>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayNumber
                fontLevel={["six", "xl-five"]}
                title={"LINE"}
                displayValue={opponentLine}
              />
            </div>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayNumber
                fontLevel={["six", "xl-five"]}
                title={"LEVEL"}
                displayValue={opponentLevel}
              />
            </div>
            <Widget.DisplayNumber
              fontLevel={["six", "xl-five"]}
              title={"SCORE"}
              displayValue={opponentScore}
            />
          </Column>
          <Column
            style={{
              margin: "0 2vh",
            }}
          >
            <PlayField.Wrapper>
              {opponentName ? <Name className="nes-container">{opponentName}</Name> : null}
              <PlayField.Renderer
                matrix={opponentDisplayMatrix}
                tetrimino={opponentDisplayTetriminoCoordinates}
                previewTetrimino={opponentPreviewTetrimino}
              />
            </PlayField.Wrapper>
          </Column>
          <Column>
            <Widget.DisplayTetrimino
              title="NEXT"
              fontLevel={["six", "xl-five"]}
              displayTetriminoNum={5}
              tetriminoBag={opponentNextTetriminoBag.length === 0 ? null : opponentNextTetriminoBag}
            />
          </Column>
        </Wrapper>
      </OpponentGame>
      {(() => {
        const roomStateNotifier = (() => {
          let notifier = null;
          if (roomState === ROOM_STATE.CONNECTING) {
            notifier = (
              <Notifier>
                <Font level={"one"} color="#fff">
                  <Loading.Dot>CONNECTING</Loading.Dot>
                </Font>
              </Notifier>
            );
          } else if (roomState === ROOM_STATE.SELF_NOT_READY) {
            notifier = (
              <NotifierWithButton>
                <Font level={"one"} color="#fff">
                  READY OR NOT
                </Font>
                <button className="nes-btn" onClick={handleSelfReady}>
                  READY
                </button>
                <button onClick={() => handleSelfLeaveRoom()} className="nes-btn">
                  QUIT
                </button>
              </NotifierWithButton>
            );
          } else if (roomState === ROOM_STATE.WAIT_OTHER_READY) {
            notifier = (
              <Notifier>
                <Font level={"one"} color="#fff">
                  <Loading.Dot>WAITING OTHER READY</Loading.Dot>
                </Font>
              </Notifier>
            );
          } else if (roomState === ROOM_STATE.BEFORE_GAME_START) {
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
                <button onClick={handleSelfNextGame} className="nes-btn">
                  NEXT
                </button>
                <button onClick={() => handleSelfLeaveRoom()} className="nes-btn">
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
                <button onClick={() => handleSelfLeaveRoom()} className="nes-btn">
                  QUIT
                </button>
              </NotifierWithButton>
            );
          } else if (roomState === ROOM_STATE.GAME_END) {
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
                <button onClick={handleSelfNextGame} className="nes-btn">
                  NEXT
                </button>
                <button onClick={() => handleSelfLeaveRoom()} className="nes-btn">
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
                <button onClick={() => navigate("/rooms")} className="nes-btn">
                  QUIT
                </button>
              </NotifierWithButton>
            );
          }
          return notifier;
        })();
        return roomStateNotifier !== null ? <Overlay>{roomStateNotifier}</Overlay> : null;
      })()}
      <Settings>
        <button onClick={() => setIsToolOverlayOpen(true)}>
          <img src={`${process.env.REACT_APP_STATIC_URL}/settings.png`} alt="setting" />
        </button>
      </Settings>
      {isToolOverlayOpen ? (
        <Overlay background="rgba(0, 0, 0, 0.8)">
          <ToolList className="nes-list is-circle">
            <li>
              <button onClick={() => handleSelfLeaveRoom("/")}>
                <Font color="#fff" inline={true} level={"two"}>
                  HOME
                </Font>
              </button>
            </li>
            <li>
              <button onClick={() => handleSelfLeaveRoom("/rooms")}>
                <Font color="#fff" inline={true} level={"two"}>
                  ROOMS
                </Font>
              </button>
            </li>
            <li>
              <button onClick={() => handleSelfLeaveRoom("/single")}>
                <Font color="#fff" inline={true} level={"two"}>
                  PLAY 1P
                </Font>
              </button>
            </li>
            <li>
              <button onClick={() => openSettingModal()}>
                <Font color="#fff" inline={true} level={"two"}>
                  SETTING
                </Font>
              </button>
            </li>
          </ToolList>
          <CloseBtn onClick={() => setIsToolOverlayOpen(false)} />
        </Overlay>
      ) : null}
    </Fragment>
  );
};

export default Room;

import type { FC } from "react";
import type { IPlayFieldRenderer } from "../components/PlayField/Renderer";
import type { IRoomPlayer } from "../common/rooms";
import type { ICube, ICoordinate } from "../common/tetrimino";
import type { AnyFunction } from "../common/utils";
import {
  DIRECTION,
  TETRIMINO_TYPE,
  TETRIMINO_ROTATION_DIRECTION,
  TETRIMINO_MOVE_TYPE,
  getCoordinateByAnchorAndShapeAndType,
  getSizeByCoordinates,
} from "../common/tetrimino";
import styled from "styled-components";
import Overlay from "../components/Overlay";
import Loading from "../components/Loading";
import ScoreText from "../components/ScoreText";
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
import useTimeout from "../hooks/timeout";
import useInterval from "../hooks/interval";
import * as KEYCODE from "keycode-js";
import { useNavigate, useParams } from "react-router-dom";
import { ClientToServerCallback, EVENT_OPERATION_STATUS } from "../common/socket";
import { useSizeConfigContext } from "../context/sizeConfig";
import { DISPLAY_ZONE_ROW_START, MATRIX_PHASE } from "../common/matrix";
import {
  getLevelByLine,
  getScoreByTSpinAndLevelAndLine,
  getTetriminoFallingDelayByLevel,
  getScoreTextByTSpinAndLine,
} from "../common/game";
import { useSettingModalVisibilityContext } from "../context/settingModalVisibility";
import { getToken } from "../common/token";
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

const Room: FC = () => {
  const navigate = useNavigate();

  const { playable: isPlayable } = useSizeConfigContext();

  const {
    setting: { control: controlSetting },
  } = useSettingContext();

  const { player } = usePlayerContext();

  const {
    open: openSettingModal,
    close: closeSettingModal,
    isOpen: isSettingModalOpen,
  } = useSettingModalVisibilityContext();

  const { id: roomId } = useParams();

  const {
    getSocketInstance,
    isConnected: isSocketConnected,
    isConnectErrorOccur: isSocketConnectErrorOccur,
    isDisconnected: isSocketDisConnected,
  } = useSocket<
    {
      error_occur: () => void;
      before_start_game: (leftsec: number) => void;
      game_start: (players: Array<IRoomPlayer>) => void;
      game_leftSec: (leftsec: number) => void;
      game_over: (result: { isTie: boolean; winnerId: string; loserId: string }) => void;
      room_participant_leave: () => void;
      room_host_leave: () => void;
      other_game_data_updated: (updatedPayloads: GameDataUpdatedPayloads) => void;
    },
    {
      room_config: (done: ClientToServerCallback<{ initialLevel: number }>) => void;
      ready: (done: ClientToServerCallback<{}>) => void;
      leave_room: (done: ClientToServerCallback<{}>) => void;
      force_leave_room: (done: ClientToServerCallback<{}>) => void;
      reset_room: (done: ClientToServerCallback<{}>) => void;
      game_data_updated: (updatedPayloads: GameDataUpdatedPayloads) => void;
      ping: (done: ClientToServerCallback<{}>) => void;
    }
  >(getToken() as string, {
    roomId,
    playerId: player.id,
    playerName: player.name,
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
    getRowFilledWithCube: getSelfRowFilledWithCube,
    getEmptyRow: getSelfEmptyRow,
    getTetriminoIsCollideWithNearbyCube: getSelfTetriminoIsCollideWithNearbyCube,
    getCoordinatesIsCollideWithFilledCube: getSelfCoordinatesIsCollideWithFilledCube,
    getTetriminoPreviewCoordinates: getSelfTetriminoPreviewCoordinates,
    moveTetriminoToPreview: moveSelfTetriminoToPreview,
    getIsCoordinatesLockOut: getSelfIsCoordinatesLockOut,
    getTSpinType: getSelfTSpinType,
    setLastTetriminoRotateWallKickPositionRef: setSelfLastTetriminoRotateWallKickPositionRef,
    startFillRowAnimation: startFillSelfRowAnimation,
    resetFillRowAnimation: resetFillSelfRowAnimation,
    startClearRowAnimation: startClearSelfRowAnimation,
    resetClearRowAnimation: resetClearSelfRowAnimation,
    startFillAllRowAnimation: startFillSelfAllRowAnimation,
    resetFillAllRowAnimation: resetFillSelfAllRowAnimation,
    getBottommostDisplayEmptyRow: getSelfBottommostDisplayEmptyRow,
  } = useMatrix();

  const {
    clear: clearSelfTetriminoFallingTimeout,
    isPending: isSelfTetriminoFallingTimeoutPending,
    start: starSelfTetriminoFallingTimeout,
  } = useTimeout();

  const {
    clear: clearSelfTetriminoCollideBottomTimeout,
    isPending: isSelfTetriminoCollideBottomTimeoutPending,
    start: starSelfTetriminoCollideBottomTimeout,
  } = useTimeout();

  const {
    clear: clearSelfAutoRepeat,
    isInInterval: isSelfAutoRepeating,
    start: starSelfAutoRepeat,
  } = useInterval({ autoClear: true });

  const { start: startHideSelfScoreTextTimeout } = useTimeout({ autoClear: true });

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

  const [selfScoreText, setSelfScoreText] = useState({ enter: false, text: "", coordinate: { y: 0 } });

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

  const [selfLastKeyDownKeyRef, setSelfLastKeyDownKeyRef] = useCustomRef<undefined | string>(undefined);

  const [selfLastKeyUpKeyRef, setSelfLastKeyUpKeyRef] = useCustomRef<undefined | string>(undefined);

  const [isSelfDasRef, setIsSelfDasRef] = useCustomRef(false);

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

  const { nextTetriminoBag: opponentNextTetriminoBag, setNextTetriminoBag: setOpponentNextTetriminoBag } =
    useNextTetriminoBag(false);

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
    setSelfMatrixPhase,
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
    const socketInstance = getSocketInstance();
    socketInstance.emit("ready", ({ metadata: { status } }) => {
      if (status === EVENT_OPERATION_STATUS.SUCCESS) {
        setRoomState(ROOM_STATE.WAIT_OTHER_READY);
      }
    });
  }, [getSocketInstance]);

  const handleSelfNextGame = useCallback(() => {
    const socketInstance = getSocketInstance();
    socketInstance.emit("reset_room", ({ metadata: { status } }) => {
      if (status === EVENT_OPERATION_STATUS.SUCCESS) {
        handleResetAllSelfState();
        handleResetAllOpponentState();
        handleResetGameState();
      }
    });
  }, [handleResetAllSelfState, handleResetAllOpponentState, handleResetGameState, getSocketInstance]);

  const handleRoomConfig = useCallback(() => {
    const socketInstance = getSocketInstance();
    socketInstance.emit("room_config", ({ data: { initialLevel }, metadata: { status } }) => {
      if (status === EVENT_OPERATION_STATUS.SUCCESS) {
        setGameInitialLevelRef(initialLevel);
        setOpponentLevel(initialLevel);
        setSelfLevel(initialLevel);
        setSelfTetriminoFallingDelay(getTetriminoFallingDelayByLevel(initialLevel));
      }
    });
  }, [setGameInitialLevelRef, getSocketInstance]);

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

  const freshHandleSelfTetriminoCreate = useGetter(handleSelfTetriminoCreate);

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

  const handleStartSelfFillAllRowAnimation = useCallback(() => {
    setSelfMatrixPhase(null);
    setIsSelMatrixAnimationRunningRef(true);
    startFillSelfAllRowAnimation(() => {
      setIsSelMatrixAnimationRunningRef(false);
      handleSelfMatrixNextCycle();
      setTimeout(() => {
        freshHandleSelfTetriminoCreate();
        setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
      });
    });
  }, [
    handleSelfMatrixNextCycle,
    freshHandleSelfTetriminoCreate,
    setIsSelMatrixAnimationRunningRef,
    startFillSelfAllRowAnimation,
  ]);

  const handleResetSelfMatrixEffect = useCallback(() => {
    resetFillSelfRowAnimation();
    resetClearSelfRowAnimation();
    resetFillSelfAllRowAnimation();
    clearSelfTetriminoFallingTimeout();
    clearSelfTetriminoCollideBottomTimeout();
  }, [
    resetFillSelfAllRowAnimation,
    resetClearSelfRowAnimation,
    resetFillSelfRowAnimation,
    clearSelfTetriminoCollideBottomTimeout,
    clearSelfTetriminoFallingTimeout,
  ]);

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
    if (updatedPayloads.length > 0) {
      const socketInstance = getSocketInstance();
      socketInstance.emit("game_data_updated", updatedPayloads);
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
    isSelMatrixAnimationRunningRef,
    setPrevSelRenderHoldTetriminoRef,
    setPrevSelfRenderLevelRef,
    setPrevSelfRenderLineRef,
    setPrevSelfRenderMatrixRef,
    setPrevSelfRenderNextTetriminoBagRef,
    setPrevSelfRenderScoreRef,
    setPrevSelfRenderTetriminoRef,
    getSocketInstance,
  ]);

  const autoRepeatMove = useGetter((moveType: TETRIMINO_MOVE_TYPE) => {
    if (isGameStart && selfMatrixPhase === MATRIX_PHASE.TETRIMINO_FALLING) {
      const direction =
        moveType === TETRIMINO_MOVE_TYPE.LEFT_MOVE
          ? DIRECTION.LEFT
          : moveType === TETRIMINO_MOVE_TYPE.RIGHT_MOVE
          ? DIRECTION.RIGHT
          : DIRECTION.DOWN;
      const isSuccess = freshMoveSelfTetrimino(direction);
      if (isSuccess) {
        setSelfTetriminoMoveTypeRecordRef([...selfTetriminoMoveTypeRecordRef.current, moveType]);
      }
    }
  });

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
        clearSelfTetriminoFallingTimeout();
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
          if (isSelfTetriminoFallingTimeoutPending()) {
            clearSelfTetriminoFallingTimeout();
          }
          if (isSelfTetriminoCollideBottomTimeoutPending()) {
            clearSelfTetriminoCollideBottomTimeout();
          }
          const prevHoldTetrimino = changeSelfHoldTetrimino(selfTetrimino.type as TETRIMINO_TYPE);
          let isCreatedSuccess = false;
          if (prevHoldTetrimino) {
            isCreatedSuccess = freshHandleSelfTetriminoCreate(prevHoldTetrimino);
          } else {
            isCreatedSuccess = freshHandleSelfTetriminoCreate();
          }
          if (isCreatedSuccess) {
            setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
          } else {
            handleStartSelfFillAllRowAnimation();
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
    const repeatFn = [
      {
        condition:
          e.key !== controlSetting.moveRight &&
          selfLastKeyDownKeyRef.current === controlSetting.moveRight &&
          selfLastKeyUpKeyRef.current !== controlSetting.moveRight,
        fn: () => autoRepeatMove(TETRIMINO_MOVE_TYPE.RIGHT_MOVE),
      },
      {
        condition:
          e.key !== controlSetting.moveLeft &&
          selfLastKeyDownKeyRef.current === controlSetting.moveLeft &&
          selfLastKeyUpKeyRef.current !== controlSetting.moveLeft,
        fn: () => autoRepeatMove(TETRIMINO_MOVE_TYPE.LEFT_MOVE),
      },
      {
        condition:
          e.key !== controlSetting.softDrop &&
          selfLastKeyDownKeyRef.current === controlSetting.softDrop &&
          selfLastKeyUpKeyRef.current !== controlSetting.softDrop,
        fn: () => autoRepeatMove(TETRIMINO_MOVE_TYPE.SOFT_DROP),
      },
    ].reduce<null | AnyFunction>((repeatFn, { condition, fn }) => {
      return repeatFn ? repeatFn : condition ? fn : null;
    }, null);
    if (repeatFn) {
      setIsSelfDasRef(true);
      starSelfAutoRepeat(repeatFn, 33);
    }
    setSelfLastKeyDownKeyRef(e.key);
  });

  const onKeyUp = useGetter((e: KeyboardEvent) => {
    const isDasKeyUp =
      e.key === controlSetting.moveRight ||
      e.key === controlSetting.moveLeft ||
      e.key === controlSetting.softDrop;
    if (isDasKeyUp && isSelfDasRef.current && isSelfAutoRepeating()) {
      clearSelfAutoRepeat();
    }
    setSelfLastKeyUpKeyRef(e.key);
  });

  const selfTetriminoFallingTimeoutHandler = useGetter(() => {
    const isSuccess = freshMoveSelfTetrimino(DIRECTION.DOWN);
    if (isSuccess) {
      setSelfTetriminoMoveTypeRecordRef([
        ...selfTetriminoMoveTypeRecordRef.current,
        TETRIMINO_MOVE_TYPE.AUTO_FALLING,
      ]);
    }
  });

  useKeydownAutoRepeat(
    [controlSetting.moveRight, controlSetting.moveLeft, controlSetting.softDrop],
    onKeyDown
  );

  useEffect(() => {
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  useEffect(() => {
    if (!isGameStart) {
      handleResetSelfMatrixEffect();
      return;
    }
    const handleTetriminoCreate = () => {
      const isCreatedSuccess = freshHandleSelfTetriminoCreate();
      if (isCreatedSuccess) {
        setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
      } else {
        handleStartSelfFillAllRowAnimation();
      }
    };
    let effectCleaner = () => {};
    if (selfMatrixPhase) {
      switch (selfMatrixPhase) {
        case MATRIX_PHASE.TETRIMINO_FALLING:
          const { isBottomCollide } = getSelfTetriminoIsCollideWithNearbyCube();
          if (isBottomCollide) {
            const tetriminoCollideBottomFn = () => {
              if (getSelfIsCoordinatesLockOut(selfTetriminoCoordinates as Array<ICoordinate>)) {
                handleStartSelfFillAllRowAnimation();
              } else {
                setSelfPrevTetriminoRef(selfTetrimino);
                setIsSelfHoldableRef(true);
                setIsSelfHardDropRef(false);
                setSelfTetriminoToMatrix();
                resetSelfTetrimino();
                setSelfMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_FILLED);
              }
            };
            if (isSelfHardDropRef.current) {
              tetriminoCollideBottomFn();
            } else {
              starSelfTetriminoCollideBottomTimeout(() => {
                tetriminoCollideBottomFn();
              }, 500);
            }
          } else {
            if (!isSelfTetriminoFallingTimeoutPending()) {
              starSelfTetriminoFallingTimeout(() => {
                selfTetriminoFallingTimeoutHandler();
              }, selfTetriminoFallingDelay);
            }
          }
          effectCleaner = () => {
            if (isBottomCollide) {
              clearSelfTetriminoFallingTimeout();
              clearSelfTetriminoCollideBottomTimeout();
            } else {
              clearSelfTetriminoCollideBottomTimeout();
            }
          };
          break;
        case MATRIX_PHASE.CHECK_IS_ROW_FILLED:
          const tSpinType = getSelfTSpinType();
          const filledRow = getSelfRowFilledWithCube();
          if (filledRow.length > 0) {
            setSelfMatrixPhase(MATRIX_PHASE.ROW_FILLED_CLEARING);
            const nextLineValue = selfLine + filledRow.length;
            const nextLevel = getLevelByLine(nextLineValue, selfLevel);
            const bottommostEmptyRow = getSelfBottommostDisplayEmptyRow();
            const score = getScoreByTSpinAndLevelAndLine(tSpinType, selfLevel, filledRow.length);
            setSelfScore((prevSelfScore) => prevSelfScore + score);
            setSelfLine(nextLineValue);
            setSelfLevel(nextLevel);
            setSelfScoreText({
              enter: true,
              text: `${getScoreTextByTSpinAndLine(tSpinType, filledRow.length)}+${score}`,
              coordinate: {
                y: bottommostEmptyRow === -1 ? 0 : bottommostEmptyRow,
              },
            });
            startHideSelfScoreTextTimeout(() => {
              setSelfScoreText({ enter: false, text: "", coordinate: { y: 0 } });
            }, 500);
            setSelfTetriminoFallingDelay(getTetriminoFallingDelayByLevel(nextLevel));
            setSelfLastTetriminoRotateWallKickPositionRef(0);
            setSelfTetriminoMoveTypeRecordRef([]);
            setIsSelMatrixAnimationRunningRef(true);
            startClearSelfRowAnimation(filledRow, () => {
              setIsSelMatrixAnimationRunningRef(false);
              setSelfMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            setSelfLastTetriminoRotateWallKickPositionRef(0);
            setSelfTetriminoMoveTypeRecordRef([]);
            handleTetriminoCreate();
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
            startFillSelfRowAnimation(emptyRowGap, () => {
              setIsSelMatrixAnimationRunningRef(false);
              setSelfMatrixPhase(MATRIX_PHASE.CHECK_IS_ROW_EMPTY);
            });
          } else {
            handleTetriminoCreate();
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
    isGameStart,
    selfLevel,
    selfLine,
    selfMatrixPhase,
    selfTetrimino,
    selfTetriminoCoordinates,
    selfTetriminoFallingDelay,
    isSelfHardDropRef,
    selfTetriminoMoveTypeRecordRef,
    selfTetriminoFallingTimeoutHandler,
    setIsSelMatrixAnimationRunningRef,
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
    startClearSelfRowAnimation,
    startFillSelfRowAnimation,
    startFillSelfAllRowAnimation,
    setSelfMatrixPhase,
    handleResetSelfMatrixEffect,
    starSelfTetriminoCollideBottomTimeout,
    isSelfTetriminoFallingTimeoutPending,
    starSelfTetriminoFallingTimeout,
    clearSelfTetriminoFallingTimeout,
    clearSelfTetriminoCollideBottomTimeout,
    handleStartSelfFillAllRowAnimation,
    freshHandleSelfTetriminoCreate,
  ]);

  useEffect(() => {
    const socketInstance = getSocketInstance();
    const beforeStartGameHandler = (leftSec: number) => {
      if (roomState !== ROOM_STATE.BEFORE_GAME_START) {
        initialSelfNextTetriminoBag();
        setRoomState(ROOM_STATE.BEFORE_GAME_START);
      }
      // console.log("before game start left sec is ", leftSec);
      setBeforeStartCountDown(leftSec);
    };
    const gameStartHandler = (roomPlayers: Array<IRoomPlayer>) => {
      if (roomState !== ROOM_STATE.GAME_START) {
        setRoomState(ROOM_STATE.GAME_START);
        freshHandleSelfTetriminoCreate();
        setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
      }
      roomPlayers.forEach((roomPlayer) => {
        if (roomPlayer.id === player.id) {
          setSelfName(roomPlayer.name);
        } else {
          setOpponentName(roomPlayer.name);
        }
      });
    };
    const gameLeftSecHandler = (leftSec: number) => {
      setLeftSec(leftSec);
    };
    const gameOverHandler = ({ isTie, winnerId }: { isTie: boolean; winnerId: string; loserId: string }) => {
      setSelfMatrixPhase(null);
      handleResetSelfMatrixEffect();
      setRoomState(ROOM_STATE.GAME_END);
      if (isTie) {
        setResult(RESULT.TIE);
      } else {
        if (player.id === winnerId) {
          setResult(RESULT.WIN);
        } else {
          setResult(RESULT.LOSE);
        }
      }
    };
    const otherGameDataUpdatedHandler = (updatedPayloads: GameDataUpdatedPayloads) => {
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
    };
    const roomParticipantLeaveHandler = () => {
      setSelfMatrixPhase(null);
      setRoomState(ROOM_STATE.PARTICIPANT_LEAVE);
      handleResetSelfMatrixEffect();
    };
    const roomHostLeaveHandler = () => {
      setSelfMatrixPhase(null);
      setRoomState(ROOM_STATE.HOST_LEAVE);
      handleResetSelfMatrixEffect();
    };
    const errorOccurHandler = () => {
      setSelfMatrixPhase(null);
      setRoomState(ROOM_STATE.ERROR);
      handleResetSelfMatrixEffect();
    };
    socketInstance.on("before_start_game", beforeStartGameHandler);
    socketInstance.on("game_start", gameStartHandler);
    socketInstance.on("game_leftSec", gameLeftSecHandler);
    socketInstance.on("game_over", gameOverHandler);
    socketInstance.on("other_game_data_updated", otherGameDataUpdatedHandler);
    socketInstance.on("room_participant_leave", roomParticipantLeaveHandler);
    socketInstance.on("room_host_leave", roomHostLeaveHandler);
    socketInstance.on("error_occur", errorOccurHandler);
    return () => {
      socketInstance.off("before_start_game", beforeStartGameHandler);
      socketInstance.off("game_start", gameStartHandler);
      socketInstance.off("game_leftSec", gameLeftSecHandler);
      socketInstance.off("game_over", gameOverHandler);
      socketInstance.off("other_game_data_updated", otherGameDataUpdatedHandler);
      socketInstance.off("room_participant_leave", roomParticipantLeaveHandler);
      socketInstance.off("room_host_leave", roomHostLeaveHandler);
      socketInstance.off("error_occur", errorOccurHandler);
    };
  }, [
    roomState,
    player,
    handleRoomConfig,
    setRoomState,
    setOpponentMatrix,
    setOpponentTetrimino,
    setOpponentNextTetriminoBag,
    setOpponentHoldTetrimino,
    initialSelfNextTetriminoBag,
    handleResetSelfMatrixEffect,
    getSocketInstance,
    handleSelfTetriminoCreate,
    setSelfMatrixPhase,
    freshHandleSelfTetriminoCreate,
  ]);

  useEffect(() => {
    if (isSocketConnected) {
      if (roomState === ROOM_STATE.CONNECTING) {
        setRoomState(ROOM_STATE.SELF_NOT_READY);
        handleRoomConfig();
      }
    } else if (isSocketConnectErrorOccur || isSocketDisConnected) {
      setRoomState(ROOM_STATE.ERROR);
    } else {
      setRoomState(ROOM_STATE.CONNECTING);
    }
  }, [handleRoomConfig, isSocketConnectErrorOccur, isSocketConnected, isSocketDisConnected, roomState]);

  useEffect(() => {
    if (!isPlayable) {
      const socketInstance = getSocketInstance();
      socketInstance.offAny();
      socketInstance.disconnect();
      setSelfMatrixPhase(null);
      setRoomState(ROOM_STATE.ERROR);
      handleResetSelfMatrixEffect();
    }
  }, [isPlayable, handleResetSelfMatrixEffect, getSocketInstance, setSelfMatrixPhase]);

  useEffect(() => {
    const checkSocketLatencyInterval = 5 * 1000;
    const timeout = setInterval(() => {
      const prev = performance.now();
      const socketInstance = getSocketInstance();
      socketInstance.emit("ping", () => {
        console.log(`socket latency is ${performance.now() - prev} ms`);
      });
    }, checkSocketLatencyInterval);
    return () => {
      clearInterval(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSocketInstance]);

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
                fontLevel={"three"}
                displayTetriminoNum={1}
                tetriminoBag={selfHoldTetrimino ? [selfHoldTetrimino] : null}
              />
            </div>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayNumber fontLevel={"three"} title={"LINE"} displayValue={selfLine} />
            </div>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayNumber fontLevel={"three"} title={"LEVEL"} displayValue={selfLevel} />
            </div>
            <Widget.DisplayNumber fontLevel={"three"} title={"SCORE"} displayValue={selfScore} />
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
              <ScoreText {...selfScoreText} />
            </PlayField.Wrapper>
          </Column>
          <Column>
            <Widget.DisplayTetrimino
              title="NEXT"
              fontLevel={"three"}
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
                fontLevel={"three"}
                displayTetriminoNum={1}
                tetriminoBag={opponentHoldTetrimino ? [opponentHoldTetrimino] : null}
              />
            </div>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayNumber fontLevel={"three"} title={"LINE"} displayValue={opponentLine} />
            </div>
            <div
              style={{
                marginBottom: "2vh",
              }}
            >
              <Widget.DisplayNumber fontLevel={"three"} title={"LEVEL"} displayValue={opponentLevel} />
            </div>
            <Widget.DisplayNumber fontLevel={"three"} title={"SCORE"} displayValue={opponentScore} />
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
              fontLevel={"three"}
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

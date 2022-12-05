import { useCallback, useState, useEffect, useMemo, useLayoutEffect, FC, Fragment } from "react";
import {
  DIRECTION,
  TETRIMINO_TYPE,
  ICube,
  TETRIMINO_ROTATION_DIRECTION,
  getCoordinateByAnchorAndShapeAndType,
  getSizeByCoordinates,
  ICoordinate,
  TETRIMINO_MOVE_TYPE,
} from "../common/tetrimino";
import { IPlayFieldRenderer } from "../components/PlayField/Renderer";
import Overlay from "../components/Overlay";
import Loading from "../components/Loading";
import useMatrix from "../hooks/matrix";
import useNextTetriminoBag from "../hooks/nextTetriminoBag";
import { useNavigate, useParams } from "react-router-dom";
import { ITetrimino } from "../hooks/tetrimino";
import { createCountDownTimer } from "../common/timer";
import { ISize } from "../common/utils";
import { ClientToServerCallback } from "../common/socket";
import styled from "styled-components";
import { useSizeConfigContext } from "../context/sizeConfig";
import Widget from "../components/Widget";
import PlayField from "../components/PlayField";
import Font from "../components/Font";
import { DISPLAY_ZONE_ROW_START, MATRIX_PHASE } from "../common/matrix";
import useCustomRef from "../hooks/customRef";
import {
  getLevelByLine,
  getScoreByTSpinAndLevelAndLine,
  getTetriminoFallingDelayByLevel,
} from "../common/game";
import { AnyFunction } from "ramda";
import useHoldTetrimino from "../hooks/holdTetrimino";
import { Key } from "ts-key-enum";
import useKeydownAutoRepeat from "../hooks/keydownAutoRepeat";
import { createAlertModal } from "../common/alert";
import { useSettingModalVisibilityContext } from "../context/settingModalVisibility";
import useSocket from "../hooks/socket";
import { getToken } from "../common/token";
import { usePlayerContext } from "../context/player";

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
  width: 40px;
  height: 40px;

  &:after {
    position: absolute;
    content: "";
    display: block;
    background-color: #fff;
    width: 40px;
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
    width: 40px;
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
  TETRIMINO = "TETRIMINO",
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

  const {
    mode: { double: doubleSizeConfig },
  } = useSizeConfigContext();

  const { playerRef } = usePlayerContext();

  const { open: openSettingModal } = useSettingModalVisibilityContext();

  const { id: roomId } = useParams();

  const { socketInstance, isConnected } = useSocket<
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

  const [isSelfHardDropRef, setIsSelfHardDropRef] = useCustomRef(false);

  const [selfTetriminoFallingTimerHandlerRef, setSelfTetriminoFallingTimerHandlerRef] =
    useCustomRef<AnyFunction>(() => {});

  const [prevSelfRenderTetriminoRef, setPrevSelfRenderTetriminoRef] = useCustomRef(selfTetrimino);

  const [prevSelfRenderMatrixRef, setPrevSelfRenderMatrixRef] = useCustomRef(selfMatrix);

  const [prevSelfRenderScoreRef, setPrevSelfRenderScoreRef] = useCustomRef(selfScore);

  const [prevSelfRenderLineRef, setPrevSelfRenderLineRef] = useCustomRef(selfLine);

  const [prevSelfRenderLevelRef, setPrevSelfRenderLevelRef] = useCustomRef(selfLevel);

  const [prevSelfRenderNextTetriminoBagRef, setPrevSelfRenderNextTetriminoBagRef] =
    useCustomRef(selfNextTetriminoBag);

  const [prevSelfRenderHoldTetriminoRef, setPrevSelRenderHoldTetriminoRef] = useCustomRef(selfHoldTetrimino);

  const [renderIdRef, setRenderIdRef] = useCustomRef(0);

  setRenderIdRef(renderIdRef.current + 1);

  const currentRerenderIdRef = renderIdRef.current;

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

  const isGameStart = useMemo(() => roomState === ROOM_STATE.GAME_START, [roomState]);

  const handleResetAllSelfState = useCallback(() => {
    resetSelfMatrix();
    resetSelfTetrimino();
    setSelfLevel(1);
    setSelfScore(0);
    setSelfLine(0);
    setSelfTetriminoFallingDelay(getTetriminoFallingDelayByLevel(1));
    setSelfHoldTetrimino(null);
    setSelfMatrixPhase(null);
    setSelfLastTetriminoRotateWallKickPositionRef(0);
    setSelfTetriminoMoveTypeRecordRef([]);
    setIsSelfHardDropRef(false);
    setIsSelfHoldableRef(false);
    resetSelfPrevTetriminoRef();
    setSelfNextTetriminoBag([]);
  }, [
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
    setOpponentLevel(0);
    setOpponentLine(1);
  }, [resetOpponentMatrix, resetOpponentTetrimino, setOpponentHoldTetrimino, setOpponentNextTetriminoBag]);

  const handleResetGameState = useCallback(() => {
    setResult(null);
    setLeftSec(null);
    setRoomState(ROOM_STATE.SELF_NOT_READY);
  }, []);

  const handleSelfReady = useCallback(() => {
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

  const handleSelfNextGame = useCallback(() => {
    if (isConnected) {
      socketInstance.emit("reset_room", ({ metadata: { isSuccess, isError, message } }) => {
        if (isError) return;
        if (isSuccess) {
          handleResetAllSelfState();
          handleResetAllOpponentState();
          handleResetGameState();
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
    handleResetAllSelfState,
    handleResetAllOpponentState,
    handleResetGameState,
    navigate,
  ]);

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
    setSelfTetriminoFallingDelay(getTetriminoFallingDelayByLevel(1));
    setSelfHoldTetrimino(null);
    setSelfLastTetriminoRotateWallKickPositionRef(0);
    setSelfTetriminoMoveTypeRecordRef([]);
    setIsSelfHardDropRef(false);
    setIsSelfHoldableRef(false);
    resetSelfPrevTetriminoRef();
  }, [
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
    selfTetriminoCollideBottomTimer.clear();
    selfTetriminoFallingTimer.clear();
  }, [pauseSelfClearRowAnimation, pauseSelfFillAllRowAnimation, pauseSelfFillRowAnimation]);

  useLayoutEffect(() => {
    const updatedPayloads: GameDataUpdatedPayloads = [];
    [
      {
        type: GAME_STATE_TYPE.TETRIMINO,
        current: selfTetrimino,
        prevRef: prevSelfRenderTetriminoRef,
        syncPrevRef: () => setPrevSelfRenderTetriminoRef(selfTetrimino),
      },
      {
        type: GAME_STATE_TYPE.NEXT_TETRIMINO_BAG,
        current: selfNextTetriminoBag,
        prevRef: prevSelfRenderNextTetriminoBagRef,
        syncPrevRef: () => setPrevSelfRenderNextTetriminoBagRef(selfNextTetriminoBag),
      },
      {
        type: GAME_STATE_TYPE.MATRIX,
        current: selfMatrix,
        prevRef: prevSelfRenderMatrixRef,
        syncPrevRef: () => setPrevSelfRenderMatrixRef(selfMatrix),
      },
      {
        type: GAME_STATE_TYPE.SCORE,
        current: selfScore,
        prevRef: prevSelfRenderScoreRef,
        syncPrevRef: () => setPrevSelfRenderScoreRef(selfScore),
      },
      {
        type: GAME_STATE_TYPE.LEVEL,
        current: selfLevel,
        prevRef: prevSelfRenderLevelRef,
        syncPrevRef: () => setPrevSelfRenderLevelRef(selfLevel),
      },
      {
        type: GAME_STATE_TYPE.HOLD_TETRIMINO,
        current: selfHoldTetrimino,
        prevRef: prevSelfRenderHoldTetriminoRef,
        syncPrevRef: () => setPrevSelRenderHoldTetriminoRef(selfHoldTetrimino),
      },
      {
        type: GAME_STATE_TYPE.LINE,
        current: selfLine,
        prevRef: prevSelfRenderLineRef,
        syncPrevRef: () => setPrevSelfRenderLineRef(selfLine),
      },
    ].forEach(({ type, current, prevRef, syncPrevRef }) => {
      if (current !== prevRef.current) {
        updatedPayloads.push({ type, data: current });
        syncPrevRef();
      }
    });
    if (isConnected && updatedPayloads.length > 0) {
      socketInstance.emit("game_data_updated", updatedPayloads);
    }
  }, [
    isConnected,
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
    socketInstance,
    setPrevSelRenderHoldTetriminoRef,
    setPrevSelfRenderLevelRef,
    setPrevSelfRenderLineRef,
    setPrevSelfRenderMatrixRef,
    setPrevSelfRenderNextTetriminoBagRef,
    setPrevSelfRenderScoreRef,
    setPrevSelfRenderTetriminoRef,
  ]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isGameStart && selfMatrixPhase === MATRIX_PHASE.TETRIMINO_FALLING) {
        if (e.key === Key.ArrowLeft) {
          const isSuccess = moveSelfTetrimino(DIRECTION.LEFT);
          if (isSuccess) {
            setSelfTetriminoMoveTypeRecordRef([
              ...selfTetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.LEFT_MOVE,
            ]);
          }
        } else if (e.key === Key.ArrowRight) {
          const isSuccess = moveSelfTetrimino(DIRECTION.RIGHT);
          if (isSuccess) {
            setSelfTetriminoMoveTypeRecordRef([
              ...selfTetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.RIGHT_MOVE,
            ]);
          }
        } else if (e.key === Key.ArrowDown) {
          if (renderIdRef.current === currentRerenderIdRef) {
            const isSuccess = moveSelfTetrimino(DIRECTION.DOWN);
            if (isSuccess) {
              setSelfTetriminoMoveTypeRecordRef([
                ...selfTetriminoMoveTypeRecordRef.current,
                TETRIMINO_MOVE_TYPE.SOFT_DROP,
              ]);
            }
          }
        } else if (e.key === Key.ArrowUp) {
          const isSuccess = changeSelfTetriminoShape(TETRIMINO_ROTATION_DIRECTION.CLOCK_WISE);
          if (isSuccess) {
            setSelfTetriminoMoveTypeRecordRef([
              ...selfTetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.CLOCK_WISE_ROTATE,
            ]);
          }
        } else if (e.key === "z") {
          const isSuccess = changeSelfTetriminoShape(TETRIMINO_ROTATION_DIRECTION.COUNTER_CLOCK_WISE);
          if (isSuccess) {
            setSelfTetriminoMoveTypeRecordRef([
              ...selfTetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.COUNTER_CLOCK_WISE_ROTATE,
            ]);
          }
        } else if (e.key === " ") {
          selfTetriminoFallingTimer.clear();
          setIsSelfHardDropRef(true);
          const isSuccess = moveSelfTetriminoToPreview();
          if (isSuccess) {
            setSelfTetriminoMoveTypeRecordRef([
              ...selfTetriminoMoveTypeRecordRef.current,
              TETRIMINO_MOVE_TYPE.HARD_DROP,
            ]);
          }
        } else if (e.key === Key.Shift) {
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
              fillSelfAllRow().then(() => {
                handleSelfMatrixNextCycle();
                setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
              });
            }
          }
        }
      }
      if (e.key === Key.Escape) {
        setIsToolOverlayOpen((prevIsToolOverlayOpen) => !prevIsToolOverlayOpen);
      }
    },
    [
      renderIdRef,
      currentRerenderIdRef,
      isGameStart,
      isSelfHoldableRef,
      selfMatrixPhase,
      selfTetrimino.type,
      selfTetriminoMoveTypeRecordRef,
      changeSelfHoldTetrimino,
      changeSelfTetriminoShape,
      fillSelfAllRow,
      handleSelfMatrixNextCycle,
      handleSelfTetriminoCreate,
      moveSelfTetrimino,
      moveSelfTetriminoToPreview,
      setIsSelfHardDropRef,
      setSelfTetriminoMoveTypeRecordRef,
    ]
  );

  useKeydownAutoRepeat([Key.ArrowLeft, Key.ArrowRight, Key.ArrowDown], onKeyDown);

  useEffect(() => {
    let effectCleaner = () => {};
    switch (selfMatrixPhase) {
      case MATRIX_PHASE.TETRIMINO_CREATE:
        const isCreatedSuccess = handleSelfTetriminoCreate();
        if (isCreatedSuccess) {
          setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_FALLING);
        } else {
          setSelfMatrixPhase(null);
          fillSelfAllRow().then(() => {
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
              fillSelfAllRow().then(() => {
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
          setSelfTetriminoFallingTimerHandlerRef(() => {
            const isSuccess = moveSelfTetrimino(DIRECTION.DOWN);
            if (isSuccess) {
              setSelfTetriminoMoveTypeRecordRef([
                ...selfTetriminoMoveTypeRecordRef.current,
                TETRIMINO_MOVE_TYPE.AUTO_FALLING,
              ]);
            }
          });
          if (!selfTetriminoFallingTimer.isPending()) {
            selfTetriminoFallingTimer.start(() => {
              selfTetriminoFallingTimerHandlerRef.current();
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
          clearSelfRowFilledWithCube(filledRow).then(() => {
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
          fillSelfEmptyRow(emptyRowGap).then(() => {
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
    return effectCleaner;
  }, [
    selfLevel,
    selfLine,
    selfMatrixPhase,
    selfTetrimino,
    selfTetriminoCoordinates,
    selfTetriminoFallingDelay,
    selfTetriminoFallingTimerHandlerRef,
    isSelfHardDropRef,
    selfTetriminoMoveTypeRecordRef,
    clearSelfRowFilledWithCube,
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
    setSelfTetriminoFallingTimerHandlerRef,
    setSelfTetriminoMoveTypeRecordRef,
    setSelfTetriminoToMatrix,
  ]);

  useEffect(() => {
    if (isConnected) {
      if (roomState === ROOM_STATE.CONNECTING) {
        setRoomState(ROOM_STATE.SELF_NOT_READY);
      }
      socketInstance.on("before_start_game", (leftSec) => {
        if (roomState !== ROOM_STATE.BEFORE_GAME_START) {
          initialOpponentNextTetriminoBag();
          initialSelfNextTetriminoBag();
          setRoomState(ROOM_STATE.BEFORE_GAME_START);
        }
        console.log("before game start left sec is ", leftSec);
        setBeforeStartCountDown(leftSec);
      });
      socketInstance.on("game_start", () => {
        if (roomState !== ROOM_STATE.GAME_START) {
          setRoomState(ROOM_STATE.GAME_START);
          setSelfMatrixPhase(MATRIX_PHASE.TETRIMINO_CREATE);
        }
      });
      socketInstance.on("game_leftSec", (leftSec: number) => {
        setLeftSec(leftSec);
      });
      socketInstance.on("game_over", ({ isTie, winnerId }) => {
        handlePauseSelfMatrixAnimation();
        if (isTie) {
          setResult(RESULT.TIE);
        } else {
          if (socketInstance.id === winnerId) {
            setResult(RESULT.WIN);
          } else {
            setResult(RESULT.LOSE);
          }
        }
        setRoomState(ROOM_STATE.GAME_END);
      });
      socketInstance.on("other_game_data_updated", (updatedPayloads: GameDataUpdatedPayloads) => {
        updatedPayloads.forEach(({ type, data }) => {
          if (type === GAME_STATE_TYPE.SCORE) {
            setOpponentScore(data as number);
          } else if (type === GAME_STATE_TYPE.MATRIX) {
            setOpponentMatrix(data as IPlayFieldRenderer["matrix"]);
          } else if (type === GAME_STATE_TYPE.TETRIMINO) {
            setOpponentTetrimino(data as ITetrimino);
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
      socketInstance.on("room_participant_leave", () => {
        handlePauseSelfMatrixAnimation();
        setRoomState(ROOM_STATE.PARTICIPANT_LEAVE);
      });
      socketInstance.on("room_host_leave", () => {
        handlePauseSelfMatrixAnimation();
        setRoomState(ROOM_STATE.HOST_LEAVE);
      });
      socketInstance.on("error_occur", () => {
        handlePauseSelfMatrixAnimation();
        setRoomState(ROOM_STATE.ERROR);
      });
    } else {
      setRoomState(ROOM_STATE.CONNECTING);
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
  }, [
    socketInstance,
    isConnected,
    roomState,
    setRoomState,
    setOpponentMatrix,
    setOpponentTetrimino,
    setOpponentNextTetriminoBag,
    setOpponentHoldTetrimino,
    initialOpponentNextTetriminoBag,
    initialSelfNextTetriminoBag,
    handlePauseSelfMatrixAnimation,
  ]);

  return (
    <Fragment>
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
              <Widget.DisplayTetrimino
                title={"HOLD"}
                fontLevel={["six", "xl-five"]}
                cubeDistance={doubleSizeConfig.widget.hold.cube}
                displayTetriminoNum={1}
                tetriminoBag={selfHoldTetrimino ? [selfHoldTetrimino] : null}
                width={doubleSizeConfig.widget.hold.width}
                height={doubleSizeConfig.widget.hold.height}
              />
            </div>
            <div
              style={{
                marginBottom: `${doubleSizeConfig.distanceBetweenWidgetAndWidget}px`,
              }}
            >
              <Widget.DisplayNumber
                fontLevel={["six", "xl-five"]}
                width={doubleSizeConfig.widget.displayNumber.width}
                height={doubleSizeConfig.widget.displayNumber.height}
                title={"LINE"}
                displayValue={selfLine}
              />
            </div>
            <div
              style={{
                marginBottom: `${doubleSizeConfig.distanceBetweenWidgetAndWidget}px`,
              }}
            >
              <Widget.DisplayNumber
                fontLevel={["six", "xl-five"]}
                width={doubleSizeConfig.widget.displayNumber.width}
                height={doubleSizeConfig.widget.displayNumber.height}
                title={"LEVEL"}
                displayValue={selfLevel}
              />
            </div>
            <Widget.DisplayNumber
              fontLevel={["six", "xl-five"]}
              width={doubleSizeConfig.widget.displayNumber.width}
              height={doubleSizeConfig.widget.displayNumber.height}
              title={"SCORE"}
              displayValue={selfScore}
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
                matrix={selfDisplayMatrix}
                tetrimino={selfDisplayTetriminoCoordinates}
                previewTetrimino={selfPreviewTetrimino}
              />
            </PlayField.Wrapper>
          </Column>
          <Column
            width={doubleSizeConfig.widget.displayNumber.width}
            height={doubleSizeConfig.playField.height}
          >
            <Widget.DisplayTetrimino
              title="NEXT"
              fontLevel={["six", "xl-five"]}
              cubeDistance={doubleSizeConfig.widget.nextTetrimino.cube}
              displayTetriminoNum={5}
              tetriminoBag={selfNextTetriminoBag.length === 0 ? null : selfNextTetriminoBag}
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
            <div
              style={{
                marginBottom: `${doubleSizeConfig.distanceBetweenWidgetAndWidget}px`,
              }}
            >
              <Widget.DisplayTetrimino
                title={"HOLD"}
                fontLevel={["six", "xl-five"]}
                cubeDistance={doubleSizeConfig.widget.hold.cube}
                displayTetriminoNum={1}
                tetriminoBag={opponentHoldTetrimino ? [opponentHoldTetrimino] : null}
                width={doubleSizeConfig.widget.hold.width}
                height={doubleSizeConfig.widget.hold.height}
              />
            </div>
            <div
              style={{
                marginBottom: `${doubleSizeConfig.distanceBetweenWidgetAndWidget}px`,
              }}
            >
              <Widget.DisplayNumber
                fontLevel={["six", "xl-five"]}
                width={doubleSizeConfig.widget.displayNumber.width}
                height={doubleSizeConfig.widget.displayNumber.height}
                title={"LINE"}
                displayValue={opponentLine}
              />
            </div>
            <div
              style={{
                marginBottom: `${doubleSizeConfig.distanceBetweenWidgetAndWidget}px`,
              }}
            >
              <Widget.DisplayNumber
                fontLevel={["six", "xl-five"]}
                width={doubleSizeConfig.widget.displayNumber.width}
                height={doubleSizeConfig.widget.displayNumber.height}
                title={"LEVEL"}
                displayValue={opponentLevel}
              />
            </div>
            <Widget.DisplayNumber
              fontLevel={["six", "xl-five"]}
              width={doubleSizeConfig.widget.displayNumber.width}
              height={doubleSizeConfig.widget.displayNumber.height}
              title={"SCORE"}
              displayValue={opponentScore}
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
                matrix={opponentDisplayMatrix}
                tetrimino={opponentDisplayTetriminoCoordinates}
                previewTetrimino={opponentPreviewTetrimino}
              />
            </PlayField.Wrapper>
          </Column>
          <Column
            width={doubleSizeConfig.widget.displayNumber.width}
            height={doubleSizeConfig.playField.height}
          >
            <Widget.DisplayTetrimino
              title="NEXT"
              fontLevel={["six", "xl-five"]}
              cubeDistance={doubleSizeConfig.widget.nextTetrimino.cube}
              displayTetriminoNum={5}
              tetriminoBag={opponentNextTetriminoBag.length === 0 ? null : opponentNextTetriminoBag}
              width={doubleSizeConfig.widget.nextTetrimino.width}
              height={doubleSizeConfig.widget.nextTetrimino.height}
            />
          </Column>
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

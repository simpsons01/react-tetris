import type { EventMap } from "../common/socket";
import type { AnyObject } from "../common/utils";
import useCustomRef from "./customRef";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Socket } from "socket.io-client";
import { getSocketInstance as _getSocketInstance } from "../common/socket";

enum CONNECT_STATE {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECT = "disconnect",
  CONNECT_ERROR = "connect_error",
}

const useSocket = <ServerToClientEvt extends EventMap, ClientToServerEvt extends EventMap>(
  token: string,
  query: AnyObject
) => {
  const [socketInstanceRef, setSocketInstanceRef] = useCustomRef<Socket<
    ServerToClientEvt,
    ClientToServerEvt
  > | null>(null);

  const [connectState, setConnectState] = useState<CONNECT_STATE | null>(null);

  const isConnecting = useMemo(() => connectState === CONNECT_STATE.CONNECTING, [connectState]);

  const isConnected = useMemo(() => connectState === CONNECT_STATE.CONNECTED, [connectState]);

  const isDisconnected = useMemo(() => connectState === CONNECT_STATE.DISCONNECT, [connectState]);

  const isConnectErrorOccur = useMemo(() => connectState === CONNECT_STATE.CONNECT_ERROR, [connectState]);

  const getSocketInstance = useCallback((): Socket<ServerToClientEvt, ClientToServerEvt> => {
    if (!socketInstanceRef.current) {
      setSocketInstanceRef(_getSocketInstance(token, query));
    }
    return socketInstanceRef.current as Socket<ServerToClientEvt, ClientToServerEvt>;
  }, [query, socketInstanceRef, token, setSocketInstanceRef]);

  useEffect(() => {
    const socketInstance = getSocketInstance();
    socketInstance.on("connect", () => {
      setConnectState(CONNECT_STATE.CONNECTED);
    });
    socketInstance.on("disconnect", () => {
      setConnectState(CONNECT_STATE.DISCONNECT);
    });
    socketInstance.on("connect_error", (err) => {
      console.log(err);
      setConnectState(CONNECT_STATE.CONNECT_ERROR);
    });
    return () => {
      socketInstance.offAny();
      socketInstance.disconnect();
      setSocketInstanceRef(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    getSocketInstance,
    isConnecting,
    isConnectErrorOccur,
    isConnected,
    isDisconnected,
  };
};

export default useSocket;

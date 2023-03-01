import type { EventMap } from "../utils/socket";
import type { AnyObject } from "../utils/common";
import useCustomRef from "./customRef";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Socket } from "socket.io-client";
import { getSocketInstance } from "../utils/socket";

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

  const isSocketInstanceNotNil = useCallback(
    (socketInstance: any): socketInstance is Socket<ServerToClientEvt, ClientToServerEvt> => {
      return socketInstance instanceof Socket;
    },
    []
  );

  const connect = useCallback(() => {
    setConnectState(CONNECT_STATE.CONNECTING);
    const socketInstance = getSocketInstance<ServerToClientEvt, ClientToServerEvt>(token, query);
    setSocketInstanceRef(socketInstance);
  }, [query, setSocketInstanceRef, token]);

  const disconnect = useCallback(() => {
    if (isSocketInstanceNotNil(socketInstanceRef.current)) {
      socketInstanceRef.current.offAny();
      socketInstanceRef.current.disconnect();
      setSocketInstanceRef(null);
    }
  }, [isSocketInstanceNotNil, setSocketInstanceRef, socketInstanceRef]);

  useEffect(() => {
    if (isSocketInstanceNotNil(socketInstanceRef.current)) {
      socketInstanceRef.current.on("connect", () => {
        setConnectState(CONNECT_STATE.CONNECTED);
      });
      socketInstanceRef.current.on("disconnect", () => {
        setConnectState(CONNECT_STATE.DISCONNECT);
      });
      socketInstanceRef.current.on("connect_error", (err) => {
        console.log(err);
        setConnectState(CONNECT_STATE.CONNECT_ERROR);
      });
    }
    return () => {
      if (isSocketInstanceNotNil(socketInstanceRef.current)) {
        socketInstanceRef.current.off("connect");
        socketInstanceRef.current.off("disconnect");
        socketInstanceRef.current.off("connect_error");
      }
    };
  });

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    socketInstanceRef,
    isConnecting,
    isConnectErrorOccur,
    isConnected,
    isDisconnected,
    connect,
    disconnect,
    isSocketInstanceNotNil,
  };
};

export default useSocket;

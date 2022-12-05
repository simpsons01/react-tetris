import { useState, useEffect } from "react";
import getSocketInstance, { EventMap } from "../common/socket";
import { AnyObject } from "../common/utils";
import useCustomRef from "./customRef";

const useSocket = <ServerToClientEvt extends EventMap, ClientToServerEvt extends EventMap>(
  token: string,
  query: AnyObject
) => {
  const [{ current: socketInstance }] = useCustomRef(
    getSocketInstance<ServerToClientEvt, ClientToServerEvt>(token, query)
  );
  const [isConnected, setIsConnected] = useState<boolean>(socketInstance.connected);
  const [isConnectErrorOccur, setIsConnectErrorOccur] = useState<boolean>(false);

  useEffect(() => {
    socketInstance.on("connect", () => {
      setIsConnectErrorOccur(false);
      setIsConnected(true);
    });
    socketInstance.on("disconnect", () => {
      console.log("disconnected");
      setIsConnected(false);
    });
    socketInstance.on("connect_error", (err) => {
      console.log("connected error occur");
      console.log(err);
      setIsConnected(false);
      setIsConnectErrorOccur(true);
    });
    return () => {
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("connect_error");
    };
  }, [socketInstance]);

  useEffect(() => {
    return () => {
      socketInstance.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    socketInstance,
    isConnectErrorOccur,
    isConnected,
  };
};

export default useSocket;

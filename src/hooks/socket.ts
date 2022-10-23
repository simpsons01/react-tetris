import { useState, useEffect } from "react";
import getSocketInstance from "../common/socket";

const useSocket = function () {
  const socketInstance = getSocketInstance();
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

  return {
    socketInstance,
    isConnectErrorOccur,
    isConnected,
  };
};

export default useSocket;

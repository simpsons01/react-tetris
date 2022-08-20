import React from "react";
import getSocketInstance from "../common/socket";

const useSocket = function () {
  const socketInstance = getSocketInstance();
  const [isConnected, setIsConnected] = React.useState<boolean>(
    socketInstance.connected
  );
  const [isConnectErrorOccur, setIsConnectErrorOccur] =
    React.useState<boolean>(false);

  React.useEffect(() => {
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

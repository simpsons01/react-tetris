import React from "react";
import { Socket } from "socket.io-client";
import getSocketInstance from "../common/socket";

export interface ISocketContext {
  isErrorOccur: boolean;
  isConnected: boolean;
  socketInstance: Socket | null;
}

export const SocketContext = React.createContext<ISocketContext>({
  isErrorOccur: false,
  isConnected: false,
  socketInstance: null,
});

const useSocket = function () {
  const [isErrorOccur, setIsErrorOccur] = React.useState<boolean>(false);

  const [isConnected, setIsConnected] = React.useState<boolean>(false);

  const socketInstance = getSocketInstance();

  React.useEffect(() => {
    socketInstance.on("connect", () => {
      if (isErrorOccur) {
        setIsErrorOccur(false);
      }
      setIsConnected(true);
    });
    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });
    socketInstance.on("connect_error", () => {
      setIsErrorOccur(true);
    });
    return () => {
      socketInstance.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isErrorOccur]);

  return {
    socketInstance,
    isErrorOccur,
    isConnected,
  };
};

export default useSocket;

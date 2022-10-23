import { createContext } from "react";
import { Socket } from "socket.io-client";

export interface ISocketContext<ServerToClientEvt = {}, ClientToServerEvt = {}> {
  isConnectErrorOccur: boolean;
  isConnected: boolean;
  socketInstance: Socket<ServerToClientEvt, ClientToServerEvt>;
}

export const SocketContext = createContext<ISocketContext>({} as ISocketContext);

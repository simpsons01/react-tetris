import { io, Socket } from "socket.io-client";
import { AnyObject } from "./utils";

export interface EventMap {
  [event: string]: any;
}

export type ClientToServerCallback<Data extends object = {}> = (payload: {
  data: Data;
  metadata: {
    isSuccess: boolean;
    isError: boolean;
    message?: string;
  };
}) => void;

const getSocketInstance = <S extends EventMap, C extends EventMap>(
  token: string,
  query: AnyObject
): Socket<S, C> => {
  return io(process.env.REACT_APP_SOCKET_URL as string, {
    path: "/connect/socket.io",
    auth: {
      token,
    },
    query,
  });
};

export default getSocketInstance;

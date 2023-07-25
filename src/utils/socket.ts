import type { AnyObject } from "./common";
import { io, Socket } from "socket.io-client";

export interface EventMap {
  [event: string]: any;
}

export enum EVENT_OPERATION_STATUS {
  SUCCESS = "success",
  FAILED = "failed",
}

export type ClientToServerCallback<Data extends object = {}> = (payload: {
  data: Data;
  metadata: {
    status: EVENT_OPERATION_STATUS;
    message?: string;
  };
}) => void;

export const getSocketInstance = <S extends EventMap, C extends EventMap>(
  token: string,
  query: AnyObject
): Socket<S, C> =>
  io(process.env.REACT_APP_SOCKET_URL as string, {
    path: "/api/socket.io",
    auth: {
      token,
    },
    query,
  });

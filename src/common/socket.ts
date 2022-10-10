import { io, Socket } from "socket.io-client";

export type ClientToServerCallback<Data extends object = {}> = (payload: {
  data: Data;
  metadata: {
    isSuccess: boolean;
    isError: boolean;
    message?: string;
  };
}) => void;

let instance: Socket;

const getSocketInstance = (): Socket => {
  if (!instance) {
    instance = io(process.env.REACT_APP_SOCKET_URL as string, {
      withCredentials: true,
    });
  }
  return instance;
};

export default getSocketInstance;

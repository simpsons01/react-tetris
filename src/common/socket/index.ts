import { io, Socket } from "socket.io-client";

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

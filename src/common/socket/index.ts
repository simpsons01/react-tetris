import { io, Socket } from "socket.io-client";

const instance = io(process.env.REACT_APP_SOCKET_URL as string, {
  withCredentials: true,
});

const getSocketInstance = (): Socket => instance;

export default getSocketInstance;

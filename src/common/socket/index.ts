import { io, Socket } from "socket.io-client";

const createSocketInstance = (roomId: string): Socket =>
  io(`${process.env.REACT_APP_SOCKET_URL as string}/${roomId}`, { withCredentials: true });

export default createSocketInstance;

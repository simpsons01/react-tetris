import { io, Socket } from "socket.io-client";

const createSocketInstance = (): Socket => io(process.env.REACT_APP_SOCKET_URL as string, { withCredentials: true });

export default createSocketInstance;

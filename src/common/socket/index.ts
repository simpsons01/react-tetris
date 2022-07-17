import { io } from "socket.io-client";

const socketInstance = io(process.env.REACT_APP_SOCKET_URL as string);

export default socketInstance;

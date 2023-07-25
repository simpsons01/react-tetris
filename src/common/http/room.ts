import { IRoom } from "../rooms";
import { withTokenRequest } from "./_internal";

export const getRooms = () => withTokenRequest<{ list: Array<IRoom> }>({ method: "get", url: "/room/list" });

export const createRoom = (data: { name: string; config?: { initialLevel: number; sec: number } }) =>
  withTokenRequest<{ roomId: string }>({ method: "post", url: "/room/create", data });

export const joinRoom = (roomId: string) => withTokenRequest({ method: "post", url: `/room/join/${roomId}` });

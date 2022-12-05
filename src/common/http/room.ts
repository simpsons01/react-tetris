import { withTokenRequest } from "./_internal";

export const getRooms = () => withTokenRequest({ method: "get", url: "/room/list" });

export const createRoom = (data: { name: string; config?: { initialLevel: number } }) =>
  withTokenRequest({ method: "get", url: "/room/list", data });

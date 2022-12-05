import { AxiosResponse } from "axios";
import { IPlayer } from "../player";
import http, { withTokenRequest } from "./_internal";

export const getPlayer = async () =>
  await withTokenRequest<{ player: IPlayer }>({
    url: "/player/get",
    method: "get",
  });

export const createPlayer = async (data: { name: string }) =>
  await http.request<any, AxiosResponse<{ token: string; playerId: string }>>({
    url: "/player/create",
    method: "post",
    data,
  });

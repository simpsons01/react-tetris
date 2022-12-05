import { IPlayer } from "./player";

export type RoomConfig = {
  initialLevel: number;
  playerLimitNum: number;
};

export interface IRoom {
  id: string;
  name: string;
  hostId: string;
  config: RoomConfig;
  players: Array<IPlayer>;
}

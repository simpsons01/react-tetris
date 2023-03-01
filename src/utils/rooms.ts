import { IPlayer } from "./player";

export type RoomConfig = {
  initialLevel: number;
  playerLimitNum: number;
  sec: number;
};

export enum ROOM_STATE {
  CREATED = "created",
  GAME_START = "game_started",
  GAME_INTERRUPT = "game_interrupt",
  GAME_END = "game_end",
}

export enum PLAYER_STATE {
  READY = "ready",
  NOT_READY = "not_ready",
}

export interface IRoom {
  id: string;
  name: string;
  host: IPlayer;
  config: RoomConfig;
  state: ROOM_STATE;
  players: Array<IPlayer & { ready: PLAYER_STATE; score: number }>;
}

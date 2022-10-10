export enum ROOM_STATE {
  CREATED,
  WAITING_ROOM_FULL,
  GAME_BEFORE_START,
  GAME_START,
  GAME_INTERRUPT,
  GAME_END,
}

export interface IParticipant {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
}

export interface IRoom {
  id: string;
  state: ROOM_STATE;
  name: string;
  host: IParticipant;
  participantLimitNum: number;
  participants: Array<IParticipant>;
}

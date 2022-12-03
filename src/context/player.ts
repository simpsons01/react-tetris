import { createContext, useContext } from "react";

export interface IPlayer {
  name: string;
  id: string;
}

export interface IPlayerContext {
  player: IPlayer;
  isNil(): boolean;
  set(newPlayer: IPlayer): void;
}

export const PlayerContext = createContext<IPlayerContext>({} as IPlayerContext);

export const usePlayerContext = () => useContext(PlayerContext);

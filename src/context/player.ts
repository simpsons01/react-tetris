import type { IPlayer } from "../utils/player";
import { createContext, useContext, MutableRefObject } from "react";

export interface IPlayerContext {
  playerRef: MutableRefObject<IPlayer>;
  setPlayerRef: (player: IPlayer) => void;
  isPlayerNil(): boolean;
}

export const PlayerContext = createContext<IPlayerContext>({} as IPlayerContext);

export const usePlayerContext = () => useContext(PlayerContext);

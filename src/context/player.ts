import type { Dispatch } from "react";
import type { IPlayer } from "../common/player";
import type { PLAYER_REDUCER_ACTION } from "../reducer/player";
import { createContext, useContext } from "react";

export interface IPlayerContext {
  player: IPlayer;
  dispatch: Dispatch<{
    type: PLAYER_REDUCER_ACTION;
    player?: IPlayer;
  }>;
  isPlayerNil(): boolean;
}

export const PlayerContext = createContext<IPlayerContext>({} as IPlayerContext);

export const usePlayerContext = () => useContext(PlayerContext);

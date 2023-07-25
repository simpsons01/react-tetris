import { IPlayer } from "../common/player";

export enum PLAYER_REDUCER_ACTION {
  RESET = "reset",
  UPDATE = "update",
}

const playerReducer = (
  player: IPlayer,
  action: {
    type: PLAYER_REDUCER_ACTION;
    player?: IPlayer;
  }
): IPlayer => {
  switch (action.type) {
    case PLAYER_REDUCER_ACTION.RESET: {
      return {
        id: "",
        name: "",
      };
    }
    case PLAYER_REDUCER_ACTION.UPDATE: {
      return action.player as IPlayer;
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};

export default playerReducer;

export enum TETRIMINO_ROTATION_DIRECTION {
  CLOCK_WISE = "CLOCK_WISE",
  COUNTER_CLOCK_WISE = "COUNTER_CLOCK_WISE",
}

export enum CUBE_STATE {
  UNFILLED = "UNFILLED",
  FILLED = "FILLED",
}

export enum TETRIMINO_SHAPE {
  INITIAL = "0",
  RIGHT = "R",
  TWICE = "2",
  LEFT = "L",
}

export enum TETRIMINO_MOVE_TYPE {
  LEFT_MOVE = "LEFT_MOVE",
  RIGHT_MOVE = "RIGHT_MOVE",
  HARD_DROP = "HARD_DROP",
  SOFT_DROP = "SOFT_DROP",
  CLOCK_WISE_ROTATE = "ROTATE",
  COUNTER_CLOCK_WISE_ROTATE = "COUNTER_CLOCK_WISE_ROTATE",
}

export enum TETRIMINO_TYPE {
  I = "I",
  J = "J",
  L = "L",
  O = "O",
  S = "S",
  T = "T",
  Z = "Z",
}

export enum DIRECTION {
  TOP = "top",
  RIGHT = "right",
  DOWN = "down",
  LEFT = "left",
}

export enum T_SPIN_TYPE {
  NORMAL = "NORMAL",
  MINI = "MINI",
}

export interface ICoordinate {
  x: number;
  y: number;
}

export interface ICube extends ICoordinate {
  state?: CUBE_STATE;
}

export interface ITetriminoConfig {
  config: {
    [path: string]: {
      shape: {
        anchorIndex: number;
        coordinates: Array<ICoordinate>;
      };
      boundary: {
        size: number;
        position: Array<ICoordinate>;
      };
    };
  };
  wallKick: {
    [path: string]: Array<ICoordinate>;
  };
  spawnStartLocation: ICoordinate;
}

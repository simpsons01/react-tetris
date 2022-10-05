export enum POLYOMINO_ROTATION {
  CLOCK_WISE = "CLOCK_WISE",
  COUNTER_CLOCK_WISE = "COUNTER_CLOCK_WISE",
}

export enum CUBE_STATE {
  UNFILLED = "UNFILLED",
  FILLED = "FILLED",
}

export enum POLYOMINO_SHAPE {
  INITIAL = "0",
  RIGHT = "R",
  TWICE = "2",
  LEFT = "L",
}

export enum POLYOMINO_TYPE {
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

export interface ICoordinate {
  x: number;
  y: number;
}

export interface ICube extends ICoordinate {
  state?: CUBE_STATE;
}

export interface IPolyominoConfig {
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
}

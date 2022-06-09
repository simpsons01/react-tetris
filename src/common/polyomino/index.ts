export enum POLYOMINO_SHAPE {
  FIRST,
  SECOND,
  THIRD,
  FOURTH,
}

export enum CUBE_STATE {
  UNFILLED,
  FILLED,
}

export enum POLYOMINO_TYPE {
  I,
  J,
  L,
  O,
  S,
  T,
  Z,
}

export enum DIRECTION {
  TOP = "top",
  RIGHT = "right",
  DOWN = "down",
  LEFT = "left",
}

export const DEFAULT_POLYOMINO_SHAPE = POLYOMINO_SHAPE.FIRST;

export interface ICoordinate {
  x: number;
  y: number;
}

export interface ICube extends ICoordinate {
  strokeColor: string;
  fillColor: string;
  state?: CUBE_STATE;
}

export interface IPolyominoConfig<T = { anchorIndex: number; coordinate: Array<ICoordinate> }> {
  coordinate: {
    [POLYOMINO_SHAPE.FIRST]: T;
    [POLYOMINO_SHAPE.SECOND]: T;
    [POLYOMINO_SHAPE.THIRD]: T;
    [POLYOMINO_SHAPE.FOURTH]: T;
  };
  strokeColor: string;
  fillColor: string;
}

export const I: Readonly<IPolyominoConfig> = Object.freeze({
  coordinate: {
    [POLYOMINO_SHAPE.FIRST]: {
      anchorIndex: 1,
      coordinate: [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
    },
    [POLYOMINO_SHAPE.SECOND]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    },
    [POLYOMINO_SHAPE.THIRD]: {
      anchorIndex: 1,
      coordinate: [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
    },
    [POLYOMINO_SHAPE.FOURTH]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    },
  },
  strokeColor: "#292929",
  fillColor: "#00BB00",
});

export const J: Readonly<IPolyominoConfig> = Object.freeze({
  coordinate: {
    [POLYOMINO_SHAPE.FIRST]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
        { x: 0, y: -1 },
      ],
    },
    [POLYOMINO_SHAPE.SECOND]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    },
    [POLYOMINO_SHAPE.THIRD]: {
      anchorIndex: 2,
      coordinate: [
        { x: 1, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
    },
    [POLYOMINO_SHAPE.FOURTH]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    },
  },
  strokeColor: "#292929",
  fillColor: "#A6A6A6",
});

export const L: Readonly<IPolyominoConfig> = Object.freeze({
  coordinate: {
    [POLYOMINO_SHAPE.FIRST]: {
      anchorIndex: 2,
      coordinate: [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    },
    [POLYOMINO_SHAPE.SECOND]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    },
    [POLYOMINO_SHAPE.THIRD]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
    },
    [POLYOMINO_SHAPE.FOURTH]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: -1 },
      ],
    },
  },
  strokeColor: "#292929",
  fillColor: "#C6A300",
});

export const O: Readonly<IPolyominoConfig> = Object.freeze({
  coordinate: {
    [POLYOMINO_SHAPE.FIRST]: {
      anchorIndex: 3,
      coordinate: [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
      ],
    },
    [POLYOMINO_SHAPE.SECOND]: {
      anchorIndex: 3,
      coordinate: [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
      ],
    },
    [POLYOMINO_SHAPE.THIRD]: {
      anchorIndex: 3,
      coordinate: [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
      ],
    },
    [POLYOMINO_SHAPE.FOURTH]: {
      anchorIndex: 3,
      coordinate: [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
      ],
    },
  },
  strokeColor: "#292929",
  fillColor: "#FF7575",
});

export const S: Readonly<IPolyominoConfig> = Object.freeze({
  coordinate: {
    [POLYOMINO_SHAPE.FIRST]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
      ],
    },
    [POLYOMINO_SHAPE.SECOND]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: 1 },
      ],
    },
    [POLYOMINO_SHAPE.THIRD]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
      ],
    },
    [POLYOMINO_SHAPE.FOURTH]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: 1 },
      ],
    },
  },
  strokeColor: "#292929",
  fillColor: "#00CACA",
});

export const T: Readonly<IPolyominoConfig> = Object.freeze({
  coordinate: {
    [POLYOMINO_SHAPE.FIRST]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
    },
    [POLYOMINO_SHAPE.SECOND]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ],
    },
    [POLYOMINO_SHAPE.THIRD]: {
      anchorIndex: 1,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
      ],
    },
    [POLYOMINO_SHAPE.FOURTH]: {
      anchorIndex: 1,
      coordinate: [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ],
    },
  },
  strokeColor: "#292929",
  fillColor: "#0072E3",
});

export const Z: Readonly<IPolyominoConfig> = Object.freeze({
  coordinate: {
    [POLYOMINO_SHAPE.FIRST]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    },
    [POLYOMINO_SHAPE.SECOND]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
    },
    [POLYOMINO_SHAPE.THIRD]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    },
    [POLYOMINO_SHAPE.FOURTH]: {
      anchorIndex: 2,
      coordinate: [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
    },
  },
  strokeColor: "#292929",
  fillColor: "#8080C0",
});

export const getPolyominoConfig = function (type?: POLYOMINO_TYPE): Readonly<IPolyominoConfig> {
  const _ = {
    [POLYOMINO_TYPE.I]: I,
    [POLYOMINO_TYPE.J]: J,
    [POLYOMINO_TYPE.L]: L,
    [POLYOMINO_TYPE.O]: O,
    [POLYOMINO_TYPE.S]: S,
    [POLYOMINO_TYPE.T]: T,
    [POLYOMINO_TYPE.Z]: Z,
  };
  return type !== undefined ? _[type] : I;
};

export const getRandomPolyominoType = function (): POLYOMINO_TYPE {
  const list = [
    POLYOMINO_TYPE.I,
    POLYOMINO_TYPE.J,
    POLYOMINO_TYPE.L,
    POLYOMINO_TYPE.O,
    POLYOMINO_TYPE.S,
    POLYOMINO_TYPE.T,
    POLYOMINO_TYPE.Z,
  ];
  const random = Math.floor(Math.random() * list.length);
  return list[random];
};

export const getRangeByCoordinate = function (coordinate: Array<ICoordinate>): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const _x = coordinate.map(({ x }) => x);
  const _y = coordinate.map(({ y }) => y);
  return {
    maxX: Math.max(..._x),
    minX: Math.min(..._x),
    maxY: Math.max(..._y),
    minY: Math.min(..._y),
  };
};

export const getNewCoordinateByAnchorAndShapeAndType = function (
  type: POLYOMINO_TYPE,
  shape: POLYOMINO_SHAPE,
  anchor: ICoordinate
): Array<ICoordinate> {
  const coordinateConfig = getPolyominoConfig(type);
  return coordinateConfig.coordinate[shape].coordinate.map(({ x, y }) => {
    return {
      x: x + anchor.x,
      y: y + anchor.y,
    };
  });
};

export const getNewAnchorByAnchorAndShapeAndType = function (
  type: POLYOMINO_TYPE,
  shape: POLYOMINO_SHAPE,
  nextShape: POLYOMINO_SHAPE,
  anchor: ICoordinate
): ICoordinate {
  const coordinateConfig = getPolyominoConfig(type);
  const { x: currentX, y: currentY } =
    coordinateConfig.coordinate[shape].coordinate[coordinateConfig.coordinate[shape].anchorIndex];
  const { x: nextX, y: nextY } =
    coordinateConfig.coordinate[shape].coordinate[coordinateConfig.coordinate[nextShape].anchorIndex];
  return {
    x: anchor.x + (nextX - currentX),
    y: anchor.y + (nextY - currentY),
  };
};

export const getPolyominoNextShape = function (shape: POLYOMINO_SHAPE) {
  if (shape === POLYOMINO_SHAPE.FIRST) {
    return POLYOMINO_SHAPE.SECOND;
  } else if (shape === POLYOMINO_SHAPE.SECOND) {
    return POLYOMINO_SHAPE.THIRD;
  } else if (shape === POLYOMINO_SHAPE.THIRD) {
    return POLYOMINO_SHAPE.FOURTH;
  } else if (shape === POLYOMINO_SHAPE.FOURTH) {
    return POLYOMINO_SHAPE.FIRST;
  } else {
    return POLYOMINO_SHAPE.FIRST;
  }
};

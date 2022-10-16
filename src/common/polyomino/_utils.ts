import { POLYOMINO_SHAPE, POLYOMINO_TYPE, ICoordinate, IPolyominoConfig, POLYOMINO_ROTATION } from "./_type";
import { I } from "./I";
import { J } from "./J";
import { L } from "./L";
import { O } from "./O";
import { S } from "./S";
import { T } from "./T";
import { Z } from "./Z";
import { getRandomMixMax } from "../utils";

export const getPolyominoConfig = function (type: POLYOMINO_TYPE): Readonly<IPolyominoConfig> {
  const _ = {
    [POLYOMINO_TYPE.I]: I,
    [POLYOMINO_TYPE.J]: J,
    [POLYOMINO_TYPE.L]: L,
    [POLYOMINO_TYPE.O]: O,
    [POLYOMINO_TYPE.S]: S,
    [POLYOMINO_TYPE.T]: T,
    [POLYOMINO_TYPE.Z]: Z,
  };
  return _[type];
};

const list = [
  POLYOMINO_TYPE.I,
  POLYOMINO_TYPE.J,
  POLYOMINO_TYPE.L,
  POLYOMINO_TYPE.O,
  POLYOMINO_TYPE.S,
  POLYOMINO_TYPE.T,
  POLYOMINO_TYPE.Z,
];
export const getRandomPolyominoType = function (): POLYOMINO_TYPE {
  return list[getRandomMixMax(0, list.length - 1)];
};

const BAGS_LENGTH = 7;
export const getRandomPolyominoBag = function (): Array<POLYOMINO_TYPE> {
  const bags: Array<POLYOMINO_TYPE> = [];
  while (bags.length < BAGS_LENGTH) {
    if (bags.length === BAGS_LENGTH - 1) {
      list.forEach((polyominoType) => {
        if (bags.indexOf(polyominoType) === -1) {
          bags.push(polyominoType);
        }
      });
    } else {
      const randomPolyomino = getRandomPolyominoType();
      if (bags.indexOf(randomPolyomino) === -1) {
        bags.push(randomPolyomino);
      }
    }
  }
  return bags;
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

export const getCoordinateByAnchorAndShapeAndType = function (
  anchor: ICoordinate,
  type: POLYOMINO_TYPE,
  shape: POLYOMINO_SHAPE
): Array<ICoordinate> {
  const polyominoConfig = getPolyominoConfig(type);
  return polyominoConfig.config[shape].shape.coordinates.map(({ x, y }) => {
    return {
      x: x + anchor.x,
      y: y + anchor.y,
    };
  });
};

export const getBoundaryByCoordinatesAndShapeAndType = function (
  coordinates: Array<ICoordinate>,
  type: POLYOMINO_TYPE,
  shape: POLYOMINO_SHAPE
): Array<ICoordinate> {
  const polyominoConfig = getPolyominoConfig(type);
  const anchor = coordinates[polyominoConfig.config[shape].shape.anchorIndex];
  const anchorPosition =
    polyominoConfig.config[shape].boundary.position[polyominoConfig.config[shape].shape.anchorIndex];
  const ary = [];
  for (let _y = 0; _y < polyominoConfig.config[shape].boundary.size; _y += 1) {
    for (let _x = 0; _x < polyominoConfig.config[shape].boundary.size; _x += 1) {
      ary.push({
        x: anchor.x + (_x - anchorPosition.x),
        y: anchor.y + (_y - anchorPosition.y),
      });
    }
  }
  return ary;
};

export const getNextCoordinateByBoundaryAndTypeAndShape = function (
  boundary: Array<ICoordinate>,
  type: POLYOMINO_TYPE,
  nextShape: POLYOMINO_SHAPE
): Array<ICoordinate> {
  const polyominoConfig = getPolyominoConfig(type);
  return polyominoConfig.config[nextShape].boundary.position.map((item) => {
    const index = item.x + item.y * polyominoConfig.config[nextShape].boundary.size;
    const coordinate = boundary[index];
    return { ...coordinate };
  });
};

export const getAnchorByCoordinatesAndTypeAndShape = function (
  coordinates: Array<ICoordinate>,
  type: POLYOMINO_TYPE,
  shape: POLYOMINO_SHAPE
): ICoordinate {
  const polyominoConfig = getPolyominoConfig(type);
  return coordinates[polyominoConfig.config[shape].shape.anchorIndex];
};

export const getPolyominoNextShape = function (shape: POLYOMINO_SHAPE, rotation: POLYOMINO_ROTATION) {
  if (rotation === POLYOMINO_ROTATION.CLOCK_WISE) {
    if (shape === POLYOMINO_SHAPE.INITIAL) {
      return POLYOMINO_SHAPE.RIGHT;
    } else if (shape === POLYOMINO_SHAPE.RIGHT) {
      return POLYOMINO_SHAPE.TWICE;
    } else if (shape === POLYOMINO_SHAPE.TWICE) {
      return POLYOMINO_SHAPE.LEFT;
    } else if (shape === POLYOMINO_SHAPE.LEFT) {
      return POLYOMINO_SHAPE.INITIAL;
    } else {
      return POLYOMINO_SHAPE.INITIAL;
    }
  } else {
    if (shape === POLYOMINO_SHAPE.INITIAL) {
      return POLYOMINO_SHAPE.LEFT;
    } else if (shape === POLYOMINO_SHAPE.RIGHT) {
      return POLYOMINO_SHAPE.INITIAL;
    } else if (shape === POLYOMINO_SHAPE.TWICE) {
      return POLYOMINO_SHAPE.RIGHT;
    } else if (shape === POLYOMINO_SHAPE.LEFT) {
      return POLYOMINO_SHAPE.TWICE;
    } else {
      return POLYOMINO_SHAPE.INITIAL;
    }
  }
};

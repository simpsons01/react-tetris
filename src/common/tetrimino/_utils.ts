import {
  TETRIMINO_SHAPE,
  TETRIMINO_TYPE,
  ICoordinate,
  ITetriminoConfig,
  TETRIMINO_ROTATION_DIRECTION,
} from "./_type";
import { I } from "./I";
import { J } from "./J";
import { L } from "./L";
import { O } from "./O";
import { S } from "./S";
import { T } from "./T";
import { Z } from "./Z";
import { getRandomMixMax } from "../utils";

export const getTetriminoConfig = (type: TETRIMINO_TYPE): Readonly<ITetriminoConfig> => {
  const _ = {
    [TETRIMINO_TYPE.I]: I,
    [TETRIMINO_TYPE.J]: J,
    [TETRIMINO_TYPE.L]: L,
    [TETRIMINO_TYPE.O]: O,
    [TETRIMINO_TYPE.S]: S,
    [TETRIMINO_TYPE.T]: T,
    [TETRIMINO_TYPE.Z]: Z,
  };
  return _[type];
};

const list = [
  TETRIMINO_TYPE.I,
  TETRIMINO_TYPE.J,
  TETRIMINO_TYPE.L,
  TETRIMINO_TYPE.O,
  TETRIMINO_TYPE.S,
  TETRIMINO_TYPE.T,
  TETRIMINO_TYPE.Z,
];
export const getRandomTetriminoType = (): TETRIMINO_TYPE => {
  return list[getRandomMixMax(0, list.length - 1)];
};

const BAGS_LENGTH = 7;
export const getRandomTetriminoBag = (): Array<TETRIMINO_TYPE> => {
  const bags: Array<TETRIMINO_TYPE> = [];
  while (bags.length < BAGS_LENGTH) {
    if (bags.length === BAGS_LENGTH - 1) {
      list.forEach((TetriminoType) => {
        if (bags.indexOf(TetriminoType) === -1) {
          bags.push(TetriminoType);
        }
      });
    } else {
      const randomTetrimino = getRandomTetriminoType();
      if (bags.indexOf(randomTetrimino) === -1) {
        bags.push(randomTetrimino);
      }
    }
  }
  return bags;
};

export const getRangeByCoordinates = (
  coordinates: Array<ICoordinate>
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} => {
  const _x = coordinates.map(({ x }) => x);
  const _y = coordinates.map(({ y }) => y);
  return {
    maxX: Math.max(..._x),
    minX: Math.min(..._x),
    maxY: Math.max(..._y),
    minY: Math.min(..._y),
  };
};

export const getSizeByCoordinates = (
  coordinates: Array<ICoordinate>
): {
  horizontal: number;
  vertical: number;
} => {
  const { maxX, minX, maxY, minY } = getRangeByCoordinates(coordinates);
  return {
    vertical: maxY - minY + 1,
    horizontal: maxX - minX + 1,
  };
};

export const getCoordinateByAnchorAndShapeAndType = (
  anchor: ICoordinate,
  type: TETRIMINO_TYPE,
  shape: TETRIMINO_SHAPE
): Array<ICoordinate> => {
  const TetriminoConfig = getTetriminoConfig(type);
  return TetriminoConfig.config[shape].shape.coordinates.map(({ x, y }) => {
    return {
      x: x + anchor.x,
      y: y + anchor.y,
    };
  });
};

export const getBoundaryByCoordinatesAndShapeAndType = (
  coordinates: Array<ICoordinate>,
  type: TETRIMINO_TYPE,
  shape: TETRIMINO_SHAPE
): Array<ICoordinate> => {
  const TetriminoConfig = getTetriminoConfig(type);
  const anchor = coordinates[TetriminoConfig.config[shape].shape.anchorIndex];
  const anchorPosition =
    TetriminoConfig.config[shape].boundary.position[TetriminoConfig.config[shape].shape.anchorIndex];
  const ary = [];
  for (let _y = 0; _y < TetriminoConfig.config[shape].boundary.size; _y += 1) {
    for (let _x = 0; _x < TetriminoConfig.config[shape].boundary.size; _x += 1) {
      ary.push({
        x: anchor.x + (_x - anchorPosition.x),
        y: anchor.y + (_y - anchorPosition.y),
      });
    }
  }
  return ary;
};

export const getNextCoordinateByBoundaryAndTypeAndShape = (
  boundary: Array<ICoordinate>,
  type: TETRIMINO_TYPE,
  nextShape: TETRIMINO_SHAPE
): Array<ICoordinate> => {
  const TetriminoConfig = getTetriminoConfig(type);
  return TetriminoConfig.config[nextShape].boundary.position.map((item) => {
    const index = item.x + item.y * TetriminoConfig.config[nextShape].boundary.size;
    const coordinate = boundary[index];
    return { ...coordinate };
  });
};

export const getAnchorByCoordinatesAndTypeAndShape = (
  coordinates: Array<ICoordinate>,
  type: TETRIMINO_TYPE,
  shape: TETRIMINO_SHAPE
): ICoordinate => {
  const TetriminoConfig = getTetriminoConfig(type);
  return coordinates[TetriminoConfig.config[shape].shape.anchorIndex];
};

export const getTetriminoNextShape = (shape: TETRIMINO_SHAPE, rotation: TETRIMINO_ROTATION_DIRECTION) => {
  if (rotation === TETRIMINO_ROTATION_DIRECTION.CLOCK_WISE) {
    if (shape === TETRIMINO_SHAPE.INITIAL) {
      return TETRIMINO_SHAPE.RIGHT;
    } else if (shape === TETRIMINO_SHAPE.RIGHT) {
      return TETRIMINO_SHAPE.TWICE;
    } else if (shape === TETRIMINO_SHAPE.TWICE) {
      return TETRIMINO_SHAPE.LEFT;
    } else if (shape === TETRIMINO_SHAPE.LEFT) {
      return TETRIMINO_SHAPE.INITIAL;
    } else {
      return TETRIMINO_SHAPE.INITIAL;
    }
  } else {
    if (shape === TETRIMINO_SHAPE.INITIAL) {
      return TETRIMINO_SHAPE.LEFT;
    } else if (shape === TETRIMINO_SHAPE.RIGHT) {
      return TETRIMINO_SHAPE.INITIAL;
    } else if (shape === TETRIMINO_SHAPE.TWICE) {
      return TETRIMINO_SHAPE.RIGHT;
    } else if (shape === TETRIMINO_SHAPE.LEFT) {
      return TETRIMINO_SHAPE.TWICE;
    } else {
      return TETRIMINO_SHAPE.INITIAL;
    }
  }
};

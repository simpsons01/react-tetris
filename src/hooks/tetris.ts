import React from "react";
import { ITetris } from "../components/Tetris";
import {
  CUBE_STATE,
  DEFAULT_POLYOMINO_SHAPE,
  DIRECTION,
  getPolyominoConfig,
  getRamdomPolyominoType,
  getRangeByCoordinate,
  ICoordinate,
  ICube,
} from "../common/polyomino";
import usePolyomino from "./polyomino";
import { getKeys } from "../common/utils";

const useTetris = function (col: number, row: number) {
  const { polyomino, setPolyomino, polyominoInfo, polyominoCoordinate } = usePolyomino();
  const [tetrisData, setTetrisData] = React.useState<ITetris["data"]>(
    new Array(row).fill(null).map((_, rowIndex) => {
      return new Array(col).fill(null).map((_, colIndex) => {
        return {
          x: colIndex,
          y: rowIndex,
          strokeColor: "",
          fillColor: "",
          state: CUBE_STATE.UNFILLED,
        };
      });
    })
  );

  const findCube = React.useCallback(
    (coordinate: ICoordinate): (ICube & { state: CUBE_STATE }) | null => {
      let cube = null;
      try {
        cube = tetrisData[coordinate.y][coordinate.x];
        return cube;
      } catch (error) {
        console.warn(`x: ${coordinate.x} and y: ${coordinate.y} is not in tetrisData`);
        return cube;
      }
    },
    [tetrisData]
  );

  const createPolyomino = React.useCallback(() => {
    const type = getRamdomPolyominoType();
    const config = getPolyominoConfig(type);
    const { coordinate, anchorIndex } = config.coordinate[DEFAULT_POLYOMINO_SHAPE];
    const range = getRangeByCoordinate(coordinate);
    setPolyomino({
      type,
      shape: DEFAULT_POLYOMINO_SHAPE,
      anchor: {
        x: Math.ceil((col - (range.maxX - range.minX + 1)) / 2) - range.minX,
        y: coordinate[anchorIndex].y - range.minY,
      },
    });
  }, [col, setPolyomino]);

  const getPolyominIsCollideWithNearbyCube = React.useCallback(
    (coordinate?: Array<ICoordinate>) => {
      const status = { isLeftCollide: false, isRightCollide: false, isBottomCollide: false, isTopCollide: false };
      const _coordinate = coordinate ? coordinate : polyominoCoordinate;
      if (_coordinate == null) return status;
      const nearbyCube = _coordinate.reduce((acc, coordinate: ICoordinate) => {
        return [
          ...acc,
          {
            top: { x: coordinate.x, y: coordinate.y - 1 },
            right: { x: coordinate.x + 1, y: coordinate.y },
            bottom: { x: coordinate.x, y: coordinate.y + 1 },
            left: { x: coordinate.x - 1, y: coordinate.y },
          },
        ];
      }, [] as Array<{ left: ICoordinate; top: ICoordinate; right: ICoordinate; bottom: ICoordinate }>);
      nearbyCube.forEach((nearBy) => {
        getKeys(nearBy).forEach((direction) => {
          const cube = nearBy[direction];
          if (direction === "top") {
            status.isTopCollide =
              status.isTopCollide || cube.y < 0 || (findCube(cube) || {}).state === CUBE_STATE.FILLED;
          }
          if (direction === "right") {
            status.isRightCollide =
              status.isRightCollide || cube.x >= col || (findCube(cube) || {}).state === CUBE_STATE.FILLED;
          }
          if (direction === "bottom") {
            status.isBottomCollide =
              status.isBottomCollide || cube.y >= row || (findCube(cube) || {}).state === CUBE_STATE.FILLED;
          }
          if (direction === "left") {
            status.isLeftCollide =
              status.isLeftCollide || cube.x < 0 || (findCube(cube) || {}).state === CUBE_STATE.FILLED;
          }
        });
      });
      return status;
    },
    [row, col, findCube, polyominoCoordinate]
  );

  const movePolyomino = React.useCallback(
    (direction: DIRECTION) => {
      let isMoveable = false,
        x = 0,
        y = 0;
      const { isLeftCollide, isRightCollide, isBottomCollide, isTopCollide } = getPolyominIsCollideWithNearbyCube();
      // console.log("-------------------------------------------------------------");
      // console.log("isLeftCollide: " + isLeftCollide);
      // console.log("isTopCollide: " + isTopCollide);
      // console.log("isBottomCollide: " + isBottomCollide);
      // console.log("isRightCollide: " + isRightCollide);
      // console.log("--------------------------------------------------------------");
      ({
        [DIRECTION.LEFT]: () => {
          x = isLeftCollide ? 0 : -1;
          isMoveable = !isLeftCollide;
        },
        [DIRECTION.RIGHT]: () => {
          x = isRightCollide ? 0 : 1;
          isMoveable = !isRightCollide;
        },
        [DIRECTION.DOWN]: () => {
          y = isBottomCollide ? 0 : 1;
          isMoveable = !isBottomCollide;
        },
        [DIRECTION.TOP]: () => {
          y = isTopCollide ? 0 : -1;
          isMoveable = !isTopCollide;
        },
      }[direction]());
      if (isMoveable) {
        // console.log("moved!");
        // console.log("current polyomino anchor y is :" + polyomino.anchor.y + " and x is " + polyomino.anchor.x);
        // console.log(
        //   "after polyomino anchor y is :" + (polyomino.anchor.y + y) + " and x is " + (polyomino.anchor.x + x)
        // );
        setPolyomino((prevPolyominoState) => ({
          ...prevPolyominoState,
          anchor: {
            x: prevPolyominoState.anchor.x + x,
            y: prevPolyominoState.anchor.y + y,
          },
        }));
      }
      return isMoveable;
    },
    [setPolyomino, getPolyominIsCollideWithNearbyCube]
  );

  return {
    polyominoData: polyominoInfo,
    tetrisData,
    createPolyomino,
    getPolyominIsCollideWithNearbyCube,
    movePolyomino,
  };
};

export default useTetris;

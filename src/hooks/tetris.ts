import React from "react";
import { ITetris } from "../components/Tetris";
import {
  CUBE_STATE,
  DEFAULT_POLYOMINO_SHAPE,
  DIRECTION,
  getNewAnchorByAnchorAndShapeAndType,
  getNewCoordinateByAnchorAndShapeAndType,
  getPolyominoConfig,
  getPolyominoNextShape,
  getRandomPolyominoType,
  getRangeByCoordinate,
  ICoordinate,
  ICube,
  POLYOMINO_SHAPE,
  POLYOMINO_TYPE,
} from "../common/polyomino";
import usePolyomino from "./polyomino";
import { createAnimation, getKeys } from "../common/utils";

const useTetris = function (col: number, row: number) {
  const { polyomino, setPolyomino, resetPolyomino, polyominoInfo, polyominoCoordinate } = usePolyomino();
  const [tetrisData, setTetrisData] = React.useState<ITetris["data"]>(
    new Array(row * col).fill(null).map((_, index) => {
      return {
        x: index % col,
        y: Math.floor(index / col),
        strokeColor: "",
        fillColor: "",
        state: CUBE_STATE.UNFILLED,
      };
    })
  );

  const findCube = React.useCallback(
    (coordinate: ICoordinate): ICube | null => {
      if (coordinate.x < 0 || coordinate.x >= col || coordinate.y < 0 || coordinate.y >= row) {
        console.warn(`x: ${coordinate.x} and y: ${coordinate.y} is not in tetrisData`);
        return null;
      }
      const index = coordinate.x + coordinate.y * col;
      return tetrisData[index] ? tetrisData[index] : null;
    },
    [tetrisData, col, row]
  );

  const getAnchorNearbyCube = React.useCallback(
    function (anchor: ICoordinate, rangeX: number = 4, rangeY: number = 4): Array<ICube> {
      let leftX = Math.floor(rangeX / 2);
      let rightX = Math.floor(rangeX / 2);
      let topY = Math.floor(rangeY / 2);
      let bottomY = Math.floor(rangeY / 2);
      if (anchor.x - leftX < 0) {
        leftX = anchor.x - 0;
        rightX = rangeX - leftX;
      } else if (anchor.x + rightX >= col) {
        rightX = col - anchor.x - 1;
        leftX = rangeX - leftX;
      }
      if (anchor.y - topY < 0) {
        topY = anchor.y - 0;
        bottomY = rangeY - topY;
      } else if (anchor.y + bottomY >= row) {
        bottomY = row - anchor.y - 1;
        topY = rangeY - bottomY;
      }
      const topLeftAnchor = { x: anchor.x - leftX, y: anchor.y - topY };
      const bottomRightAnchor = { x: anchor.x + rightX, y: anchor.y + bottomY };
      let traverseX = 0,
        traverseY = 0,
        cubes: Array<ICube> = [];
      while (bottomRightAnchor.y - topLeftAnchor.y >= traverseY) {
        while (bottomRightAnchor.x - topLeftAnchor.x >= traverseX) {
          const coordinate = {
            x: topLeftAnchor.x + traverseX,
            y: topLeftAnchor.y + traverseY,
          };
          if (coordinate.x !== anchor.x || coordinate.y !== anchor.y) {
            const cube = findCube({
              x: topLeftAnchor.x + traverseX,
              y: topLeftAnchor.y + traverseY,
            }) as ICube;
            cubes.push(cube);
          }
          traverseX = traverseX + 1;
        }
        traverseX = 0;
        traverseY = traverseY + 1;
      }
      return cubes;
    },
    [col, row, findCube]
  );

  const getCoordinateIsCollide = React.useCallback(
    (coordinate: Array<ICoordinate>): boolean => {
      let isCollide = false;
      coordinate.forEach(({ x, y }) => {
        const cube = findCube({ x, y });
        if (cube == null || cube.state === CUBE_STATE.FILLED) {
          isCollide = true;
        }
      });
      return isCollide;
    },
    [findCube]
  );

  const getRowFilledWithCube = React.useCallback((): Array<number> => {
    let _row = 0,
      filledRow = [];
    while (_row < row) {
      let _col = 0,
        isAllFilled = true;
      while (_col < col) {
        const cube = findCube({ x: _col, y: _row });
        if (cube !== null && cube.state === CUBE_STATE.UNFILLED) {
          isAllFilled = false;
        }
        _col += 1;
      }
      if (isAllFilled) filledRow.push(_row);
      _row += 1;
    }
    return filledRow;
  }, [col, row, findCube]);

  const createPolyomino = React.useCallback((): void => {
    const type = getRandomPolyominoType();
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

  const getPolyominoIsCollideWithNearbyCube = React.useCallback(
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
      const { isLeftCollide, isRightCollide, isBottomCollide, isTopCollide } = getPolyominoIsCollideWithNearbyCube();
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
    [setPolyomino, getPolyominoIsCollideWithNearbyCube]
  );

  const changePolyominoShape = React.useCallback(
    (shape?: POLYOMINO_SHAPE): boolean => {
      let isChangeSuccess = false;
      if (polyomino.type == null) return isChangeSuccess;
      const nextShape = shape !== undefined ? shape : getPolyominoNextShape(polyomino.shape);
      const nextAnchor = getNewAnchorByAnchorAndShapeAndType(
        polyomino.type,
        polyomino.shape,
        nextShape,
        polyomino.anchor
      );
      const nextCoordinate = getNewCoordinateByAnchorAndShapeAndType(polyomino.type, nextShape, nextAnchor);
      // console.log(nextCoordinate);
      const isNextCoordinateCollide = getCoordinateIsCollide(nextCoordinate);
      if (!isNextCoordinateCollide) {
        setPolyomino((prevPolyomino) => ({
          ...prevPolyomino,
          shape: nextShape,
          anchor: nextAnchor,
        }));
        isChangeSuccess = true;
        return isChangeSuccess;
      }
      const nextAnchorNearbyCubes = getAnchorNearbyCube(nextAnchor);
      const notCollideAnchor = nextAnchorNearbyCubes.filter((cube) => {
        const _coordinate = getNewCoordinateByAnchorAndShapeAndType(polyomino.type as POLYOMINO_TYPE, nextShape, {
          x: cube.x,
          y: cube.y,
        });
        return !getCoordinateIsCollide(_coordinate);
      });
      // console.log(notCollideAnchor);
      if (notCollideAnchor.length === 0) return isChangeSuccess;
      const nearestAnchor = notCollideAnchor.reduce(
        (acc, cube) => {
          if (
            Math.abs(cube.x - nextAnchor.x) + Math.abs(cube.y - nextAnchor.y) <
            Math.abs(acc.x - nextAnchor.x) + Math.abs(acc.y - nextAnchor.y)
          ) {
            return { x: cube.x, y: cube.y };
          }
          return acc;
        },
        { x: notCollideAnchor[0].x, y: notCollideAnchor[0].y } as ICoordinate
      );
      setPolyomino((prevPolyomino) => ({
        ...prevPolyomino,
        shape: nextShape,
        anchor: nearestAnchor,
      }));
      isChangeSuccess = true;
      return isChangeSuccess;
    },
    [polyomino, setPolyomino, getCoordinateIsCollide, getAnchorNearbyCube]
  );

  const setPolyominoToTetrisData = React.useCallback((): void => {
    if (polyominoInfo == null) return;
    setTetrisData((prevTetrisData) =>
      prevTetrisData.map((cube) => {
        const cubeInPolyomino = polyominoInfo.find(({ x, y }) => cube.x === x && cube.y === y);
        if (cubeInPolyomino !== undefined && cube.state === CUBE_STATE.UNFILLED) {
          return {
            ...cubeInPolyomino,
            state: CUBE_STATE.FILLED,
          };
        }
        return cube;
      })
    );
    resetPolyomino();
  }, [polyominoInfo, resetPolyomino]);

  const clearRowFilledWithCube = React.useCallback(
    (filledRow?: Array<number>): Promise<void> => {
      return new Promise((resolve) => {
        filledRow = filledRow ? filledRow : getRowFilledWithCube();
        if (filledRow.length === 0) {
          resolve();
          return;
        }
        const removeCubePerUpdate = 2;
        const removeIndex = [
          [4, 5],
          [3, 6],
          [2, 7],
          [1, 8],
          [0, 9],
        ];
        let executedTime = 0;
        const times = col / removeCubePerUpdate;
        const duration = 0.2;
        const perUpdateTime = duration / times;
        const _ = createAnimation(
          (elapse) => {
            if (elapse > executedTime * perUpdateTime && executedTime < times) {
              ((executedTime) => {
                setTetrisData((prevTetrisData) => {
                  return prevTetrisData.map((cube) => {
                    if (
                      (filledRow as Array<number>).indexOf(cube.y) > -1 &&
                      removeIndex[executedTime].indexOf(cube.x) > -1
                    ) {
                      return {
                        ...cube,
                        strokeColor: "",
                        fillColor: "",
                        state: CUBE_STATE.UNFILLED,
                      };
                    }
                    return cube;
                  });
                });
              })(executedTime);
              executedTime += 1;
            }
          },
          () => resolve(),
          duration
        );
        _.start();
      });
    },
    [col, getRowFilledWithCube]
  );

  return {
    polyomino,
    polyominoData: polyominoInfo,
    tetrisData,
    getPolyominoIsCollideWithNearbyCube,
    getAnchorNearbyCube,
    getRowFilledWithCube,
    createPolyomino,
    movePolyomino,
    changePolyominoShape,
    clearRowFilledWithCube,
    setPolyominoToTetrisData,
  };
};

export default useTetris;

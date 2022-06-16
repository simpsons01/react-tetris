import React from "react";
import { ITetris } from "../components/Tetris";
import {
  CUBE_STATE,
  DEFAULT_POLYOMINO_SHAPE,
  DIRECTION,
  getAnchorByAnchorAndShapeAndType,
  getCoordinateByAnchorAndShapeAndType,
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
import { createAnimation, getKeys, IAnimation, minMax, setRef } from "../common/utils";

// const condition = (index: number, col: number) =>
//   (Math.floor(index / col) === 17 && (index % col) % 2 === 0) ||
//   (Math.floor(index / col) === 19 && (index % col) % 2 !== 0)
const condition = (index: number, col: number) => false;

const useTetris = function (col: number, row: number) {
  const { polyomino, setPolyomino, resetPolyomino, polyominoInfo, polyominoCoordinate } = usePolyomino();
  const [tetrisData, setTetrisData] = React.useState<ITetris["data"]>(
    new Array(row * col).fill(null).map((_, index) => {
      return {
        x: index % col,
        y: Math.floor(index / col),
        strokeColor: condition(index, col) ? "#292929" : "",
        fillColor: condition(index, col) ? "#A6A6A6" : "",
        state: condition(index, col) ? CUBE_STATE.FILLED : CUBE_STATE.UNFILLED,
      };
    })
  );
  const clearRowAnimationRef = React.useRef<IAnimation | null>(null);
  const fillRowAnimationRef = React.useRef<IAnimation | null>(null);

  const findCube = React.useCallback(
    (coordinate: ICoordinate): ICube | null => {
      if (coordinate.x < 0 || coordinate.x >= col || coordinate.y < 0 || coordinate.y >= row) {
        // console.warn(`x: ${coordinate.x} and y: ${coordinate.y} is not in tetrisData`);
        return null;
      }
      const index = coordinate.x + coordinate.y * col;
      return tetrisData[index] ? tetrisData[index] : null;
    },
    [tetrisData, col, row]
  );

  const getAnchorNearbyCube = React.useCallback(
    (anchor: ICoordinate, rangeX: number = 4, rangeY: number = 4): Array<ICube> => {
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
      for (let i = 0; i < coordinate.length; i++) {
        const cube = findCube(coordinate[i]);
        if (cube == null || cube.state === CUBE_STATE.FILLED) {
          isCollide = true;
        }
        if (isCollide) break;
      }
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
      const nextAnchor = getAnchorByAnchorAndShapeAndType(polyomino.type, polyomino.shape, nextShape, polyomino.anchor);
      const nextCoordinate = getCoordinateByAnchorAndShapeAndType(polyomino.type, nextShape, nextAnchor);
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
        const _coordinate = getCoordinateByAnchorAndShapeAndType(polyomino.type as POLYOMINO_TYPE, nextShape, {
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
        const duration = 1;
        const perUpdateTime = duration / times;
        setRef(
          clearRowAnimationRef,
          createAnimation(
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
            () => {
              setRef(clearRowAnimationRef, null);
              resolve();
            },
            duration
          )
        );
        window.requestAnimationFrame((clearRowAnimationRef.current as IAnimation).start);
      });
    },
    [col, getRowFilledWithCube]
  );

  const getRowGapInfo = React.useCallback((): Array<{ not_empty: Array<number>; empty: Array<number> }> => {
    let _row = 0,
      start = false,
      count = -1,
      isLastRowAllEmpty = false,
      ary: Array<{ not_empty: Array<number>; empty: Array<number> }> = [];
    while (_row < row) {
      let _col = 0,
        isAllEmpty = true;
      while (_col < col && isAllEmpty) {
        isAllEmpty = (findCube({ x: _col, y: _row }) as ICube).state === CUBE_STATE.UNFILLED;
        _col += 1;
      }
      if (!isAllEmpty) {
        if (!start) start = true;
      }
      if (!isAllEmpty && (isLastRowAllEmpty || _row === 0)) {
        count += 1;
      }
      if (start) {
        if (ary[count] === undefined) ary[count] = { not_empty: [], empty: [] };
        if (isAllEmpty) {
          ary[count].empty.push(_row);
        } else {
          ary[count].not_empty.push(_row);
        }
      }
      isLastRowAllEmpty = isAllEmpty;
      _row += 1;
    }
    ary = ary.filter(({ empty }) => empty.length !== 0);
    return ary;
  }, [findCube, row, col]);

  // TODO: 想更好的變數命名
  const fillEmptyRow = React.useCallback(
    (rowGapInfo: Array<{ not_empty: Array<number>; empty: Array<number> }>): Promise<void> => {
      return new Promise((resolve) => {
        const zzzzzzzzz = rowGapInfo.reduce((acc, { empty, not_empty }) => {
          const bottommostEmptyRow = Math.max(...empty);
          const bottommostNotEmptyRow = Math.max(...not_empty);
          const distance = bottommostEmptyRow - bottommostNotEmptyRow;
          not_empty.forEach((row) => {
            acc.push({
              start: row,
              end: row + distance,
            });
          });
          return acc;
        }, [] as Array<{ start: number; end: number }>);
        const duration = 1;
        setRef(
          fillRowAnimationRef,
          createAnimation(
            (elapse) => {
              console.log("animation start!");
              const start = 0;
              const end = 1;
              const progress = minMax(elapse / duration, start, end);
              // console.log("progress is " + progress);
              setTetrisData((prevTetrisData) =>
                prevTetrisData.map((cube, cubeIndex) => {
                  const cubeRow = Math.floor(cubeIndex / col);
                  if (progress === end) {
                    const eeeeeeee = zzzzzzzzz.find(({ end }) => end === cubeRow);
                    const ddddddd = zzzzzzzzz.find(({ start }) => start === cubeRow);
                    if (eeeeeeee !== undefined) {
                      const index = eeeeeeee.start * col + (cubeIndex % col);
                      return {
                        ...cube,
                        state: prevTetrisData[index].state,
                        strokeColor: prevTetrisData[index].strokeColor,
                        fillColor: prevTetrisData[index].fillColor,
                        y: cubeRow,
                      };
                    } else if (ddddddd !== undefined) {
                      return {
                        ...cube,
                        state: CUBE_STATE.UNFILLED,
                        strokeColor: "",
                        fillColor: "",
                        y: cubeRow,
                      };
                    }
                  } else {
                    const ddddddd = zzzzzzzzz.find(({ start }) => start === cubeRow);
                    if (ddddddd !== undefined) {
                      const y = cubeRow + (ddddddd.end - ddddddd.start) * progress;
                      return {
                        ...cube,
                        y,
                      };
                    }
                  }
                  return cube;
                })
              );
            },
            () => {
              // console.log("animation end!");
              setRef(fillRowAnimationRef, null);
              resolve();
            },
            duration
          )
        );
        window.requestAnimationFrame((fillRowAnimationRef.current as IAnimation).start);
      });
    },
    [col]
  );

  const getPolyominoPreviewCoordinate = React.useCallback((): null | Array<ICoordinate> => {
    let previewCollideCoordinate: null | Array<ICoordinate> = null;
    if (polyomino.type !== null) {
      for (let nextY = polyomino.anchor.y + 1; nextY < row; nextY++) {
        const nextCoordinate = getCoordinateByAnchorAndShapeAndType(polyomino.type, polyomino.shape, {
          y: nextY,
          x: polyomino.anchor.x,
        });
        const isNextCoordinateCollide = getCoordinateIsCollide(nextCoordinate);
        if (isNextCoordinateCollide) {
          break;
        }
        const { isBottomCollide } = getPolyominoIsCollideWithNearbyCube(nextCoordinate);
        if (isBottomCollide) {
          previewCollideCoordinate = nextCoordinate;
        }
      }
    }
    return previewCollideCoordinate;
  }, [getCoordinateIsCollide, getPolyominoIsCollideWithNearbyCube, polyomino, row]);

  const previewPolyomino = React.useMemo((): Array<ICube> | null => {
    const previewCoordinate = getPolyominoPreviewCoordinate();
    if (previewCoordinate !== null && polyomino.type !== null) {
      const { strokeColor, fillColor } = getPolyominoConfig(polyomino.type);
      return previewCoordinate.map(({ x, y }) => ({
        x,
        y,
        strokeColor,
        fillColor,
      })) as Array<ICube>;
    }
    return null;
  }, [getPolyominoPreviewCoordinate, polyomino]);

  const pauseClearRowAnimation = React.useCallback(() => {
    if (clearRowAnimationRef.current !== null && clearRowAnimationRef.current.isStart()) {
      clearRowAnimationRef.current.pause();
    }
  }, []);

  const continueClearRowAnimation = React.useCallback(() => {
    if (clearRowAnimationRef.current !== null && !clearRowAnimationRef.current.isStart()) {
      window.requestAnimationFrame(clearRowAnimationRef.current.start);
    }
  }, []);

  const pauseFillRowAnimationRef = React.useCallback(() => {
    if (fillRowAnimationRef.current !== null && fillRowAnimationRef.current.isStart()) {
      fillRowAnimationRef.current.pause();
    }
  }, []);

  const continueFillRowAnimationRef = React.useCallback(() => {
    if (fillRowAnimationRef.current !== null && !fillRowAnimationRef.current.isStart()) {
      window.requestAnimationFrame(fillRowAnimationRef.current.start);
    }
  }, []);

  return {
    polyomino,
    polyominoData: polyominoInfo,
    polyominoCoordinate,
    tetrisData,
    previewPolyomino,
    getCoordinateIsCollide,
    getPolyominoIsCollideWithNearbyCube,
    getAnchorNearbyCube,
    getRowFilledWithCube,
    getPolyominoPreviewCoordinate,
    createPolyomino,
    movePolyomino,
    changePolyominoShape,
    clearRowFilledWithCube,
    setPolyominoToTetrisData,
    getRowGapInfo,
    fillEmptyRow,
    pauseClearRowAnimation,
    continueClearRowAnimation,
    pauseFillRowAnimationRef,
    continueFillRowAnimationRef,
  };
};

export default useTetris;

import { useCallback, useState, useRef, useMemo } from "react";
import { IPlayFieldRenderer } from "../components/PlayField/Renderer";
import {
  CUBE_STATE,
  DEFAULT_TETRIMINO_SHAPE,
  DIRECTION,
  getCoordinateByAnchorAndShapeAndType,
  getTetriminoConfig,
  getTetriminoNextShape,
  ICoordinate,
  ICube,
  ITetriminoConfig,
  TETRIMINO_SHAPE,
  TETRIMINO_TYPE,
  Tetrimino_ROTATION,
  getBoundaryByCoordinatesAndShapeAndType,
  getNextCoordinateByBoundaryAndTypeAndShape,
  getAnchorByCoordinatesAndTypeAndShape,
} from "../common/tetrimino";
import useTetrimino from "./tetrimino";
import { getKeys, minMax, setRef } from "../common/utils";
import { createAnimation } from "../common/animation";
import { nanoid } from "nanoid";
import {
  PER_ROW_CUBE_NUM,
  PER_COL_CUBE_NUM,
  DISPLAY_ZONE_ROW_START,
  DISPLAY_ZONE_ROW_END,
} from "../common/matrix";

// const condition = (index: number, col: number) =>
//   (Math.floor(index / col) === 17 && (index % col) % 2 === 0) ||
//   (Math.floor(index / col) === 19 && (index % col) % 2 !== 0)
const condition = (index: number, col: number) => false;

const createMatrix = () =>
  new Array(PER_ROW_CUBE_NUM * PER_COL_CUBE_NUM).fill(null).map((_, index) => {
    return {
      x: index % PER_COL_CUBE_NUM,
      y: Math.floor(index / PER_COL_CUBE_NUM),
      id: nanoid(),
      state: condition(index, PER_COL_CUBE_NUM) ? CUBE_STATE.FILLED : CUBE_STATE.UNFILLED,
    };
  });

const useMatrix = function () {
  const { tetrimino, setTetrimino, resetTetrimino, tetriminoCoordinates } = useTetrimino();
  const [matrix, setMatrix] = useState<IPlayFieldRenderer["matrix"]>(createMatrix());
  const fillAllRowAnimationRef = useRef<ReturnType<typeof createAnimation> | null>(null);
  const clearRowAnimationRef = useRef<ReturnType<typeof createAnimation> | null>(null);
  const fillRowAnimationRef = useRef<ReturnType<typeof createAnimation> | null>(null);

  const displayMatrix = useMemo(
    () =>
      matrix
        .slice(DISPLAY_ZONE_ROW_START * PER_COL_CUBE_NUM, (DISPLAY_ZONE_ROW_END + 1) * PER_COL_CUBE_NUM)
        .map((cube) => ({ ...cube, y: cube.y - DISPLAY_ZONE_ROW_START })),
    [matrix]
  );

  const displayTetriminoCoordinates = useMemo(
    () =>
      tetriminoCoordinates
        ? tetriminoCoordinates.map((cube) => ({ ...cube, y: cube.y - DISPLAY_ZONE_ROW_START }))
        : null,
    [tetriminoCoordinates]
  );

  const findCube = useCallback(
    (coordinate: ICoordinate): ICube | null => {
      if (
        coordinate.x < 0 ||
        coordinate.x >= PER_COL_CUBE_NUM ||
        coordinate.y < 0 ||
        coordinate.y >= PER_ROW_CUBE_NUM
      ) {
        // console.warn(`x: ${coordinate.x} and y: ${coordinate.y} is not in matrix`);
        return null;
      }
      const index = coordinate.x + coordinate.y * PER_COL_CUBE_NUM;
      return matrix[index] ? matrix[index] : null;
    },
    [matrix]
  );

  const getCoordinatesIsCollideWithFilledCube = useCallback(
    (coordinates: Array<ICoordinate>): boolean => {
      let isCollide = false;
      for (let i = 0; i < coordinates.length; i++) {
        const cube = findCube(coordinates[i]);
        if (cube == null || cube.state === CUBE_STATE.FILLED) {
          isCollide = true;
        }
        if (isCollide) break;
      }
      return isCollide;
    },
    [findCube]
  );

  const getIsCoordinatesLockOut = useCallback(
    (coordinates: Array<ICoordinate>) =>
      coordinates.every((coordinate) => coordinate.y < DISPLAY_ZONE_ROW_START),
    []
  );

  const getRowFilledWithCube = useCallback((): Array<number> => {
    let _row = 20,
      filledRow = [];
    while (_row < DISPLAY_ZONE_ROW_END + 1) {
      let _col = 0,
        isAllFilled = true;
      while (_col < PER_COL_CUBE_NUM) {
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
  }, [findCube]);

  const getSpawnTetrimino = useCallback((nextTetriminoType: TETRIMINO_TYPE) => {
    const tetriminoConfig = getTetriminoConfig(nextTetriminoType);
    const { spawnStartLocation } = tetriminoConfig;
    return {
      type: nextTetriminoType,
      shape: DEFAULT_TETRIMINO_SHAPE,
      anchor: spawnStartLocation,
    };
  }, []);

  const getTetriminoIsCollideWithNearbyCube = useCallback(
    (coordinate?: Array<ICoordinate>) => {
      const status = {
        isLeftCollide: false,
        isRightCollide: false,
        isBottomCollide: false,
        isTopCollide: false,
      };
      const _coordinate = coordinate ? coordinate : tetriminoCoordinates;
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
              status.isRightCollide ||
              cube.x >= PER_COL_CUBE_NUM ||
              (findCube(cube) || {}).state === CUBE_STATE.FILLED;
          }
          if (direction === "bottom") {
            status.isBottomCollide =
              status.isBottomCollide ||
              cube.y >= PER_ROW_CUBE_NUM ||
              (findCube(cube) || {}).state === CUBE_STATE.FILLED;
          }
          if (direction === "left") {
            status.isLeftCollide =
              status.isLeftCollide || cube.x < 0 || (findCube(cube) || {}).state === CUBE_STATE.FILLED;
          }
        });
      });
      return status;
    },
    [findCube, tetriminoCoordinates]
  );

  const getTetriminoPreviewCoordinates = useCallback((): null | Array<ICoordinate> => {
    let previewCollideCoordinates: null | Array<ICoordinate> = null;
    if (tetrimino.type !== null) {
      for (let nextY = tetrimino.anchor.y + 1; nextY < PER_ROW_CUBE_NUM; nextY++) {
        const nextCoordinate = getCoordinateByAnchorAndShapeAndType(
          {
            y: nextY,
            x: tetrimino.anchor.x,
          },
          tetrimino.type,
          tetrimino.shape
        );
        const isNextCoordinateCollide = getCoordinatesIsCollideWithFilledCube(nextCoordinate);
        if (isNextCoordinateCollide) {
          break;
        }
        const { isBottomCollide } = getTetriminoIsCollideWithNearbyCube(nextCoordinate);
        if (isBottomCollide) {
          previewCollideCoordinates = nextCoordinate;
        }
      }
    }
    return previewCollideCoordinates;
  }, [getCoordinatesIsCollideWithFilledCube, getTetriminoIsCollideWithNearbyCube, tetrimino]);

  const moveTetrimino = useCallback(
    (direction: DIRECTION) => {
      let isMoveable = false,
        x = 0,
        y = 0;
      const { isLeftCollide, isRightCollide, isBottomCollide, isTopCollide } =
        getTetriminoIsCollideWithNearbyCube();
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
        // console.log("current Tetrimino anchor y is :" + tetrimino.anchor.y + " and x is " + tetrimino.anchor.x);
        // console.log(
        //   "after Tetrimino anchor y is :" + (tetrimino.anchor.y + y) + " and x is " + (tetrimino.anchor.x + x)
        // );
        setTetrimino((prevTetriminoState) => ({
          ...prevTetriminoState,
          anchor: {
            x: prevTetriminoState.anchor.x + x,
            y: prevTetriminoState.anchor.y + y,
          },
        }));
      }
      return isMoveable;
    },
    [setTetrimino, getTetriminoIsCollideWithNearbyCube]
  );

  const moveTetriminoToPreview = useCallback((): void => {
    const previewCoordinate = getTetriminoPreviewCoordinates();
    if (previewCoordinate !== null && tetrimino.type !== null) {
      const { anchorIndex } = (getTetriminoConfig(tetrimino.type) as ITetriminoConfig).config[tetrimino.shape]
        .shape;
      setTetrimino((prevTetriminoState) => ({
        ...prevTetriminoState,
        anchor: {
          x: previewCoordinate[anchorIndex].x,
          y: previewCoordinate[anchorIndex].y,
        },
      }));
    }
  }, [getTetriminoPreviewCoordinates, setTetrimino, tetrimino.shape, tetrimino.type]);

  const changeTetriminoShape = useCallback(
    (rotation: Tetrimino_ROTATION, shape?: TETRIMINO_SHAPE): boolean => {
      let isChangeSuccess = false;
      if (tetrimino.type == null) return isChangeSuccess;
      const nextShape = shape !== undefined ? shape : getTetriminoNextShape(tetrimino.shape, rotation);
      const boundary = getBoundaryByCoordinatesAndShapeAndType(
        tetriminoCoordinates as Array<ICoordinate>,
        tetrimino.type,
        tetrimino.shape
      );
      const nextCoordinates = getNextCoordinateByBoundaryAndTypeAndShape(boundary, tetrimino.type, nextShape);
      const nextAnchor = getAnchorByCoordinatesAndTypeAndShape(nextCoordinates, tetrimino.type, nextShape);
      // console.log(nextCoordinate);
      const isNextCoordinateCollide = getCoordinatesIsCollideWithFilledCube(nextCoordinates);
      if (!isNextCoordinateCollide) {
        setTetrimino((prevTetrimino) => ({
          ...prevTetrimino,
          shape: nextShape,
          anchor: nextAnchor,
        }));
        isChangeSuccess = true;
        return isChangeSuccess;
      } else {
        const tetriminoConfig = getTetriminoConfig(tetrimino.type);
        const retryCoordinatesOptions = tetriminoConfig.wallKick[`${tetrimino.shape}-${nextShape}`];
        for (const retryCoordinatesOption of retryCoordinatesOptions) {
          const wallKickNextAnchor = {
            x: nextAnchor.x + retryCoordinatesOption.x,
            y: nextAnchor.y + retryCoordinatesOption.y,
          };
          const wallKickNextCoordinates = getCoordinateByAnchorAndShapeAndType(
            wallKickNextAnchor,
            tetrimino.type,
            nextShape
          );
          const isWallKickNextCoordinatesCollide =
            getCoordinatesIsCollideWithFilledCube(wallKickNextCoordinates);
          if (!isWallKickNextCoordinatesCollide) {
            setTetrimino((prevTetrimino) => ({
              ...prevTetrimino,
              shape: nextShape,
              anchor: wallKickNextAnchor,
            }));
            isChangeSuccess = true;
            return isChangeSuccess;
          }
        }
        return isChangeSuccess;
      }
    },
    [tetrimino, tetriminoCoordinates, setTetrimino, getCoordinatesIsCollideWithFilledCube]
  );

  const setTetriminoToMatrix = useCallback((): void => {
    if (tetriminoCoordinates == null) return;
    setMatrix((prevMatrix) =>
      prevMatrix.map((cube) => {
        const cubeInTetrimino = tetriminoCoordinates.find(({ x, y }) => cube.x === x && cube.y === y);
        if (cubeInTetrimino !== undefined && cube.state === CUBE_STATE.UNFILLED) {
          return {
            ...cubeInTetrimino,
            id: cube.id,
            state: CUBE_STATE.FILLED,
          };
        }
        return cube;
      })
    );
    resetTetrimino();
  }, [tetriminoCoordinates, resetTetrimino]);

  const clearRowFilledWithCube = useCallback(
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
        const times = PER_COL_CUBE_NUM / removeCubePerUpdate;
        const duration = 0.3;
        const perUpdateTime = duration / times;
        setRef(
          clearRowAnimationRef,
          createAnimation(
            (elapse) => {
              if (elapse > executedTime * perUpdateTime && executedTime < times) {
                ((executedTime) => {
                  setMatrix((prevMatrix) => {
                    return prevMatrix.map((cube) => {
                      if (
                        (filledRow as Array<number>).indexOf(cube.y) > -1 &&
                        removeIndex[executedTime].indexOf(cube.x) > -1
                      ) {
                        return {
                          ...cube,
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
        window.requestAnimationFrame(
          (clearRowAnimationRef.current as ReturnType<typeof createAnimation>).start
        );
      });
    },
    [getRowFilledWithCube]
  );

  const fillAllRow = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const duration = 3;
      const perTime = 2 / PER_ROW_CUBE_NUM;
      let executedTime = 0;
      let fillRowIndex = PER_ROW_CUBE_NUM;
      setRef(
        fillAllRowAnimationRef,
        createAnimation(
          (elapse) => {
            if (executedTime <= PER_ROW_CUBE_NUM && executedTime * perTime < elapse) {
              const fillIndex = fillRowIndex;
              setMatrix((prevMatrix) => {
                return prevMatrix.map((cube) => {
                  if (cube.y === fillIndex) {
                    return {
                      ...cube,
                      state: CUBE_STATE.FILLED,
                    };
                  } else {
                    return cube;
                  }
                });
              });
              executedTime += 1;
              fillRowIndex -= 1;
            }
          },
          () => {
            setRef(fillAllRowAnimationRef, null);
            resolve();
          },
          duration
        )
      );
      window.requestAnimationFrame(
        (fillAllRowAnimationRef.current as ReturnType<typeof createAnimation>).start
      );
    });
  }, []);

  const getEmptyRow = useCallback((): Array<{
    not_empty: Array<number>;
    empty: Array<number>;
  }> => {
    let _row = 0,
      start = false,
      count = -1,
      isLastRowAllEmpty = false,
      ary: Array<{ not_empty: Array<number>; empty: Array<number> }> = [];
    while (_row < PER_ROW_CUBE_NUM) {
      let _col = 0,
        isAllEmpty = true;
      while (_col < PER_COL_CUBE_NUM && isAllEmpty) {
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
  }, [findCube]);

  // TODO: 想更好的變數命名
  const fillEmptyRow = useCallback(
    (emptyRowGap: Array<{ not_empty: Array<number>; empty: Array<number> }>): Promise<void> => {
      return new Promise((resolve) => {
        const zzzzzzzzz = emptyRowGap.reduce((acc, { empty, not_empty }) => {
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
        const duration = 0.1;
        setRef(
          fillRowAnimationRef,
          createAnimation(
            (elapse) => {
              // console.log("animation start!");
              const start = 0;
              const end = 1;
              const progress = minMax(elapse / duration, start, end);
              // console.log("progress is " + progress);
              setMatrix((prevMatrix) =>
                prevMatrix.map((cube, cubeIndex) => {
                  const cubeRow = Math.floor(cubeIndex / PER_COL_CUBE_NUM);
                  if (progress === end) {
                    const eeeeeeee = zzzzzzzzz.find(({ end }) => end === cubeRow);
                    const ddddddd = zzzzzzzzz.find(({ start }) => start === cubeRow);
                    if (eeeeeeee !== undefined) {
                      const index = eeeeeeee.start * PER_COL_CUBE_NUM + (cubeIndex % PER_COL_CUBE_NUM);
                      return {
                        ...cube,
                        state: prevMatrix[index].state,
                        y: cubeRow,
                      };
                    } else if (ddddddd !== undefined) {
                      return {
                        ...cube,
                        state: CUBE_STATE.UNFILLED,
                        // strokeColor: "",
                        // fillColor: "",
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
        window.requestAnimationFrame(
          (fillRowAnimationRef.current as ReturnType<typeof createAnimation>).start
        );
      });
    },
    []
  );

  const pauseClearRowAnimation = useCallback((): void => {
    if (clearRowAnimationRef.current !== null && clearRowAnimationRef.current.isStart()) {
      clearRowAnimationRef.current.pause();
    }
  }, []);

  const continueClearRowAnimation = useCallback((): void => {
    if (clearRowAnimationRef.current !== null && !clearRowAnimationRef.current.isStart()) {
      window.requestAnimationFrame(clearRowAnimationRef.current.start);
    }
  }, []);

  const pauseFillRowAnimation = useCallback((): void => {
    if (fillRowAnimationRef.current !== null && fillRowAnimationRef.current.isStart()) {
      fillRowAnimationRef.current.pause();
    }
  }, []);

  const continueFillRowAnimation = useCallback((): void => {
    if (fillRowAnimationRef.current !== null && !fillRowAnimationRef.current.isStart()) {
      window.requestAnimationFrame(fillRowAnimationRef.current.start);
    }
  }, []);

  const pauseFillAllRowAnimation = useCallback((): void => {
    if (fillAllRowAnimationRef.current !== null && fillAllRowAnimationRef.current.isStart()) {
      fillAllRowAnimationRef.current.pause();
    }
  }, []);

  const continueFillAllRowAnimation = useCallback((): void => {
    if (fillAllRowAnimationRef.current !== null && !fillAllRowAnimationRef.current.isStart()) {
      window.requestAnimationFrame(fillAllRowAnimationRef.current.start);
    }
  }, []);

  const resetMatrix = useCallback((): void => {
    setMatrix(createMatrix());
  }, [setMatrix]);

  return {
    tetrimino,
    tetriminoCoordinates,
    matrix,
    displayMatrix,
    displayTetriminoCoordinates,
    setTetrimino,
    setMatrix,
    resetTetrimino,
    resetMatrix,
    getCoordinatesIsCollideWithFilledCube,
    getTetriminoIsCollideWithNearbyCube,
    getRowFilledWithCube,
    getTetriminoPreviewCoordinates,
    getIsCoordinatesLockOut,
    getSpawnTetrimino,
    moveTetrimino,
    moveTetriminoToPreview,
    changeTetriminoShape,
    clearRowFilledWithCube,
    fillAllRow,
    setTetriminoToMatrix,
    getEmptyRow,
    fillEmptyRow,
    pauseClearRowAnimation,
    continueClearRowAnimation,
    pauseFillRowAnimation,
    continueFillRowAnimation,
    pauseFillAllRowAnimation,
    continueFillAllRowAnimation,
  };
};

export default useMatrix;

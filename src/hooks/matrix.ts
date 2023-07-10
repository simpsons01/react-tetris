import type { IPlayFieldRenderer } from "../components/PlayField/Renderer";
import type { ICoordinate, ICube, ITetriminoConfig } from "../common/tetrimino";
import type { ITetrimino } from "../common/tetrimino";
import useTetrimino from "./tetrimino";
import useCustomRef from "./customRef";
import { getKeys, minMax } from "../common/utils";
import { createAnimation } from "../common/animation";
import { nanoid } from "nanoid";
import {
  PER_ROW_CUBE_NUM,
  PER_COL_CUBE_NUM,
  DISPLAY_ZONE_ROW_START,
  DISPLAY_ZONE_ROW_END,
} from "../common/matrix";
import {
  CUBE_STATE,
  DEFAULT_TETRIMINO_SHAPE,
  DIRECTION,
  getCoordinateByAnchorAndShapeAndType,
  getTetriminoConfig,
  getTetriminoNextShape,
  TETRIMINO_SHAPE,
  TETRIMINO_TYPE,
  TETRIMINO_ROTATION_DIRECTION,
  getBoundaryByCoordinatesAndShapeAndType,
  getNextCoordinateByBoundaryAndTypeAndShape,
  getAnchorByCoordinatesAndTypeAndShape,
  TETRIMINO_MOVE_TYPE,
  T_SPIN_TYPE,
} from "../common/tetrimino";
import { useCallback, useState, useMemo } from "react";

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

type createAnimationReturnVal = ReturnType<typeof createAnimation>;

const useMatrix = () => {
  const {
    tetrimino,
    tetriminoCoordinates,
    prevTetriminoRef,
    setTetrimino,
    resetTetrimino,
    setPrevTetriminoRef,
    resetPrevTetriminoRef,
  } = useTetrimino();

  const [matrix, setMatrix] = useState<IPlayFieldRenderer["matrix"]>(createMatrix());

  const [fillAllRowAnimationRef, setFillAllRowAnimationRef] = useCustomRef<createAnimationReturnVal | null>(
    null
  );

  const [clearRowAnimationRef, setClearRowAnimationRef] = useCustomRef<createAnimationReturnVal | null>(null);

  const [fillRowAnimationRef, setFillRowAnimationRef] = useCustomRef<createAnimationReturnVal | null>(null);

  const [tetriminoMoveTypeRecordRef, setTetriminoMoveTypeRecordRef] = useCustomRef<
    Array<TETRIMINO_MOVE_TYPE>
  >([]);

  const [lastTetriminoRotateWallKickPositionRef, setLastTetriminoRotateWallKickPositionRef] = useCustomRef(0);

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

  const getTSpinType = useCallback(() => {
    // console.log(prevTetriminoRef.current);
    let type = null;
    if (!prevTetriminoRef.current) {
      return type;
    }
    const _prevTetrimino = prevTetriminoRef.current as ITetrimino;
    if (_prevTetrimino.type !== TETRIMINO_TYPE.T) {
      return type;
    }
    const anchorDiagonalCoordinates = {
      [TETRIMINO_SHAPE.INITIAL]: [
        { x: -1, y: -1, front: true },
        { x: 1, y: -1, front: true },
        { x: -1, y: 1, front: false },
        { x: 1, y: 1, front: false },
      ],
      [TETRIMINO_SHAPE.RIGHT]: [
        { x: 1, y: -1, front: true },
        { x: 1, y: 1, front: true },
        { x: -1, y: 1, front: false },
        { x: -1, y: -1, front: false },
      ],
      [TETRIMINO_SHAPE.TWICE]: [
        { x: 1, y: 1, front: true },
        { x: -1, y: 1, front: true },
        { x: 1, y: -1, front: false },
        { x: -1, y: -1, front: false },
      ],
      [TETRIMINO_SHAPE.LEFT]: [
        { x: -1, y: 1, front: true },
        { x: -1, y: -1, front: true },
        { x: 1, y: 1, front: false },
        { x: 1, y: -1, front: false },
      ],
    };

    const filledCubeCoordinates = anchorDiagonalCoordinates[_prevTetrimino.shape].filter(({ x, y }) => {
      const cube = findCube({
        x: _prevTetrimino.anchor.x + x,
        y: _prevTetrimino.anchor.y + y,
      });
      return cube == null || (cube && cube.state === CUBE_STATE.FILLED);
    });
    // console.log(filledCubeCoordinates);
    const lastTetriminoMoveType =
      tetriminoMoveTypeRecordRef.current[tetriminoMoveTypeRecordRef.current.length - 1];
    // console.log(lastTetriminoMoveType);
    const isLastTetriminoMoveTypeRotate =
      lastTetriminoMoveType === TETRIMINO_MOVE_TYPE.COUNTER_CLOCK_WISE_ROTATE ||
      lastTetriminoMoveType === TETRIMINO_MOVE_TYPE.CLOCK_WISE_ROTATE;
    if (isLastTetriminoMoveTypeRotate && filledCubeCoordinates.length > 2) {
      if (
        filledCubeCoordinates.filter(({ front }) => front).length === 1 &&
        lastTetriminoRotateWallKickPositionRef.current !== 4
      ) {
        type = T_SPIN_TYPE.MINI;
      } else {
        type = T_SPIN_TYPE.NORMAL;
      }
    }
    return type;
  }, [findCube, lastTetriminoRotateWallKickPositionRef, prevTetriminoRef, tetriminoMoveTypeRecordRef]);

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
      let isSuccess = false,
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
          isSuccess = !isLeftCollide;
        },
        [DIRECTION.RIGHT]: () => {
          x = isRightCollide ? 0 : 1;
          isSuccess = !isRightCollide;
        },
        [DIRECTION.DOWN]: () => {
          y = isBottomCollide ? 0 : 1;
          isSuccess = !isBottomCollide;
        },
        [DIRECTION.TOP]: () => {
          y = isTopCollide ? 0 : -1;
          isSuccess = !isTopCollide;
        },
      })[direction]();
      if (isSuccess) {
        setTetrimino((prevTetrimino) => ({
          ...prevTetrimino,
          anchor: {
            x: prevTetrimino.anchor.x + x,
            y: prevTetrimino.anchor.y + y,
          },
        }));
      }
      return isSuccess;
    },
    [setTetrimino, getTetriminoIsCollideWithNearbyCube]
  );

  const moveTetriminoToPreview = useCallback(() => {
    let isSuccess = false;
    const previewCoordinate = getTetriminoPreviewCoordinates();
    if (previewCoordinate !== null && tetrimino.type !== null) {
      const { isBottomCollide } = getTetriminoIsCollideWithNearbyCube();
      if (!isBottomCollide) {
        isSuccess = true;
        const { anchorIndex } = (getTetriminoConfig(tetrimino.type) as ITetriminoConfig).config[
          tetrimino.shape
        ].shape;
        setTetrimino((prevTetriminoState) => ({
          ...prevTetriminoState,
          anchor: {
            x: previewCoordinate[anchorIndex].x,
            y: previewCoordinate[anchorIndex].y,
          },
        }));
      }
    }
    return isSuccess;
  }, [
    getTetriminoPreviewCoordinates,
    setTetrimino,
    getTetriminoIsCollideWithNearbyCube,
    tetrimino.shape,
    tetrimino.type,
  ]);

  const changeTetriminoShape = useCallback(
    (rotation: TETRIMINO_ROTATION_DIRECTION, shape?: TETRIMINO_SHAPE): boolean => {
      let isSuccess = false;
      if (tetrimino.type == null) return isSuccess;
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
        isSuccess = true;
        return isSuccess;
      } else {
        const tetriminoConfig = getTetriminoConfig(tetrimino.type);
        const retryCoordinatesOptions = tetriminoConfig.wallKick[`${tetrimino.shape}-${nextShape}`];
        for (let i = 0; i < retryCoordinatesOptions.length; i++) {
          const retryCoordinatesOption = retryCoordinatesOptions[i];
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
            setLastTetriminoRotateWallKickPositionRef(i);
            setTetrimino((prevTetrimino) => ({
              ...prevTetrimino,
              shape: nextShape,
              anchor: wallKickNextAnchor,
            }));
            isSuccess = true;
            return isSuccess;
          }
        }

        return isSuccess;
      }
    },
    [
      tetrimino.type,
      tetrimino.shape,
      tetriminoCoordinates,
      getCoordinatesIsCollideWithFilledCube,
      setTetrimino,
      setLastTetriminoRotateWallKickPositionRef,
    ]
  );

  const setTetriminoToMatrix = useCallback(() => {
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
  }, [tetriminoCoordinates]);

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
        setClearRowAnimationRef(
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
              setClearRowAnimationRef(null);
              resolve();
            },
            duration
          )
        );
        window.requestAnimationFrame((clearRowAnimationRef.current as createAnimationReturnVal).start);
      });
    },
    [clearRowAnimationRef, getRowFilledWithCube, setClearRowAnimationRef]
  );

  const fillAllRow = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const duration = 3;
      const perTime = 2 / PER_ROW_CUBE_NUM;
      let executedTime = 0;
      let fillRowIndex = PER_ROW_CUBE_NUM;
      setFillAllRowAnimationRef(
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
            setFillRowAnimationRef(null);
            resolve();
          },
          duration
        )
      );
      window.requestAnimationFrame((fillAllRowAnimationRef.current as createAnimationReturnVal).start);
    });
  }, [fillAllRowAnimationRef, setFillAllRowAnimationRef, setFillRowAnimationRef]);

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
        setFillRowAnimationRef(
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
              setFillRowAnimationRef(null);
              resolve();
            },
            duration
          )
        );
        window.requestAnimationFrame((fillRowAnimationRef.current as createAnimationReturnVal).start);
      });
    },
    [fillRowAnimationRef, setFillRowAnimationRef]
  );

  const pauseClearRowAnimation = useCallback((): void => {
    if (clearRowAnimationRef.current !== null && clearRowAnimationRef.current.isStart()) {
      clearRowAnimationRef.current.pause();
    }
  }, [clearRowAnimationRef]);

  const continueClearRowAnimation = useCallback((): void => {
    if (clearRowAnimationRef.current !== null && !clearRowAnimationRef.current.isStart()) {
      window.requestAnimationFrame(clearRowAnimationRef.current.start);
    }
  }, [clearRowAnimationRef]);

  const pauseFillRowAnimation = useCallback((): void => {
    if (fillRowAnimationRef.current !== null && fillRowAnimationRef.current.isStart()) {
      fillRowAnimationRef.current.pause();
    }
  }, [fillRowAnimationRef]);

  const continueFillRowAnimation = useCallback((): void => {
    if (fillRowAnimationRef.current !== null && !fillRowAnimationRef.current.isStart()) {
      window.requestAnimationFrame(fillRowAnimationRef.current.start);
    }
  }, [fillRowAnimationRef]);

  const pauseFillAllRowAnimation = useCallback((): void => {
    if (fillAllRowAnimationRef.current !== null && fillAllRowAnimationRef.current.isStart()) {
      fillAllRowAnimationRef.current.pause();
    }
  }, [fillAllRowAnimationRef]);

  const continueFillAllRowAnimation = useCallback((): void => {
    if (fillAllRowAnimationRef.current !== null && !fillAllRowAnimationRef.current.isStart()) {
      window.requestAnimationFrame(fillAllRowAnimationRef.current.start);
    }
  }, [fillAllRowAnimationRef]);

  const resetMatrix = useCallback((): void => {
    setMatrix((prevMatrix) => prevMatrix.map((cube) => ({ ...cube, state: CUBE_STATE.UNFILLED })));
  }, [setMatrix]);

  return {
    tetrimino,
    tetriminoCoordinates,
    matrix,
    displayMatrix,
    displayTetriminoCoordinates,
    tetriminoMoveTypeRecordRef,
    lastTetriminoRotateWallKickPositionRef,
    prevTetriminoRef,
    setPrevTetriminoRef,
    setTetriminoMoveTypeRecordRef,
    setLastTetriminoRotateWallKickPositionRef,
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
    getTSpinType,
    resetPrevTetriminoRef,
  };
};

export default useMatrix;

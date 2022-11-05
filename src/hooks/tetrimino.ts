import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ICoordinate,
  TETRIMINO_SHAPE,
  TETRIMINO_TYPE,
  DEFAULT_TETRIMINO_SHAPE,
  getCoordinateByAnchorAndShapeAndType,
  ICube,
} from "../common/tetrimino";
import { setRef } from "../common/utils";

const createInitialTetriminoState = () => ({
  anchor: { x: -1, y: -1 },
  shape: DEFAULT_TETRIMINO_SHAPE,
  type: null,
});

export interface ITetrimino {
  anchor: ICoordinate;
  shape: TETRIMINO_SHAPE;
  type: TETRIMINO_TYPE | null;
}

const useTetrimino = function () {
  const [tetrimino, setTetrimino] = useState<ITetrimino>(createInitialTetriminoState());
  const prevTetrimino = useRef<ITetrimino>(createInitialTetriminoState());

  const tetriminoCoordinates = useMemo<Array<ICube> | null>(() => {
    if (tetrimino.type == null) return null;
    return getCoordinateByAnchorAndShapeAndType(tetrimino.anchor, tetrimino.type, tetrimino.shape).map(
      (coordinate) => ({ ...coordinate, type: tetrimino.type })
    );
  }, [tetrimino]);

  const resetTetrimino = useCallback((): void => {
    setTetrimino(createInitialTetriminoState());
  }, [setTetrimino]);

  const setPrevTetrimino = useCallback((tetrimino: ITetrimino) => {
    setRef(prevTetrimino, tetrimino);
  }, []);

  const resetPrevTetrimino = useCallback(() => {
    setRef(prevTetrimino, createInitialTetriminoState());
  }, []);

  return {
    tetrimino,
    tetriminoCoordinates,
    prevTetrimino,
    setTetrimino,
    resetTetrimino,
    setPrevTetrimino,
    resetPrevTetrimino,
  };
};

export default useTetrimino;

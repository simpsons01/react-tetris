import { useState, useMemo, useCallback } from "react";
import {
  ICoordinate,
  TETRIMINO_SHAPE,
  TETRIMINO_TYPE,
  DEFAULT_TETRIMINO_SHAPE,
  getCoordinateByAnchorAndShapeAndType,
} from "../common/tetrimino";

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

  const tetriminoCoordinates = useMemo<Array<ICoordinate> | null>(() => {
    if (tetrimino.type == null) return null;
    return getCoordinateByAnchorAndShapeAndType(tetrimino.anchor, tetrimino.type, tetrimino.shape);
  }, [tetrimino]);

  const resetTetrimino = useCallback((): void => {
    setTetrimino(createInitialTetriminoState());
  }, [setTetrimino]);

  return {
    tetrimino,
    tetriminoCoordinates,
    setTetrimino,
    resetTetrimino,
  };
};

export default useTetrimino;

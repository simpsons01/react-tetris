import React from "react";
import {
  ICoordinate,
  POLYOMINO_SHAPE,
  POLYOMINO_TYPE,
  DEFAULT_POLYOMINO_SHAPE,
  getCoordinateByAnchorAndShapeAndType,
} from "../common/polyomino";

const createInitialPolyominoState = () => ({
  anchor: { x: -1, y: -1 },
  shape: DEFAULT_POLYOMINO_SHAPE,
  type: null,
});

export interface IPolyomino {
  anchor: ICoordinate;
  shape: POLYOMINO_SHAPE;
  type: POLYOMINO_TYPE | null;
}

const usePolyomino = function () {
  const [polyomino, setPolyomino] = React.useState<IPolyomino>(createInitialPolyominoState());

  const polyominoCoordinate = React.useMemo<Array<ICoordinate> | null>(() => {
    if (polyomino.type == null) return null;
    return getCoordinateByAnchorAndShapeAndType(polyomino.anchor, polyomino.type, polyomino.shape);
  }, [polyomino]);

  const resetPolyomino = React.useCallback((): void => {
    setPolyomino(createInitialPolyominoState());
  }, [setPolyomino]);

  return {
    polyomino,
    polyominoCoordinate,
    setPolyomino,
    resetPolyomino,
  };
};

export default usePolyomino;

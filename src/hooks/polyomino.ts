import React from "react";
import {
  getPolyominoConfig,
  ICoordinate,
  POLYOMINO_SHAPE,
  POLYOMINO_TYPE,
  DEFAULT_POLYOMINO_SHAPE,
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
  const [polyomino, setPolyomino] = React.useState<IPolyomino>(
    createInitialPolyominoState()
  );

  const polyominoCoordinate = React.useMemo<Array<ICoordinate> | null>(() => {
    if (polyomino.type == null) return null;
    const polyominoConfig = getPolyominoConfig(polyomino.type);
    return polyominoConfig.coordinate[polyomino.shape].coordinate.map(
      ({ x, y }) => {
        return {
          x: x + polyomino.anchor.x,
          y: y + polyomino.anchor.y,
        };
      }
    ) as Array<ICoordinate>;
  }, [polyomino]);

  // const polyominoInfo = React.useMemo<Array<ICube> | null>(() => {
  //   if (polyomino.type == null || polyominoCoordinate == null) return null;
  //   const { strokeColor, fillColor } = getPolyominoConfig(polyomino.type);
  //   return polyominoCoordinate.map(({ x, y }) => ({
  //     x,
  //     y,
  //     strokeColor,
  //     fillColor,
  //   })) as Array<ICube>;
  // }, [polyomino, polyominoCoordinate]);

  const resetPolyomino = React.useCallback((): void => {
    setPolyomino(createInitialPolyominoState());
  }, [setPolyomino]);

  return {
    polyomino,
    polyominoCoordinate,
    //polyominoInfo,
    setPolyomino,
    resetPolyomino,
  };
};

export default usePolyomino;

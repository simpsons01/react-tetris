import React from "react";
import {
  getPolyominoConfig,
  ICoordinate,
  ICube,
  POLYOMINO_SHAPE,
  POLYOMINO_TYPE,
  DEFAULT_POLYOMINO_SHAPE,
  DEFAULT_POLYOMINO_TYPE,
} from "../common/polyomino";

export interface IPolyominoState {
  anchor: ICoordinate;
  shape: POLYOMINO_SHAPE;
  type: POLYOMINO_TYPE | null;
}

const usePolyomino = function () {
  const [polyomino, setPolyomino] = React.useState<IPolyominoState>({
    anchor: { x: -1, y: -1 },
    shape: DEFAULT_POLYOMINO_SHAPE,
    type: DEFAULT_POLYOMINO_TYPE,
  });

  const polyominoCoordinate = React.useMemo<Array<ICoordinate> | null>(() => {
    if (polyomino.type == null) return null;
    const polyominoConfig = getPolyominoConfig(polyomino.type);
    return polyominoConfig.coordinate[polyomino.shape].coordinate.map(({ x, y }) => {
      return {
        x: x + polyomino.anchor.x,
        y: y + polyomino.anchor.y,
      };
    }) as Array<ICoordinate>;
  }, [polyomino]);

  const polyominoInfo = React.useMemo<Array<ICube> | null>(() => {
    if (polyomino.type == null || polyominoCoordinate == null) return null;
    const { strokeColor, fillColor } = getPolyominoConfig(polyomino.type);
    return polyominoCoordinate.map(({ x, y }) => ({
      x,
      y,
      strokeColor,
      fillColor,
    })) as Array<ICube>;
  }, [polyomino, polyominoCoordinate]);

  return {
    polyomino,
    setPolyomino,
    polyominoCoordinate,
    polyominoInfo,
  };
};

export default usePolyomino;

import React from "react";
import { ITetris } from "../components/Tetris";
import {
  CUBE_STATE,
  DEFAULT_POLYOMINO_SHAPE,
  getPolyominoConfig,
  getRamdomPolyominoType,
  getRangeByCoordinate,
} from "../common/polyomino";
import usePolyomino from "./polyomino";

const useTetris = function (col: number, row: number) {
  const { polyomino, setPolyomino, polyominoInfo, polyominoCoordinate } = usePolyomino();
  const [tetrisData, setTetrisData] = React.useState<ITetris["data"]>(
    new Array(col).fill(null).map((_, columnIndex) => {
      return new Array(row).fill(null).map((_, rowIndex) => {
        return {
          x: rowIndex,
          y: columnIndex,
          strokeColor: "",
          fillColor: "",
          state: CUBE_STATE.UNFILLED,
        };
      });
    })
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
        x: Math.ceil((row - (range.maxX - range.minX + 1)) / 2) - range.minX,
        y: coordinate[anchorIndex].y - range.minY,
      },
    });
  }, [row, setPolyomino]);

  return {
    polyominoData: polyominoInfo,
    tetrisData,
    createPolyomino,
  };
};

export default useTetris;

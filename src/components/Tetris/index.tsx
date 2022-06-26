import React, { ReactElement } from "react";
import { ICube, CUBE_STATE } from "../../common/polyomino";

export interface ITetris {
  width: number;
  height: number;
  cubeDistance: number;
  tetris: Array<ICube & { id: string }>;
  polyomino: Array<ICube> | null;
  previewPolyomino: Array<ICube> | null;
}

const makeCube = ({
  left,
  top,
  cubeDistance,
  isPreview,
  isFilled,
}: {
  left: number;
  top: number;
  cubeDistance: number;
  isPreview: boolean;
  isFilled: boolean;
}): ReactElement => {
  let className = "absolute border-2";
  if (isFilled) {
    className += " border-gray-50 bg-gray-900";
    if (isPreview) {
      className += " opacity-30";
    } else {
      className += " z-10";
    }
  } else {
    className += " border-gray-300 bg-gray-300";
  }
  return (
    <div
      className={className}
      style={{
        left: `${left * cubeDistance}px`,
        top: `${top * cubeDistance}px`,
        width: `${cubeDistance}px`,
        height: `${cubeDistance}px`,
      }}
    />
  );
};

const Tetris: React.FC<ITetris> = function (props) {
  const { tetris, polyomino, previewPolyomino, width, height, cubeDistance } = props;

  return (
    <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      {tetris.map((cube) => {
        const { x, y, state, id } = cube;
        const isPolyominoCube = polyomino === null ? false : polyomino.some((cube) => cube.x === x && cube.y === y);
        const isPreviewPolyominoCube =
          previewPolyomino === null ? false : previewPolyomino.some((cube) => cube.x === x && cube.y === y);
        const isFilled = isPolyominoCube || isPreviewPolyominoCube || state === CUBE_STATE.FILLED;
        const cubeEl = makeCube({ left: x, top: y, isFilled, isPreview: isPreviewPolyominoCube, cubeDistance });
        return React.cloneElement(cubeEl, { key: id });
      })}
    </div>
  );
};

export default Tetris;

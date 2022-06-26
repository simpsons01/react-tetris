import React, { ReactElement } from "react";
import { ICube, CUBE_STATE } from "../../common/polyomino";

export interface ITetris {
  width: number;
  height: number;
  cubeDistance: number;
  tetris: Array<ICube>;
  polyomino: Array<ICube> | null;
  previewPolyomino: Array<ICube> | null;
}

const makeCube = (left: number, top: number, cubeDistance: number, isPreview: boolean = false): ReactElement => {
  let className = "absolute border-2 border-gray-50 bg-gray-900";
  if (isPreview) {
    className += " opacity-30";
  } else {
    className += " z-10";
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
      {previewPolyomino !== null && previewPolyomino.map((cube) => makeCube(cube.x, cube.y, cubeDistance, true))}
      {polyomino !== null && polyomino.map((cube) => makeCube(cube.x, cube.y, cubeDistance))}
      {tetris
        .map((cube) => (cube.state === CUBE_STATE.FILLED ? makeCube(cube.x, cube.y, cubeDistance) : null))
        .filter((cube) => cube !== null)}
    </div>
  );
};

export default Tetris;

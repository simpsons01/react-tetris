import React from "react";
import { ICube, CUBE_STATE } from "../../common/polyomino";

export interface ITetris {
  row: number;
  col: number;
  blockDistance: number;
  backgroundColor: string;
  data: Array<ICube>;
  polyomino: Array<ICube> | null;
}

const Tetris: React.FC<ITetris> = function (props) {
  const { backgroundColor, blockDistance, row, col, data, polyomino } = props;
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const height = React.useMemo<number>(() => blockDistance * row, [blockDistance, row]);

  const width = React.useMemo<number>(() => blockDistance * col, [blockDistance, col]);

  React.useEffect(() => {
    if (canvasRef.current == null) return;
    const context = canvasRef.current.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, width, height);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    data.forEach(({ x, y, strokeColor, fillColor, state }) => {
      const [polyominoCube] = (polyomino || []).filter((cube) => cube.x === x && cube.y === y) || [];
      const _strokeColor = polyominoCube
        ? polyominoCube.strokeColor
        : state === CUBE_STATE.FILLED
        ? strokeColor
        : backgroundColor;
      const _fillColor = polyominoCube
        ? polyominoCube.fillColor
        : state === CUBE_STATE.FILLED
        ? fillColor
        : backgroundColor;
      const globalAlpha = polyominoCube ? 0.3 : 1;
      context.strokeStyle = _strokeColor;
      context.fillStyle = _fillColor;
      context.save();
      context.globalAlpha = globalAlpha;
      context.fillRect(x * blockDistance, y * blockDistance, blockDistance - 2, blockDistance - 2);
      context.strokeRect(x * blockDistance, y * blockDistance, blockDistance, blockDistance);
      context.restore();
    });
  }, [width, height, data, polyomino, backgroundColor, blockDistance]);

  return <canvas width={width} height={height} ref={canvasRef} />;
};

export default Tetris;

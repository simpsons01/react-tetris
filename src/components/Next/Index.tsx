import React from "react";
import {
  getCoordinateByAnchorAndShapeAndType,
  ICoordinate,
  IPolyominoConfig,
  POLYOMINO_SHAPE,
  POLYOMINO_TYPE,
} from "../../common/polyomino";
import { getRangeByCoordinate } from "../../common/polyomino/index";
import { nanoid } from "nanoid";
import style from "./index.module.scss";

export interface INext {
  polyominoConfig: IPolyominoConfig | null;
  polyominoType: POLYOMINO_TYPE;
  cubeDistance: number;
  cubeCount: number;
  width: number;
  height: number;
}

const Next: React.FC<INext> = function (props) {
  const { polyominoConfig, cubeCount, polyominoType, cubeDistance, width, height } = props;
  const { current: xxxxxxx } = React.useRef(new Array(cubeCount).fill(null).map(() => nanoid()));
  const polyominoAnchor = React.useMemo<ICoordinate | null>(() => {
    if (polyominoConfig !== null) {
      let anchor = { x: 0, y: 0 };
      const { coordinate: defaultCoordinate, anchorIndex } = polyominoConfig.coordinate[POLYOMINO_SHAPE.FIRST];
      const defaultAnchor = defaultCoordinate[anchorIndex];
      const { minX, maxX, maxY, minY } = getRangeByCoordinate(defaultCoordinate);
      anchor.x = (cubeCount - (maxX - minX + 1)) / 2 + (defaultAnchor.x - minX);
      anchor.y = (cubeCount - (maxY - minY + 1)) / 2 + (defaultAnchor.y - minY);
      return anchor;
    }
    return null;
  }, [polyominoConfig, cubeCount]);

  const polyominoCoordinate = React.useMemo<Array<ICoordinate> | null>(() => {
    if (polyominoAnchor !== null) {
      return getCoordinateByAnchorAndShapeAndType(polyominoType, POLYOMINO_SHAPE.FIRST, polyominoAnchor);
    }
    return null;
  }, [polyominoAnchor, polyominoType]);

  return (
    <div
      className="next-cube"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div
        style={{
          left: `${(width - cubeCount * cubeDistance) / 2}px`,
          top: `${(height - cubeCount * cubeDistance) / 2}px`,
          position: "relative",
          width: `${cubeCount * cubeDistance}px`,
          height: `${cubeCount * cubeDistance}px`,
        }}
        className="next-cube__container"
      >
        {xxxxxxx.map((id, index) => (
          <div
            key={id}
            style={{
              position: "absolute",
              left: `${polyominoCoordinate !== null ? polyominoCoordinate[index].x * cubeDistance : 0}px`,
              top: `${polyominoCoordinate !== null ? polyominoCoordinate[index].y * cubeDistance : 0}px`,
              width: `${cubeDistance}px`,
              height: `${cubeDistance}px`,
            }}
            className={`${style.cube} ${polyominoCoordinate !== null ? style.filled : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Next;

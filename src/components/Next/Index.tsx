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
import styled from "styled-components";

const NextPanel = styled.div<{ width: number; height: number }>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

const NextPanelContainer = styled.div<{ width: number; height: number; left: number; top: number }>`
  position: relative;
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

interface INextCubeBlock {
  isFilled: boolean;
  width: number;
  height: number;
  left: number;
  top: number;
}
const NextCube = styled.div.attrs<INextCubeBlock>((props) => ({
  className: `${props.className !== undefined ? props.className : ""} ${props.isFilled ? "filled" : ""}`,
  style: {
    left: `${props.left}px`,
    top: `${props.top}px`,
    width: `${props.width}px`,
    height: `${props.height}px`,
  },
}))<INextCubeBlock>`
  border-width: 3px;
  border-style: solid;
  border-color: transparent;
  &&& {
    padding: 0;
    position: absolute;
  }
  &.filled {
    background-color: #212529;
    border-width: 35%;
    border-top-color: #fcfcfc;
    border-left-color: #fcfcfc;
    border-right-color: #7c7c7c;
    border-bottom-color: #7c7c7c;

    &::before {
      content: "";
      display: block;
      height: 10%;
      width: 20%;
      background-color: #fff;
      position: absolute;
      left: 20%;
      top: 10%;
    }

    &::after {
      content: "";
      display: block;
      height: 15%;
      width: 10%;
      background-color: #fff;
      position: absolute;
      left: 20%;
      top: 20%;
    }
  }
`;

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
  // todo: 修正命名
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
    <NextPanel width={width} height={height}>
      <NextPanelContainer
        width={cubeCount * cubeDistance}
        height={cubeCount * cubeDistance}
        left={(width - cubeCount * cubeDistance) / 2}
        top={(height - cubeCount * cubeDistance) / 2}
      >
        {xxxxxxx.map((id, index) => (
          <NextCube
            key={id}
            isFilled={polyominoCoordinate !== null}
            left={polyominoCoordinate !== null ? polyominoCoordinate[index].x * cubeDistance : 0}
            top={polyominoCoordinate !== null ? polyominoCoordinate[index].y * cubeDistance : 0}
            width={cubeDistance}
            height={cubeDistance}
          />
        ))}
      </NextPanelContainer>
    </NextPanel>
  );
};

export default Next;

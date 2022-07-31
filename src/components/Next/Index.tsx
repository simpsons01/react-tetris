import React from "react";
import {
  getCoordinateByAnchorAndShapeAndType,
  getPolyominoConfig,
  ICoordinate,
  PER_POLYOMINO_CUBE_NUM,
  POLYOMINO_SHAPE,
  POLYOMINO_TYPE,
} from "../../common/polyomino";
import { getRangeByCoordinate } from "../../common/polyomino/index";
import { nanoid } from "nanoid";
import styled from "styled-components";
import { ISize, IPosition } from "../../common/utils";

const NextPanel = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface INextPanelContainer extends ISize {}
const NextPanelContainer = styled.div<INextPanelContainer>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

interface INextCubeBlock extends ISize, IPosition {
  isFilled: boolean;
}
const NextCube = styled.div.attrs<INextCubeBlock>((props) => ({
  className: `${props.className !== undefined ? props.className : ""} ${
    props.isFilled ? "filled" : ""
  }`,
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
  polyominoType: POLYOMINO_TYPE | null;
  cubeDistance: number;
}

const Next = (props: INext): JSX.Element => {
  const { polyominoType, cubeDistance } = props;
  // todo: 修正命名
  const { current: xxxxxxx } = React.useRef(
    new Array(PER_POLYOMINO_CUBE_NUM).fill(null).map(() => nanoid())
  );
  const polyominoAnchor = React.useMemo<ICoordinate | null>(() => {
    if (polyominoType !== null) {
      const polyominoConfig = getPolyominoConfig(polyominoType);
      let anchor = { x: 0, y: 0 };
      const { coordinate: defaultCoordinate, anchorIndex } =
        polyominoConfig.coordinate[POLYOMINO_SHAPE.FIRST];
      const defaultAnchor = defaultCoordinate[anchorIndex];
      const { minX, maxX, maxY, minY } =
        getRangeByCoordinate(defaultCoordinate);
      anchor.x =
        (PER_POLYOMINO_CUBE_NUM - (maxX - minX + 1)) / 2 +
        (defaultAnchor.x - minX);
      anchor.y =
        (PER_POLYOMINO_CUBE_NUM - (maxY - minY + 1)) / 2 +
        (defaultAnchor.y - minY);
      return anchor;
    }
    return null;
  }, [polyominoType]);

  const polyominoCoordinate = React.useMemo<Array<ICoordinate> | null>(() => {
    if (polyominoType !== null && polyominoAnchor !== null) {
      return getCoordinateByAnchorAndShapeAndType(
        polyominoType,
        POLYOMINO_SHAPE.FIRST,
        polyominoAnchor
      );
    }
    return null;
  }, [polyominoAnchor, polyominoType]);

  return (
    <NextPanel>
      <NextPanelContainer
        width={PER_POLYOMINO_CUBE_NUM * cubeDistance}
        height={PER_POLYOMINO_CUBE_NUM * cubeDistance}
      >
        {xxxxxxx.map((id, index) => (
          <NextCube
            key={id}
            isFilled={polyominoCoordinate !== null}
            left={
              polyominoCoordinate !== null
                ? polyominoCoordinate[index].x * cubeDistance
                : 0
            }
            top={
              polyominoCoordinate !== null
                ? polyominoCoordinate[index].y * cubeDistance
                : 0
            }
            width={cubeDistance}
            height={cubeDistance}
          />
        ))}
      </NextPanelContainer>
    </NextPanel>
  );
};

export default Next;

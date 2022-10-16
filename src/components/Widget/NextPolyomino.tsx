import React from "react";
import {
  getCoordinateByAnchorAndShapeAndType,
  getPolyominoConfig,
  ICoordinate,
  NEXT_POLYOMINO_BAGS_NUM,
  PER_POLYOMINO_CUBE_NUM,
  POLYOMINO_SHAPE,
  POLYOMINO_TYPE,
} from "../../common/polyomino";
import { getRangeByCoordinate } from "../../common/polyomino/index";
import { nanoid } from "nanoid";
import styled from "styled-components";
import { ISize, IPosition } from "../../common/utils";
import Font from "../Font";

const Wrapper = styled.div``;

const Panel = styled.div<ISize>`
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  background-color: #eeeeee;

  &&& {
    padding: 4px;
    margin: 0;
  }
`;

const NextCubeContainer = styled.div<ISize & { isFirstCube: boolean }>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  margin-top: ${(props) => `${props.isFirstCube ? "0px" : "20px"}`};
`;

interface INextCubeBlock extends ISize, IPosition {}
const NextCube = styled.div<INextCubeBlock>`
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  border-width: 3px;
  border-style: solid;
  border-color: transparent;
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
  &&& {
    padding: 0;
    position: absolute;
  }
`;

const POLYOMINO_CUBE_X_NUM = 4;
const POLYOMINO_CUBE_Y_NUM = 2;

export interface INext extends ISize {
  fontLevel: string | Array<string>;
  polyominoBag: Array<POLYOMINO_TYPE> | null;
  cubeDistance: number;
}

const Next: React.FC<INext> = (props) => {
  const { fontLevel, polyominoBag, cubeDistance, width, height } = props;
  // todo: 修正命名
  const { current: xxxxxxx } = React.useRef(
    new Array(NEXT_POLYOMINO_BAGS_NUM).fill(null).map(() => ({
      id: nanoid(),
      data: new Array(PER_POLYOMINO_CUBE_NUM).fill(null).map(() => nanoid()),
    }))
  );

  const nextPolyominoBagPolyominoCoordinate = React.useMemo<Array<Array<ICoordinate>> | null>(() => {
    if (polyominoBag !== null) {
      return polyominoBag.map((polyominoType) => {
        const polyominoAnchor = (() => {
          const polyominoConfig = getPolyominoConfig(polyominoType);
          let anchor = { x: 0, y: 0 };
          const { coordinates: defaultCoordinate, anchorIndex } =
            polyominoConfig.config[POLYOMINO_SHAPE.INITIAL].shape;
          const defaultAnchor = defaultCoordinate[anchorIndex];
          const { minX, maxX, maxY, minY } = getRangeByCoordinate(defaultCoordinate);
          anchor.x = (POLYOMINO_CUBE_X_NUM - (maxX - minX + 1)) / 2 + (defaultAnchor.x - minX);
          anchor.y = (POLYOMINO_CUBE_Y_NUM - (maxY - minY + 1)) / 2 + (defaultAnchor.y - minY);
          return anchor;
        })();
        return getCoordinateByAnchorAndShapeAndType(polyominoAnchor, polyominoType, POLYOMINO_SHAPE.INITIAL);
      });
    }
    return null;
  }, [polyominoBag]);

  return (
    <Wrapper>
      <Font level={fontLevel}>NEXT</Font>
      <Panel className={"nes-container is-rounded"} width={width} height={height}>
        {polyominoBag &&
          xxxxxxx.map((yyyyyy, zzzzzz) => (
            <NextCubeContainer
              key={yyyyyy.id}
              width={POLYOMINO_CUBE_X_NUM * cubeDistance}
              height={POLYOMINO_CUBE_Y_NUM * cubeDistance}
              isFirstCube={zzzzzz === 0}
            >
              {yyyyyy.data.map((id, fffff) => (
                <NextCube
                  key={id}
                  left={
                    nextPolyominoBagPolyominoCoordinate !== null
                      ? nextPolyominoBagPolyominoCoordinate[zzzzzz][fffff].x * cubeDistance
                      : 0
                  }
                  top={
                    nextPolyominoBagPolyominoCoordinate !== null
                      ? nextPolyominoBagPolyominoCoordinate[zzzzzz][fffff].y * cubeDistance
                      : 0
                  }
                  width={cubeDistance}
                  height={cubeDistance}
                />
              ))}
            </NextCubeContainer>
          ))}
      </Panel>
    </Wrapper>
  );
};

export default Next;

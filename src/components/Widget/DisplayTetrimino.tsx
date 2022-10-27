import { useRef, useMemo, FC } from "react";
import {
  getCoordinateByAnchorAndShapeAndType,
  getTetriminoConfig,
  ICoordinate,
  PER_TETRIMINO_CUBE_NUM,
  TETRIMINO_SHAPE,
  TETRIMINO_TYPE,
  getRangeByCoordinates,
} from "../../common/tetrimino";
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

const TetriminoContainer = styled.div<ISize & { isFirstCube: boolean }>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  margin-top: ${(props) => `${props.isFirstCube ? "0px" : "20px"}`};
`;

interface ICubeBlock extends ISize, IPosition {}
const Cube = styled.div<ICubeBlock>`
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

const TETRIMINO_CUBE_X_NUM = 4;
const TETRIMINO_CUBE_Y_NUM = 2;

export interface INext extends ISize {
  title: string;
  fontLevel: string | Array<string>;
  displayTetriminoNum: number;
  tetriminoBag: Array<TETRIMINO_TYPE> | null;
  cubeDistance: number;
}

const Next: FC<INext> = (props) => {
  const { fontLevel, tetriminoBag, cubeDistance, displayTetriminoNum, width, height, title } = props;
  // todo: 修正命名
  const { current: xxxxxxx } = useRef(
    new Array(displayTetriminoNum).fill(null).map(() => ({
      id: nanoid(),
      data: new Array(PER_TETRIMINO_CUBE_NUM).fill(null).map(() => nanoid()),
    }))
  );

  const tetriminoBagCoordinates = useMemo<Array<Array<ICoordinate>> | null>(() => {
    if (tetriminoBag !== null) {
      return tetriminoBag.map((tetriminoType) => {
        const tetriminoAnchor = (() => {
          const tetriminoConfig = getTetriminoConfig(tetriminoType);
          let anchor = { x: 0, y: 0 };
          const { coordinates: defaultCoordinate, anchorIndex } =
            tetriminoConfig.config[TETRIMINO_SHAPE.INITIAL].shape;
          const defaultAnchor = defaultCoordinate[anchorIndex];
          const { minX, maxX, maxY, minY } = getRangeByCoordinates(defaultCoordinate);
          anchor.x = (TETRIMINO_CUBE_X_NUM - (maxX - minX + 1)) / 2 + (defaultAnchor.x - minX);
          anchor.y = (TETRIMINO_CUBE_Y_NUM - (maxY - minY + 1)) / 2 + (defaultAnchor.y - minY);
          return anchor;
        })();
        return getCoordinateByAnchorAndShapeAndType(tetriminoAnchor, tetriminoType, TETRIMINO_SHAPE.INITIAL);
      });
    }
    return null;
  }, [tetriminoBag]);

  return (
    <Wrapper>
      <Font level={fontLevel}>{title}</Font>
      <Panel className={"nes-container is-rounded"} width={width} height={height}>
        {tetriminoBag &&
          xxxxxxx.map((yyyyyy, zzzzzz) => (
            <TetriminoContainer
              key={yyyyyy.id}
              width={TETRIMINO_CUBE_X_NUM * cubeDistance}
              height={TETRIMINO_CUBE_Y_NUM * cubeDistance}
              isFirstCube={zzzzzz === 0}
            >
              {yyyyyy.data.map((id, fffff) => (
                <Cube
                  key={id}
                  left={
                    tetriminoBagCoordinates !== null
                      ? tetriminoBagCoordinates[zzzzzz][fffff].x * cubeDistance
                      : 0
                  }
                  top={
                    tetriminoBagCoordinates !== null
                      ? tetriminoBagCoordinates[zzzzzz][fffff].y * cubeDistance
                      : 0
                  }
                  width={cubeDistance}
                  height={cubeDistance}
                />
              ))}
            </TetriminoContainer>
          ))}
      </Panel>
    </Wrapper>
  );
};

export default Next;

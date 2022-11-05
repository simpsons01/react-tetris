import { useRef, useMemo, FC, ReactElement, cloneElement } from "react";
import {
  getCoordinateByAnchorAndShapeAndType,
  getTetriminoConfig,
  PER_TETRIMINO_CUBE_NUM,
  TETRIMINO_SHAPE,
  TETRIMINO_TYPE,
  getRangeByCoordinates,
} from "../../common/tetrimino";
import { nanoid } from "nanoid";
import styled from "styled-components";
import { ISize } from "../../common/utils";
import Font from "../Font";
import Cube from "../Cube";

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

const makeCube = ({
  type,
  left,
  top,
  cubeDistance,
}: {
  type: TETRIMINO_TYPE | null;
  left: number;
  top: number;
  cubeDistance: number;
}): ReactElement => {
  const props = {
    left: left,
    top: top,
    width: cubeDistance,
    height: cubeDistance,
  };
  let CubeEl: typeof Cube.Base;
  if (type === TETRIMINO_TYPE.I) {
    CubeEl = Cube.I;
  } else if (type === TETRIMINO_TYPE.J) {
    CubeEl = Cube.J;
  } else if (type === TETRIMINO_TYPE.L) {
    CubeEl = Cube.L;
  } else if (type === TETRIMINO_TYPE.O) {
    CubeEl = Cube.O;
  } else if (type === TETRIMINO_TYPE.S) {
    CubeEl = Cube.S;
  } else if (type === TETRIMINO_TYPE.Z) {
    CubeEl = Cube.Z;
  } else if (type === TETRIMINO_TYPE.T) {
    CubeEl = Cube.T;
  } else {
    CubeEl = Cube.Base;
  }
  return <CubeEl {...props} isFilled={true} isPreview={false} />;
};

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

  const tetriminoBagCoordinates = useMemo(() => {
    if (tetriminoBag !== null) {
      return tetriminoBag.map((tetriminoType) => {
        const tetriminoAnchor = (() => {
          const tetriminoConfig = getTetriminoConfig(tetriminoType);
          const { coordinates: defaultCoordinate, anchorIndex } =
            tetriminoConfig.config[TETRIMINO_SHAPE.INITIAL].shape;
          const defaultAnchor = defaultCoordinate[anchorIndex];
          const { minX, maxX, maxY, minY } = getRangeByCoordinates(defaultCoordinate);
          const anchor = {
            x: (TETRIMINO_CUBE_X_NUM - (maxX - minX + 1)) / 2 + (defaultAnchor.x - minX),
            y: (TETRIMINO_CUBE_Y_NUM - (maxY - minY + 1)) / 2 + (defaultAnchor.y - minY),
          };
          return anchor;
        })();
        const coordinates = getCoordinateByAnchorAndShapeAndType(
          tetriminoAnchor,
          tetriminoType,
          TETRIMINO_SHAPE.INITIAL
        );
        return {
          type: tetriminoType,
          coordinates,
        };
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
              {yyyyyy.data.map((id, fffff) => {
                const type = tetriminoBagCoordinates ? tetriminoBagCoordinates[zzzzzz].type : null;
                const left = tetriminoBagCoordinates
                  ? tetriminoBagCoordinates[zzzzzz].coordinates[fffff].x * cubeDistance
                  : 0;
                const top = tetriminoBagCoordinates
                  ? tetriminoBagCoordinates[zzzzzz].coordinates[fffff].y * cubeDistance
                  : 0;
                const cube = makeCube({ type, left, top, cubeDistance });
                return cloneElement(cube, { key: id });
              })}
            </TetriminoContainer>
          ))}
      </Panel>
    </Wrapper>
  );
};

export default Next;

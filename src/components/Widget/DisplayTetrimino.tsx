import type { FC } from "react";
import type { ICoordinate } from "../../utils/tetrimino";
import { useRef, useMemo } from "react";
import styled from "styled-components";
import Font from "../Font";
import Cube from "../Cube";
import {
  getCoordinateByAnchorAndShapeAndType,
  getTetriminoConfig,
  PER_TETRIMINO_CUBE_NUM,
  TETRIMINO_SHAPE,
  TETRIMINO_TYPE,
  getRangeByCoordinates,
} from "../../utils/tetrimino";
import { nanoid } from "nanoid";

const Wrapper = styled.div``;

const Panel = styled.div<{ displayTetriminoNum: number }>`
  width: calc(14vh + 16px);
  height: ${(props) =>
    `calc(${props.displayTetriminoNum * 7 + (props.displayTetriminoNum - 1) * 2}vh + 16px)`};
  background-color: #eeeeee;

  &&& {
    padding: 4px;
    margin: 0;
  }
`;

const TetriminoContainer = styled.div<{ isFirstCube: boolean }>`
  position: relative;
  width: 14vh;
  height: 7vh;
  margin-top: ${(props) => `${props.isFirstCube ? "0" : "2vh"}`};
`;

const TETRIMINO_CUBE_X_NUM = 4;
const TETRIMINO_CUBE_Y_NUM = 2;

export interface INext {
  title: string;
  fontLevel: string | Array<string>;
  displayTetriminoNum: number;
  tetriminoBag: Array<TETRIMINO_TYPE> | null;
}

const Next: FC<INext> = (props) => {
  const { fontLevel, tetriminoBag, displayTetriminoNum, title } = props;
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
      <Panel displayTetriminoNum={displayTetriminoNum} className="nes-container is-rounded">
        {tetriminoBag &&
          xxxxxxx.map((yyyyyy, zzzzzz) => (
            <TetriminoContainer key={yyyyyy.id} isFirstCube={zzzzzz === 0}>
              {yyyyyy.data.map((id, fffff) => (
                <Cube
                  isFilled={true}
                  isPreview={false}
                  key={id}
                  x={tetriminoBagCoordinates !== null ? tetriminoBagCoordinates[zzzzzz][fffff].x : 0}
                  y={tetriminoBagCoordinates !== null ? tetriminoBagCoordinates[zzzzzz][fffff].y : 0}
                />
              ))}
            </TetriminoContainer>
          ))}
      </Panel>
    </Wrapper>
  );
};

export default Next;

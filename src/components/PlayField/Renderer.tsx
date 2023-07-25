import type { ReactElement, FC } from "react";
import type { ICube } from "../../common/tetrimino";
import styled from "styled-components";
import Cube from "../Cube";
import { CUBE_STATE } from "../../common/tetrimino";
import { cloneElement } from "react";

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export interface IPlayFieldRenderer {
  matrix: Array<ICube & { id: string }>;
  tetrimino: Array<ICube> | null;
  previewTetrimino: Array<ICube> | null;
}

const makeCube = ({
  x,
  y,
  isPreview,
  isTetrimino,
  isFilled,
}: {
  x: number;
  y: number;
  isPreview: boolean;
  isTetrimino: boolean;
  isFilled: boolean;
}): ReactElement => {
  return <Cube x={x} y={y} isFilled={isFilled} isPreview={isFilled && isPreview && !isTetrimino} />;
};

const Renderer: FC<IPlayFieldRenderer> = (props) => {
  const { matrix, tetrimino, previewTetrimino } = props;

  return (
    <Wrapper>
      {matrix.map((cube) => {
        const { x, y, state, id } = cube;
        const isTetriminoCube =
          tetrimino === null ? false : tetrimino.some((cube) => cube.x === x && cube.y === y);
        const isPreviewTetriminoCube =
          previewTetrimino === null ? false : previewTetrimino.some((cube) => cube.x === x && cube.y === y);
        const isFilled = isTetriminoCube || isPreviewTetriminoCube || state === CUBE_STATE.FILLED;
        const cubeEl = makeCube({
          x,
          y,
          isFilled,
          isTetrimino: isTetriminoCube,
          isPreview: isPreviewTetriminoCube,
        });
        return cloneElement(cubeEl, { key: id });
      })}
    </Wrapper>
  );
};

export default Renderer;

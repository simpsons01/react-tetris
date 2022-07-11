import React, { ReactElement } from "react";
import { ICube, CUBE_STATE } from "../../common/polyomino";
import styled from "styled-components";
import { ISize, IPosition } from "../../common/utils";

const TetrisPanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

interface ICubeBlock extends ISize, IPosition {
  isFilled: boolean;
  isPreview: boolean;
}
const Cube = styled.div.attrs<ICubeBlock>((props) => ({
  className: `${props.className !== undefined ? props.className : ""} ${props.isFilled ? "filled" : ""} ${
    props.isPreview ? "preview" : ""
  }`,
  style: {
    left: `${props.left}px`,
    top: `${props.top}px`,
    width: `${props.width}px`,
    height: `${props.height}px`,
  },
}))<ICubeBlock>`
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
  &.preview {
    opacity: 0.3;
  }
`;

export interface ITetris {
  cubeDistance: number;
  tetris: Array<ICube & { id: string }>;
  polyomino: Array<ICube> | null;
  previewPolyomino: Array<ICube> | null;
}

const makeCube = ({
  left,
  top,
  cubeDistance,
  isPreview,
  isPolyomino,
  isFilled,
}: {
  left: number;
  top: number;
  cubeDistance: number;
  isPreview: boolean;
  isPolyomino: boolean;
  isFilled: boolean;
}): ReactElement => {
  return (
    <Cube
      left={left * cubeDistance}
      top={top * cubeDistance}
      width={cubeDistance}
      height={cubeDistance}
      isFilled={isFilled}
      isPreview={isFilled && isPreview && !isPolyomino}
    />
  );
};

const Tetris = (props: ITetris): JSX.Element => {
  const { tetris, polyomino, previewPolyomino, cubeDistance } = props;

  return (
    <TetrisPanel>
      {tetris.map((cube) => {
        const { x, y, state, id } = cube;
        const isPolyominoCube = polyomino === null ? false : polyomino.some((cube) => cube.x === x && cube.y === y);
        const isPreviewPolyominoCube =
          previewPolyomino === null ? false : previewPolyomino.some((cube) => cube.x === x && cube.y === y);
        const isFilled = isPolyominoCube || isPreviewPolyominoCube || state === CUBE_STATE.FILLED;
        const cubeEl = makeCube({
          left: x,
          top: y,
          isFilled,
          isPolyomino: isPolyominoCube,
          isPreview: isPreviewPolyominoCube,
          cubeDistance,
        });
        return React.cloneElement(cubeEl, { key: id });
      })}
    </TetrisPanel>
  );
};

export default Tetris;

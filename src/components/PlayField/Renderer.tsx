import { ReactElement, FC, cloneElement, useRef, useState } from "react";
import { ICube, CUBE_STATE, ICoordinate, TETRIMINO_TYPE } from "../../common/tetrimino";
import styled, { StyledComponent } from "styled-components";
import { ISize, IPosition } from "../../common/utils";
import { Transition } from "react-transition-group";
import Font from "../Font";
import Cube from "../Cube";

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const ScoreText = styled.div<IPosition & { opacity: number; transform: string }>`
  position: absolute;
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
  opacity: ${(props) => props.opacity};
  transform: ${(props) => props.transform};
  transition: transform 0.1s, opacity 0.1s;
  z-index: 1;
`;

const ScoreTextTransition = {
  entering: { opacity: 1, transform: "translateY(0%)" },
  entered: { opacity: 1, transform: "translateY(0%)" },
  exiting: { opacity: 0, transform: "translateY(-100%)" },
  exited: { opacity: 0, transform: "translateY(100%)" },
  unmounted: { opacity: 0, transform: "translateY(0%)" },
};

export interface IPlayFieldRenderer {
  cubeDistance: number;
  matrix: Array<ICube & { id: string }>;
  tetrimino: Array<ICube> | null;
  previewTetrimino: Array<ICube> | null;
  scoreText: {
    enter: boolean;
    text: string;
    coordinate: ICoordinate;
  };
}

const makeCube = ({
  type,
  left,
  top,
  cubeDistance,
  isPreview,
  isTetrimino,
  isFilled,
}: {
  type: TETRIMINO_TYPE | null;
  left: number;
  top: number;
  cubeDistance: number;
  isPreview: boolean;
  isTetrimino: boolean;
  isFilled: boolean;
}): ReactElement => {
  const props = {
    left,
    top,
    width: cubeDistance,
    height: cubeDistance,
    isFilled,
    isPreview: isFilled && isPreview && !isTetrimino,
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
  return <CubeEl {...props} />;
};

const Renderer: FC<IPlayFieldRenderer> = (props) => {
  const { matrix, tetrimino, previewTetrimino, cubeDistance, scoreText } = props;

  const scoreTextRef = useRef<HTMLDivElement>(null);

  return (
    <Wrapper>
      {matrix.map((cube) => {
        const { x, y, state, id, type } = cube;
        const isTetriminoCube =
          tetrimino === null ? false : tetrimino.some((cube) => cube.x === x && cube.y === y);
        const isPreviewTetriminoCube =
          previewTetrimino === null ? false : previewTetrimino.some((cube) => cube.x === x && cube.y === y);
        const isFilled = isTetriminoCube || isPreviewTetriminoCube || state === CUBE_STATE.FILLED;
        const _type = isTetriminoCube
          ? (tetrimino as Array<ICube>)[0].type
          : isPreviewTetriminoCube
          ? (previewTetrimino as Array<ICube>)[0].type
          : type;
        const cubeEl = makeCube({
          type: _type,
          left: x * cubeDistance,
          top: y * cubeDistance,
          isFilled,
          isTetrimino: isTetriminoCube,
          isPreview: isPreviewTetriminoCube,
          cubeDistance,
        });
        return cloneElement(cubeEl, { key: id });
      })}
      <Transition nodeRef={scoreTextRef} in={scoreText.enter} timeout={300}>
        {(state) => {
          return (
            <ScoreText
              ref={scoreTextRef}
              left={cubeDistance * scoreText.coordinate.x}
              top={cubeDistance * scoreText.coordinate.y}
              {...ScoreTextTransition[state]}
            >
              <Font level="four">{scoreText.text}</Font>
            </ScoreText>
          );
        }}
      </Transition>
    </Wrapper>
  );
};

export default Renderer;

import { ReactElement, FC, cloneElement, useRef } from "react";
import { ICube, CUBE_STATE, ICoordinate } from "../../common/tetrimino";
import styled from "styled-components";
import { ISize, IPosition } from "../../common/utils";
import { Transition } from "react-transition-group";
import Font from "../Font";

const Wrapper = styled.div`
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
  left,
  top,
  cubeDistance,
  isPreview,
  isTetrimino,
  isFilled,
}: {
  left: number;
  top: number;
  cubeDistance: number;
  isPreview: boolean;
  isTetrimino: boolean;
  isFilled: boolean;
}): ReactElement => {
  return (
    <Cube
      left={left * cubeDistance}
      top={top * cubeDistance}
      width={cubeDistance}
      height={cubeDistance}
      isFilled={isFilled}
      isPreview={isFilled && isPreview && !isTetrimino}
    />
  );
};

const Renderer: FC<IPlayFieldRenderer> = (props) => {
  const { matrix, tetrimino, previewTetrimino, cubeDistance, scoreText } = props;

  const scoreTextRef = useRef<HTMLDivElement>(null);

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
          left: x,
          top: y,
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

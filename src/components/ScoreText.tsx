import type { FC } from "react";
import type { ICoordinate } from "../common/tetrimino";
import styled from "styled-components";
import { Transition } from "react-transition-group";
import { useRef } from "react";
import { CUBE_WIDTH } from "./Cube";
import Font from "./Font";

const TextTransition = {
  entering: { opacity: 1, transform: "translateX(-50%) translateY(0%)" },
  entered: { opacity: 1, transform: "translateX(-50%) translateY(0%)" },
  exiting: { opacity: 0, transform: "translateX(-50%) translateY(-100%)" },
  exited: { opacity: 0, transform: "translateX(-50%) translateY(100%)" },
  unmounted: { opacity: 0, transform: "translateX(-50%) translateY(0%)" },
};

const Text = styled.div<{ opacity: number; transform: string; y: ICoordinate["y"] }>`
  position: absolute;
  left: 50%;
  top: ${(props) => `${props.y * CUBE_WIDTH}vh`};
  opacity: ${(props) => props.opacity};
  transform: ${(props) => props.transform};
  transition: transform 0.1s, opacity 0.1s;
  z-index: 99;
  word-break: break-all;
  white-space: nowrap;
`;

export interface IScoreText {
  enter: boolean;
  text: string;
  coordinate: {
    y: ICoordinate["y"];
  };
}

const ScoreText: FC<IScoreText> = (props: IScoreText) => {
  const scoreTextRef = useRef<HTMLDivElement>(null);

  return (
    <Transition nodeRef={scoreTextRef} in={props.enter} timeout={300}>
      {(state) => {
        return (
          <Text ref={scoreTextRef} y={props.coordinate.y} {...TextTransition[state]}>
            <Font level="five">{props.text}</Font>
          </Text>
        );
      }}
    </Transition>
  );
};

export default ScoreText;

import { ReactNode } from "react";
import styled from "styled-components";
import { ISize, IPosition, IFontSize } from "../../common/utils";

export const GameContainer = styled.div<ISize>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

export interface IBaseGame {
  score: (fontSize: number) => ReactNode;
  tetris: (cubeDistance: number) => ReactNode;
  next: (cubeDistance: number) => ReactNode;
}
export interface IFrame extends ISize {
  borderWidth: number;
}

export const Frame = styled.div.attrs((props) => ({
  className: `nes-container is-rounded ${
    props.className !== undefined ? props.className : ""
  }`,
}))<IFrame>`
  background-color: #eeeeee;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  &&& {
    padding: 0;
    margin: 0;
    border-width: ${(props) => `${props.borderWidth}px`};
  }
`;

export const FrameContainer = styled.div<IPosition>`
  position: absolute;
  box-sizing: content-box;
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
`;

export const FrameTitle = styled.p<IFontSize>`
  font-size: ${(props) => `${props.fontSize}px`};
  margin: 0;
`;

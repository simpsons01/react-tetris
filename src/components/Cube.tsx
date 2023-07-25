import type { ICoordinate } from "../utils/tetrimino";
import styled from "styled-components";

const CUBE_WIDTH = 3.5;

export interface ICubeBlock extends ICoordinate {
  isFilled: boolean;
  isPreview: boolean;
}

const Cube = styled.div.attrs<ICubeBlock>((props) => ({
  className: `${props.className !== undefined ? props.className : ""} ${props.isFilled ? "filled" : ""} ${
    props.isPreview ? "preview" : ""
  }`,
  style: {
    left: `${props.x * CUBE_WIDTH}vh`,
    top: `${props.y * CUBE_WIDTH}vh`,
  },
}))<ICubeBlock>`
  width: ${`${CUBE_WIDTH}vh`};
  height: ${`${CUBE_WIDTH}vh`};
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

export default Cube;

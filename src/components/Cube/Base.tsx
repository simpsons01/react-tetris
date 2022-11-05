import styled from "styled-components";
import { ISize, IPosition } from "../../common/utils";

export interface ICube extends ISize, IPosition {
  isFilled: boolean;
  isPreview: boolean;
}

export const Cube = styled.div.attrs<ICube>((props) => ({
  className: `${props.className !== undefined ? props.className : ""} ${props.isFilled ? "filled" : ""} ${
    props.isPreview ? "preview" : ""
  }`,
  style: {
    left: `${props.left}px`,
    top: `${props.top}px`,
    width: `${props.width}px`,
    height: `${props.height}px`,
  },
}))<ICube>`
  box-sizing: border-box;

  &&& {
    padding: 0;
    position: absolute;
  }
  &.preview {
    opacity: 0.3;
  }
`;

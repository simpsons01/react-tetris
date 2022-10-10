import { ISize } from "../../common/utils";
import styled from "styled-components";

const Wrapper = styled.div.attrs(() => ({
  className: "nes-container is-rounded",
}))<ISize>`
  position: relative;
  width: 100%;
  top: 0;
  bottom: 0;
  background-color: #eeeeee;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};

  &&& {
    padding: 0;
    margin: 0;
  }
`;

export default Wrapper;

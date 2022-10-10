import styled from "styled-components";

const Overlay = styled.div<{ background?: string; color?: string }>`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => `${props.background ? props.background : "rgba(0, 0, 0, 0.6)"}`};
  color: ${(props) => `${props.color ? props.color : "#fff"}`};
`;

export default Overlay;

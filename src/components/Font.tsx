import styled from "styled-components";

const Font = styled.p<{ fontSize: number; color?: string; align?: string }>`
  font-size: ${(props) => `${props.fontSize}px`};
  color: ${(props) => `${props.color ? props.color : "#292929"}`};
  text-align: ${(props) => `${props.align ? props.align : "left"}`};
  margin: 0;
  line-height: 1.5;
`;

export default Font;

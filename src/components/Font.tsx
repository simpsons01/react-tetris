import styled from "styled-components";
import React from "react";

const Inline = styled.span<{ fontSize: number; color: string; align: string }>`
  font-size: ${(props) => `${props.fontSize}px`};
  color: ${(props) => `${props.color ? props.color : "#292929"}`};
  text-align: ${(props) => `${props.align ? props.align : "left"}`};
  margin: 0;
`;

const Block = styled.div<{ fontSize: number; color: string; align: string }>`
  font-size: ${(props) => `${props.fontSize}px`};
  color: ${(props) => `${props.color ? props.color : "#292929"}`};
  text-align: ${(props) => `${props.align ? props.align : "left"}`};
  margin: 0;
  line-height: 1.5;
`;

export interface IFont {
  fontSize: number;
  children: React.ReactNode;
  color?: string;
  align?: string;
  inline?: boolean;
}

const Font: React.FC<IFont> = (props) => {
  const { fontSize, children, color = "#292929", align = "left", inline = false } = props;
  const fontProps = { fontSize, color, align };
  return inline ? <Inline {...fontProps}>{children}</Inline> : <Block {...fontProps}>{children}</Block>;
};

export default Font;

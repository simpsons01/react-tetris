import type { FC } from "react";
import styled, { css } from "styled-components";
import GRID from "../common/grid";
import { getKeys } from "../common/utils";

const createFontStyle = () => {
  let styled = "";
  const fontLevel = {
    one: 2.5,
    two: 2,
    three: 1.75,
    four: 1.5,
    five: 1.25,
    six: 1,
  };
  const size = {
    sm: GRID.SMALL,
    md: GRID.MEDIUM,
    lg: GRID.LARGE,
    xl: GRID.EXTRA_LARGE,
    xxl: GRID.TWO_EXTRA_LARGE,
  };

  getKeys(fontLevel).forEach((fontLevelKey) => {
    styled += `
      &.${fontLevelKey} {
        font-size: ${fontLevel[fontLevelKey]}rem;
      }
    `;
    getKeys(size).forEach((sizeKey) => {
      styled += `
        &&.${sizeKey}-${fontLevelKey} {
          @media screen and (min-width: ${size[sizeKey]}px) {
            font-size: ${fontLevel[fontLevelKey]}rem;
          }
        }
      `;
    });
  });
  return css`
    ${styled}
  `;
};

const Inline = styled.span<{ color: string; align: string; fontSize?: number }>`
  color: ${(props) => `${props.color ?? "#292929"}`};
  text-align: ${(props) => `${props.align ?? "left"}`};
  font-size: ${(props) => `${props.fontSize ? `${props.fontSize}px` : "inherit"}`};
  ${createFontStyle()}
`;

const Block = styled.div<{ color: string; align: string; fontSize?: number }>`
  color: ${(props) => `${props.color ?? "#292929"}`};
  text-align: ${(props) => `${props.align ?? "left"}`};
  margin: 0;
  line-height: 1.5;
  font-size: ${(props) => `${props.fontSize ? `${props.fontSize}px` : "inherit"}`};
  ${createFontStyle()};
`;

export interface IFont {
  children: React.ReactNode;
  fontSize?: number;
  color?: string;
  level?: string | Array<string>;
  align?: string;
  inline?: boolean;
}

const Font: FC<IFont> = (props) => {
  const { level, children, color = "#292929", align = "left", inline = false, fontSize } = props;
  const className = level === undefined ? "" : Array.isArray(level) ? level.join(" ") : level;
  const fontProps = { color, align, className, fontSize };
  return inline ? <Inline {...fontProps}>{children}</Inline> : <Block {...fontProps}>{children}</Block>;
};

export default Font;

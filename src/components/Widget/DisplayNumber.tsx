import React from "react";
import styled from "styled-components";
import Font from "../Font";
import { ISize, IFontSize } from "../../common/utils";

const Wrapper = styled.div``;

const Panel = styled.div<ISize>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  background-color: #eeeeee;

  &&& {
    padding: 0;
    margin: 0;
  }
`;

export interface INumberWidget extends ISize, IFontSize {
  title: string;
  displayValue: number;
}

const NumberWidget: React.FC<INumberWidget> = (props) => {
  const { fontSize, displayValue, title, width, height } = props;
  const calcDisplayValueFontSize = React.useMemo<number>(() => {
    let ratio = 0;
    if (displayValue < 9) {
      ratio = 2.5;
    } else if (displayValue < 99) {
      ratio = 2;
    } else if (displayValue < 999) {
      ratio = 1.5;
    } else if (displayValue < 9999) {
      ratio = 1.2;
    } else {
      ratio = 1;
    }
    return Math.floor(fontSize * ratio);
  }, [displayValue, fontSize]);

  return (
    <Wrapper>
      <Font fontSize={fontSize}>{title}</Font>
      <Panel className={"nes-container is-rounded"} width={width} height={height}>
        <Font fontSize={calcDisplayValueFontSize}>{displayValue}</Font>
      </Panel>
    </Wrapper>
  );
};

export default NumberWidget;

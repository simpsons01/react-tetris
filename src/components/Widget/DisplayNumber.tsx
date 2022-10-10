import React from "react";
import styled from "styled-components";
import Font from "../Font";
import { useSizeConfigContext } from "../../context/sizeConfig";
import { ISize } from "../../common/utils";

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

export interface INumberWidget extends ISize {
  title: string;
  displayValue: number;
}

const NumberWidget: React.FC<INumberWidget> = (props) => {
  const { displayValue, title, width, height } = props;
  const sizeConfigContext = useSizeConfigContext();
  const calcDisplayValueFontSize = React.useMemo<number>(() => {
    let fontSize = 0;
    if (displayValue < 9) {
      fontSize = sizeConfigContext.font.level.two;
    } else if (displayValue < 99) {
      fontSize = sizeConfigContext.font.level.three;
    } else if (displayValue < 999) {
      fontSize = sizeConfigContext.font.level.four;
    } else if (displayValue < 9999) {
      fontSize = sizeConfigContext.font.level.five;
    } else {
      fontSize = sizeConfigContext.font.level.six;
    }
    return fontSize * 2;
  }, [displayValue, sizeConfigContext]);

  return (
    <Wrapper>
      <Font fontSize={sizeConfigContext.font.level.three}>{title}</Font>
      <Panel className={"nes-container is-rounded"} width={width} height={height}>
        <Font fontSize={calcDisplayValueFontSize}>{displayValue}</Font>
      </Panel>
    </Wrapper>
  );
};

export default NumberWidget;

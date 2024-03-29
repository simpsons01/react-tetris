import type { FC } from "react";
import styled from "styled-components";
import Font from "../Font";
import { useMemo } from "react";

const Wrapper = styled.div``;

const Panel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(14vh + 16px);
  height: calc(7vh + 16px);
  background-color: #eeeeee;

  &&& {
    padding: 4px;
    margin: 0;
  }
`;

const DisplayNumber = styled.div<{ ratio: number }>`
  transform: ${(props) => `scale(${props.ratio})`};
`;

export interface INumberWidget {
  fontLevel: string | Array<string>;
  title: string;
  displayValue: number;
}

const NumberWidget: FC<INumberWidget> = (props) => {
  const { fontLevel, displayValue, title } = props;
  const calcDisplayValueRatio = useMemo<number>(() => {
    let ratio = 0;
    if (displayValue < 999) {
      ratio = 1.4;
    } else if (displayValue < 9999) {
      ratio = 1.2;
    } else if (displayValue < 99999) {
      ratio = 1;
    } else if (displayValue < 999999) {
      ratio = 0.8;
    } else if (displayValue < 9999999) {
      ratio = 0.6;
    } else {
      ratio = 0.4;
    }
    return ratio;
  }, [displayValue]);

  const displayNumText = useMemo(() => {
    let text = "";
    if (displayValue < 9) {
      text = `00${displayValue}`;
    } else if (displayValue < 99) {
      text = `0${displayValue}`;
    } else {
      text = `${displayValue}`;
    }
    return text;
  }, [displayValue]);

  return (
    <Wrapper>
      <Font level={fontLevel}>{title}</Font>
      <Panel className={"nes-container is-rounded"}>
        <DisplayNumber ratio={calcDisplayValueRatio}>
          <Font level={fontLevel}>{displayNumText}</Font>
        </DisplayNumber>
      </Panel>
    </Wrapper>
  );
};

export default NumberWidget;

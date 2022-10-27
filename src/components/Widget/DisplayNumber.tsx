import { useMemo, FC } from "react";
import styled from "styled-components";
import Font from "../Font";
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
    padding: 4px;
    margin: 0;
  }
`;

const DisplayNumber = styled.div<{ ratio: number }>`
  transform: ${(props) => `scale(${props.ratio})`};
`;

export interface INumberWidget extends ISize {
  fontLevel: string | Array<string>;
  title: string;
  displayValue: number;
}

const NumberWidget: FC<INumberWidget> = (props) => {
  const { fontLevel, displayValue, title, width, height } = props;
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
      <Panel className={"nes-container is-rounded"} width={width} height={height}>
        <DisplayNumber ratio={calcDisplayValueRatio}>
          <Font level={fontLevel}>{displayNumText}</Font>
        </DisplayNumber>
      </Panel>
    </Wrapper>
  );
};

export default NumberWidget;

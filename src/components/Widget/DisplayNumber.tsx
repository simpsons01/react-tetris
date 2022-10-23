import { useMemo } from "react";
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
    padding: 0;
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

const NumberWidget: React.FC<INumberWidget> = (props) => {
  const { fontLevel, displayValue, title, width, height } = props;
  const calcDisplayValueRatio = useMemo<number>(() => {
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
    return ratio;
  }, [displayValue]);

  return (
    <Wrapper>
      <Font level={fontLevel}>{title}</Font>
      <Panel className={"nes-container is-rounded"} width={width} height={height}>
        <DisplayNumber ratio={calcDisplayValueRatio}>
          <Font level={fontLevel}>{displayValue}</Font>
        </DisplayNumber>
      </Panel>
    </Wrapper>
  );
};

export default NumberWidget;

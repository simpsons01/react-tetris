import React from "react";
import styled from "styled-components";

const CountDownPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const CountDownText = styled.p<{ fontSize: number }>`
  margin: 0;
  font-size: ${(props) => `${props.fontSize}px`};
`;

export interface ICountDown {
  sec: number;
  fontSize: number;
}

const CountDown: React.FC<ICountDown> = function (props) {
  const { sec, fontSize } = props;

  return (
    <CountDownPanel>
      <CountDownText fontSize={fontSize}>{sec}</CountDownText>
    </CountDownPanel>
  );
};

export default CountDown;

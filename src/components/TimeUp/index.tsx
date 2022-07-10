import React from "react";
import styled from "styled-components";

const TimeUpPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  left: -4px;
  top: -4px;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.6);
`;

const TimeUpText = styled.p<{ fontSize: number }>`
  margin: 0;
  font-size: ${(props) => `${props.fontSize}px`};
  color: white;
`;

const TimeUpBtn = styled.button`
  margin-top: 16px;
`;

export interface ITimesUp {
  isTimeUp: boolean;
  fontSize: number;
}

const TimeUp: React.FC<ITimesUp> = function (props) {
  const { fontSize, isTimeUp } = props;
  if (!isTimeUp) return null;
  return (
    <TimeUpPanel>
      <TimeUpText fontSize={fontSize}>TIME UP</TimeUpText>
      <TimeUpBtn onClick={() => window.location.reload()} className="nes-btn">
        TRY AGAIN
      </TimeUpBtn>
    </TimeUpPanel>
  );
};

export default TimeUp;

import React from "react";
import styled from "styled-components";

const PausePanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  left: -4px;
  top: -4px;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.6);
`;

const PauseText = styled.p<{ fontSize: number }>`
  margin: 0;
  font-size: ${(props) => `${props.fontSize}px`};
  color: white;
`;

export interface IPause {
  isPausing: boolean;
  fontSize: number;
}

const Pause = (props: IPause): JSX.Element | null => {
  const { fontSize, isPausing } = props;
  if (!isPausing) return null;
  return (
    <PausePanel>
      <PauseText fontSize={fontSize}>PAUSE</PauseText>
    </PausePanel>
  );
};

export default Pause;

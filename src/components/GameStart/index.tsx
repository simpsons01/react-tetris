import React from "react";
import styled from "styled-components";

const GameStartPanel = styled.div`
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

const GameStartBtn = styled.button<{ fontSize: number }>`
  font-size: ${(props) => `${props.fontSize}px`};
  margin-top: 16px;
`;

export interface IGameStart {
  isGameStart: boolean;
  fontSize: number;
  onGameStart: () => void;
}

const GameStart: React.FC<IGameStart> = function (props) {
  const { fontSize, isGameStart } = props;
  if (!isGameStart) return null;
  return (
    <GameStartPanel>
      <GameStartBtn fontSize={fontSize} onClick={() => props.onGameStart()} className="nes-btn">
        START
      </GameStartBtn>
    </GameStartPanel>
  );
};

export default GameStart;

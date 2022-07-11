import React from "react";
import styled from "styled-components";

const GameOverPanel = styled.div`
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

const GameOverText = styled.p<{ fontSize: number }>`
  margin: 0;
  font-size: ${(props) => `${props.fontSize}px`};
  color: white;
`;

const GameOverBtn = styled.button`
  margin-top: 16px;
`;

export interface IGameOver {
  isGameOver: boolean;
  fontSize: number;
}

const GameOver = (props: IGameOver): JSX.Element | null => {
  const { fontSize, isGameOver } = props;
  if (!isGameOver) return null;
  return (
    <GameOverPanel>
      <GameOverText fontSize={fontSize}>GAME OVER</GameOverText>
      <GameOverBtn onClick={() => window.location.reload()} className="nes-btn">
        TRY AGAIN
      </GameOverBtn>
    </GameOverPanel>
  );
};

export default GameOver;

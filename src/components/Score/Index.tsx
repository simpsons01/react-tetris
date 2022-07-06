import React from "react";
import styled from "styled-components";

const ScorePanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const ScoreText = styled.p`
  margin: 0;
  font-size: 64px;
`;

export interface IScore {
  score: number;
}

const Score: React.FC<IScore> = function (props) {
  const { score } = props;
  return (
    <ScorePanel>
      <ScoreText>{score}</ScoreText>
    </ScorePanel>
  );
};

export default Score;

import React from "react";
import styled from "styled-components";

const ScorePanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const ScoreText = styled.p<{ fontSize: number }>`
  margin: 0;
  font-size: ${(props) => `${props.fontSize}px`};
`;

export interface IScore {
  score: number;
  fontSize: number;
}

const Score = (props: IScore): JSX.Element => {
  const { score, fontSize } = props;

  const calcFontSize = React.useMemo<number>(() => {
    const max = 5;
    // todo: 想個更好的變數名稱
    const wqefwefwefwefwef = 2;
    const scoreTextLength = `${score}`.length * wqefwefwefwefwef;
    const ratio = scoreTextLength > max ? max / scoreTextLength : 1;
    return Math.floor(fontSize * ratio);
  }, [score, fontSize]);

  return (
    <ScorePanel>
      <ScoreText fontSize={calcFontSize}>{score}</ScoreText>
    </ScorePanel>
  );
};

export default Score;

import React, { ReactElement } from "react";
import useGameSize, { PLACEMENT } from "../../hooks/gameSize";
import styled from "styled-components";
import { ISize, IPosition } from "../../common/utils";

const GamePanel = styled.div<ISize>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

interface IFrame extends ISize {
  borderWidth: number;
}
const Frame = styled.div.attrs((props) => ({
  className: `nes-container is-rounded ${props.className !== undefined ? props.className : ""}`,
}))<IFrame>`
  background-color: #eeeeee;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  &&& {
    padding: 0;
    margin: 0;
    border-width: ${(props) => `${props.borderWidth}px`};
  }
`;

const Section = styled.div<IPosition>`
  position: absolute;
  box-sizing: content-box;
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
`;

const SectionTitle = styled.p<{ fontSize: number }>`
  font-size: ${(props) => `${props.fontSize}px`};
  margin: 0;
`;

export interface IGame {
  // single: boolean;
  score: (fontSize: number) => ReactElement;
  tetris: (cubeDistance: number) => ReactElement;
  next: (cubeDistance: number) => ReactElement;
  countdown: (fontSize: number) => ReactElement;
  pause: (fontSize: number) => ReactElement | null;
  gameover: (fontSize: number) => ReactElement | null;
  timeup: (fontSize: number) => ReactElement | null;
  gamestart: (fontSize: number) => ReactElement | null;
}

const Game: React.FC<IGame> = function (props) {
  const {
    tetrisFrameWidth,
    tetrisFrameHeight,
    tetrisBorderWidth,
    cubeDistance,
    frameWidth,
    frameHeight,
    frameBorderWidth,
    frameFontSize,
    frameLineHeight,
    gameWidth,
    gameHeight,
    gapBetweenTetrisAndFrame,
    gapBetweenFrameAndFrame,
  } = useGameSize(
    {
      score: {
        placement: PLACEMENT.LEFT,
      },
      next: {
        placement: PLACEMENT.LEFT,
      },
      countdown: {
        placement: PLACEMENT.RIGHT,
      },
    },
    true
  );

  return (
    <GamePanel width={gameWidth} height={gameHeight}>
      <Section left={0} top={0}>
        <SectionTitle fontSize={frameFontSize}>SCORE</SectionTitle>
        <Frame borderWidth={frameBorderWidth} width={frameWidth} height={frameHeight}>
          {props.score(frameFontSize * 2)}
        </Frame>
      </Section>
      <Section left={0} top={frameHeight + frameLineHeight + gapBetweenFrameAndFrame}>
        <SectionTitle fontSize={frameFontSize}>NEXT</SectionTitle>
        <Frame borderWidth={frameBorderWidth} width={frameWidth} height={frameHeight}>
          {props.next(cubeDistance)}
        </Frame>
      </Section>
      <Section left={frameWidth + gapBetweenTetrisAndFrame} top={0}>
        <Frame borderWidth={tetrisBorderWidth} width={tetrisFrameWidth} height={tetrisFrameHeight}>
          {props.tetris(cubeDistance)}
          {props.pause(frameFontSize)}
          {props.gameover(frameFontSize)}
          {props.timeup(frameFontSize)}
          {props.gamestart(frameFontSize)}
        </Frame>
      </Section>
      <Section left={frameWidth + tetrisFrameWidth + gapBetweenTetrisAndFrame * 2} top={0}>
        <SectionTitle fontSize={frameFontSize}>SEC</SectionTitle>
        <Frame borderWidth={frameBorderWidth} width={frameWidth} height={frameHeight}>
          {props.countdown(frameFontSize * 2)}
        </Frame>
      </Section>
    </GamePanel>
  );
};

export default Game;

import { ReactNode } from "react";
import useGameSize from "../../hooks/gameSize";
import { IBaseGame, Frame, FrameContainer, FrameTitle, GameContainer } from "./Base";
import { ISize } from "../../common/utils";
import styled from "styled-components";

export interface ISingleGame extends IBaseGame {
  countdown: (fontSize: number) => ReactNode;
  pause: (fontSize: number) => ReactNode | null;
  gameover: (fontSize: number) => ReactNode | null;
  timeup: (fontSize: number) => ReactNode | null;
  gamestart: (fontSize: number) => ReactNode | null;
}

const SingleGame = (props: ISingleGame): JSX.Element => {
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
  } = useGameSize(true, true, 2);

  return (
    <GameContainer width={gameWidth} height={gameHeight}>
      <FrameContainer left={0} top={0}>
        <FrameTitle fontSize={frameFontSize}>SCORE</FrameTitle>
        <Frame borderWidth={frameBorderWidth} width={frameWidth} height={frameHeight}>
          {props.score(frameFontSize * 2)}
        </Frame>
      </FrameContainer>
      <FrameContainer left={0} top={frameHeight + frameLineHeight + gapBetweenFrameAndFrame}>
        <FrameTitle fontSize={frameFontSize}>NEXT</FrameTitle>
        <Frame borderWidth={frameBorderWidth} width={frameWidth} height={frameHeight}>
          {props.next(cubeDistance)}
        </Frame>
      </FrameContainer>
      <FrameContainer left={frameWidth + gapBetweenTetrisAndFrame} top={0}>
        <Frame borderWidth={tetrisBorderWidth} width={tetrisFrameWidth} height={tetrisFrameHeight}>
          {props.tetris(cubeDistance)}
          {props.pause(frameFontSize)}
          {props.gameover(frameFontSize)}
          {props.timeup(frameFontSize)}
          {props.gamestart(frameFontSize)}
        </Frame>
      </FrameContainer>
      <FrameContainer left={frameWidth + tetrisFrameWidth + gapBetweenTetrisAndFrame * 2} top={0}>
        <FrameTitle fontSize={frameFontSize}>SEC</FrameTitle>
        <Frame borderWidth={frameBorderWidth} width={frameWidth} height={frameHeight}>
          {props.countdown(frameFontSize * 2)}
        </Frame>
      </FrameContainer>
    </GameContainer>
  );
};

export default SingleGame;

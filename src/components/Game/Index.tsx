import React, { ReactElement } from "react";
import { ScreenSizeContext } from "../../hooks/screenSize";
import styled from "styled-components";

const Frame = styled.div.attrs((props) => ({
  className: `nes-container is-rounded ${props.className !== undefined ? props.className : ""}`,
}))<{ width: number; height: number }>`
  background-color: #eeeeee;
  border-color: #212529;
  border-style: solid;
  box-sizing: content-box;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
  &&& {
    padding: 0;
    margin: 0;
  }
`;

const Section = styled.div<{ left: number; top: number }>`
  position: absolute;
  box-sizing: content-box;
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
`;

const SectionTitle = styled.p<{ lineHeight: number }>`
  line-height: ${(props) => `${props.lineHeight}px`};
  font-size: 32px;
  margin: 0;
`;

const GamePanel = styled.div<{ width: number; height: number }>`
  position: relative;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`;

export interface IGame {
  single: boolean;
  tetris: (width: number, height: number, cubeDistance: number) => ReactElement;
  next: (width: number, height: number, cubeCount: number, cubeDistance: number) => ReactElement;
}

const Game: React.FC<IGame> = function (props) {
  const { single } = props;
  const { width: screenWidth, height: screenHeight } = React.useContext(ScreenSizeContext);

  const size = React.useMemo(() => {
    const frameInnerGap = 5;
    const frameBorderWidth = 4;
    const tetrisBorderWidth = 4;
    const gapBetweenTetrisAndFrame = 40;
    const gapBetweenFrameAndFrame = 16;
    const frameTextHeight = 50;
    const frameCubeCount = 4;
    const totalFrame = 2;
    let tetrisHeight = 0,
      tetrisWidth = 0,
      frameWidth = 0,
      frameHeight = 0,
      cubeDistance = 0,
      gameWidth = 0,
      gameHeight = 0;
    for (let i = Math.floor(screenHeight * 0.8); i > 0; i--) {
      if (i % 4 === 0 && i % 10 === 0) {
        tetrisHeight = i;
        tetrisWidth = tetrisHeight / 2;
        cubeDistance = tetrisWidth / 10;
        frameWidth = frameHeight = cubeDistance * frameCubeCount + frameInnerGap * 2;
        gameWidth =
          tetrisWidth + tetrisBorderWidth * 2 + (frameWidth + frameBorderWidth * 2) + gapBetweenTetrisAndFrame;
        if (
          (frameHeight + frameBorderWidth * 2 + frameTextHeight) * totalFrame + frameInnerGap * (totalFrame - 1) >
          tetrisHeight + tetrisBorderWidth * 2
        ) {
          gameHeight = (frameHeight + frameBorderWidth * 2) * totalFrame + frameInnerGap * (totalFrame - 1);
        } else {
          gameHeight = tetrisHeight + tetrisBorderWidth * 2;
        }
        if (gameWidth >= (single ? screenWidth : screenWidth / 2) || gameHeight >= screenHeight) {
          continue;
        } else {
          break;
        }
      }
    }
    return {
      tetrisWidth,
      tetrisHeight,
      tetrisBorderWidth,
      frameWidth,
      frameHeight,
      frameCubeCount,
      frameBorderWidth,
      frameTextHeight,
      gameWidth,
      gameHeight,
      gapBetweenTetrisAndFrame,
      gapBetweenFrameAndFrame,
      cubeDistance,
    };
  }, [screenHeight, screenWidth, single]);

  return (
    <GamePanel width={size.gameWidth} height={size.gameHeight}>
      <Section left={0} top={0}>
        <SectionTitle lineHeight={size.frameTextHeight}>SCORE</SectionTitle>
        <Frame width={size.frameWidth} height={size.frameHeight}></Frame>
      </Section>
      <Section left={0} top={size.frameHeight + size.frameTextHeight + size.gapBetweenTetrisAndFrame}>
        <SectionTitle lineHeight={size.frameTextHeight}>NEXT</SectionTitle>
        <Frame width={size.frameWidth} height={size.frameHeight}>
          {props.next(size.frameHeight, size.frameHeight, size.frameCubeCount, size.cubeDistance)}
        </Frame>
      </Section>
      <Section left={size.frameWidth + size.frameBorderWidth * 2 + size.gapBetweenTetrisAndFrame} top={0}>
        <Frame width={size.tetrisWidth} height={size.tetrisHeight}>
          {props.tetris(size.tetrisWidth, size.tetrisHeight, size.cubeDistance)}
        </Frame>
      </Section>
    </GamePanel>
  );
};

export default Game;

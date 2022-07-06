import React, { ReactElement } from "react";
import { ScreenSizeContext } from "../../hooks/screenSize";
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
  box-sizing: content-box;
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

const SectionTitle = styled.p<{ lineHeight: number }>`
  line-height: ${(props) => `${props.lineHeight}px`};
  font-size: 32px;
  margin: 0;
`;

export interface IGame {
  // single: boolean;
  tetris: (cubeDistance: number) => ReactElement;
  next: (cubeCount: number, cubeDistance: number) => ReactElement;
}

const Game: React.FC<IGame> = function (props) {
  // const { single } = props;
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
        frameWidth = frameHeight = cubeDistance * frameCubeCount + frameInnerGap * 2 + frameBorderWidth * 2;
        gameWidth =
          tetrisWidth + tetrisBorderWidth * 2 + (frameWidth + frameBorderWidth * 2) + gapBetweenTetrisAndFrame;
        if (
          (frameHeight + frameBorderWidth * 2 + frameTextHeight) * totalFrame +
            gapBetweenFrameAndFrame * (totalFrame - 1) >
          tetrisHeight + tetrisBorderWidth * 2
        ) {
          gameHeight = (frameHeight + frameBorderWidth * 2) * totalFrame + gapBetweenFrameAndFrame * (totalFrame - 1);
        } else {
          gameHeight = tetrisHeight + tetrisBorderWidth * 2;
        }
        if (gameWidth >= screenWidth / 2 || gameHeight >= screenHeight * 0.8) {
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
  }, [screenHeight, screenWidth]);

  return (
    <GamePanel width={size.gameWidth} height={size.gameHeight}>
      <Section left={0} top={0}>
        <SectionTitle lineHeight={size.frameTextHeight}>SCORE</SectionTitle>
        <Frame borderWidth={size.frameBorderWidth} width={size.frameWidth} height={size.frameHeight}></Frame>
      </Section>
      <Section left={0} top={size.frameHeight + size.frameTextHeight + size.gapBetweenTetrisAndFrame}>
        <SectionTitle lineHeight={size.frameTextHeight}>NEXT</SectionTitle>
        <Frame borderWidth={size.frameBorderWidth} width={size.frameWidth} height={size.frameHeight}>
          {props.next(size.frameCubeCount, size.cubeDistance)}
        </Frame>
      </Section>
      <Section left={size.frameWidth + size.frameBorderWidth * 2 + size.gapBetweenTetrisAndFrame} top={0}>
        <Frame borderWidth={size.tetrisBorderWidth} width={size.tetrisWidth} height={size.tetrisHeight}>
          {props.tetris(size.cubeDistance)}
        </Frame>
      </Section>
    </GamePanel>
  );
};

export default Game;

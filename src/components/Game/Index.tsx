import React, { ReactElement } from "react";
import { ScreenSizeContext } from "../../hooks/screenSize";
import style from "./index.module.scss";

export interface IGame {
  single: boolean;
  tetris: (width: number, height: number, cubeDistance: number) => ReactElement;
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
        frameWidth = frameHeight = cubeDistance * 4 + frameInnerGap * 2;
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
    <div
      className={style.game}
      style={{
        width: `${size.gameWidth}px`,
        height: `${size.gameHeight}px`,
      }}
    >
      <div
        className={style.score}
        style={{
          left: `${0}px`,
          top: `${0}px`,
        }}
      >
        <div style={{ lineHeight: `${size.frameTextHeight}px`, fontSize: "32px", margin: 0 }}>SCORE</div>
        <div
          style={{
            width: `${size.frameWidth}px`,
            height: `${size.frameHeight}px`,
          }}
          className={`${style.frame} nes-container is-rounded`}
        ></div>
      </div>
      <div
        className={style.next}
        style={{
          left: `${0}px`,
          top: `${size.frameHeight + size.frameTextHeight + size.gapBetweenTetrisAndFrame}px`,
        }}
      >
        <p style={{ lineHeight: `${size.frameTextHeight}px`, fontSize: "32px", margin: 0 }}>NEXT</p>
        <div
          style={{
            width: `${size.frameWidth}px`,
            height: `${size.frameHeight}px`,
          }}
          className={`${style.frame} nes-container is-rounded`}
        ></div>
      </div>
      <div
        className={`${style.tetris}`}
        style={{
          left: `${size.frameWidth + size.frameBorderWidth * 2 + size.gapBetweenTetrisAndFrame}px`,
          top: `${0}px`,
        }}
      >
        <div
          style={{
            width: `${size.tetrisWidth}px`,
            height: `${size.tetrisHeight}px`,
            borderWidth: `${size.tetrisBorderWidth}px`,
          }}
          className={`${style.frame} nes-container is-rounded`}
        >
          {props.tetris(size.tetrisWidth, size.tetrisHeight, size.cubeDistance)}
        </div>
      </div>
    </div>
  );
};

export default Game;

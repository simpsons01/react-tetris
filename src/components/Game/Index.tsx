import React, { ReactElement } from "react";
import { ScreenSizeContext } from "../../hooks/screenSize";

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
    const gapBetweenTetrisAndFrame = 16;
    const gapBetweenFrameAndFrame = 16;
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
          (frameHeight + frameBorderWidth * 2) * totalFrame + frameInnerGap * (totalFrame - 1) >
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
      gameWidth,
      gameHeight,
      gapBetweenTetrisAndFrame,
      gapBetweenFrameAndFrame,
      cubeDistance,
    };
  }, [screenHeight, screenWidth, single]);

  return (
    <div
      className={`relative`}
      style={{
        width: `${size.gameWidth}px`,
        height: `${size.gameHeight}px`,
      }}
    >
      <div
        className={`absolute border-gray-800 box-content`}
        style={{
          width: `${size.frameWidth}px`,
          height: `${size.frameHeight}px`,
          left: `${0}px`,
          top: `${0}px`,
          borderWidth: `${size.frameBorderWidth}px`,
        }}
      >
        {/* <div
          style={{
            width: `${size.frameWidth}px`,
            height: `${size.frameHeight}px`,
          }}
          className="bg-slate-300"
        ></div> */}
      </div>
      <div
        className={`absolute border-gray-800 box-content`}
        style={{
          width: `${size.frameWidth}px`,
          height: `${size.frameHeight}px`,
          left: `${0}px`,
          top: `${size.frameHeight + size.gapBetweenTetrisAndFrame}px`,
          borderWidth: `${size.frameBorderWidth}px`,
        }}
      >
        {/* <div
          style={{
            width: `${size.frameWidth}px`,
            height: `${size.frameHeight}px`,
          }}
          className="bg-slate-300"
        ></div> */}
      </div>
      <div
        className={`absolute border-gray-800 box-content`}
        style={{
          width: `${size.tetrisWidth}px`,
          height: `${size.tetrisHeight}px`,
          left: `${size.frameWidth + size.frameBorderWidth * 2 + size.gapBetweenTetrisAndFrame}px`,
          top: `${0}px`,
          borderWidth: `${size.tetrisBorderWidth}px`,
        }}
      >
        {props.tetris(size.tetrisWidth, size.tetrisHeight, size.cubeDistance)}
      </div>
    </div>
  );
};

export default Game;

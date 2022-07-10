import React from "react";
import { PER_COL_CUBE_NUM } from "../common/tetris";
import { PER_POLYOMINO_CUBE_NUM } from "../common/polyomino";
import { getKeys } from "../common/utils";
import { ScreenSizeContext } from "./screenSize";
import { PER_ROW_CUBE_NUM } from "../common/tetris";

const MAX_FRAME_TEXT_LENGTH = "score".length;

export enum PLACEMENT {
  LEFT,
  MIDDLE,
  RIGHT,
}

export interface ISection {
  placement: PLACEMENT;
}

export interface IGameConfig {
  score?: ISection;
  next?: ISection;
  countdown?: ISection;
  line?: ISection;
}

const useGameSize = function (config: IGameConfig, isSingle: boolean, ratio: number = 0.8) {
  const { width: screenWidth, height: screenHeight } = React.useContext(ScreenSizeContext);

  const hasRightFrame = React.useMemo(
    () => getKeys(config).some((key) => config[key]?.placement === PLACEMENT.RIGHT),
    [config]
  );
  const hasLeftFrame = React.useMemo(
    () => getKeys(config).some((key) => config[key]?.placement === PLACEMENT.LEFT),
    [config]
  );

  const frameNum = React.useMemo(() => {
    const leftFrameNum = getKeys(config).filter((key) => config[key]?.placement === PLACEMENT.RIGHT).length;
    const rightFrameNum = getKeys(config).filter((key) => config[key]?.placement === PLACEMENT.RIGHT).length;
    return leftFrameNum > rightFrameNum ? leftFrameNum : rightFrameNum;
  }, [config]);

  const size = React.useMemo(() => {
    const frameInnerGap = 5;
    const frameBorderWidth = 4;
    const tetrisBorderWidth = 4;
    const gapBetweenTetrisAndFrame = 40;
    const gapBetweenFrameAndFrame = 16;
    let tetrisHeight = 0,
      tetrisWidth = 0,
      tetrisFrameWidth = 0,
      tetrisFrameHeight = 0,
      frameWidth = 0,
      frameHeight = 0,
      frameFontSize = 0,
      frameLineHeight = 0,
      cubeDistance = 0,
      gameWidth = 0,
      gameHeight = 0;
    for (let i = Math.floor(screenHeight * ratio); i > 0; i--) {
      if (i % PER_POLYOMINO_CUBE_NUM === 0 && i % PER_COL_CUBE_NUM === 0) {
        // tetris size
        tetrisHeight = i;
        tetrisWidth = tetrisHeight / (PER_ROW_CUBE_NUM / PER_COL_CUBE_NUM);
        cubeDistance = tetrisWidth / PER_COL_CUBE_NUM;
        tetrisFrameWidth = tetrisWidth + tetrisBorderWidth * 2;
        tetrisFrameHeight = tetrisHeight + tetrisBorderWidth * 2;
        // frame size
        frameHeight = frameWidth = cubeDistance * PER_POLYOMINO_CUBE_NUM + frameInnerGap * 2 + frameBorderWidth * 2;
        frameFontSize = Math.floor(frameWidth / MAX_FRAME_TEXT_LENGTH);
        frameLineHeight = frameFontSize * 1.5;
        // game size
        gameWidth =
          tetrisFrameWidth +
          (frameWidth + gapBetweenTetrisAndFrame) * [hasLeftFrame, hasRightFrame].filter((x) => x).length;
        if (frameHeight * frameNum + gapBetweenFrameAndFrame * (frameNum - 1) > tetrisFrameHeight) {
          gameHeight = frameHeight * frameNum + gapBetweenFrameAndFrame * (frameNum - 1);
        } else {
          gameHeight = tetrisFrameHeight;
        }
        if (
          gameWidth >= (isSingle ? screenWidth * ratio : (screenWidth / 2) * ratio) ||
          gameHeight >= screenHeight * ratio
        ) {
          continue;
        } else {
          break;
        }
      }
    }
    return {
      // tetris
      tetrisWidth,
      tetrisHeight,
      tetrisFrameWidth,
      tetrisFrameHeight,
      tetrisBorderWidth,
      cubeDistance,
      // frame
      frameWidth,
      frameHeight,
      frameBorderWidth,
      frameFontSize,
      frameLineHeight,
      // game
      gameWidth,
      gameHeight,
      // gap
      gapBetweenTetrisAndFrame,
      gapBetweenFrameAndFrame,
    };
  }, [screenHeight, ratio, hasLeftFrame, hasRightFrame, frameNum, isSingle, screenWidth]);

  return size;
};

export default useGameSize;

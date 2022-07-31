import { ReactNode } from "react";
import styled from "styled-components";
import { IFontSize } from "../../common/utils";
import useGameSize from "../../hooks/gameSize";
import {
  IBaseGame,
  Frame,
  FrameContainer,
  FrameTitle,
  GameContainer,
} from "./Base";

const DoubleGamePanel = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const SelfGame = styled.div`
  width: calc(50% - 2px);
  height: 100%;
  left: 0;
  top: 0;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.div`
  width: 4px;
  position: absolute;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #212529;
`;

const CountDownTimer = styled.div`
  width: 50px;
  height: 50px;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  z-index: 1;
  position: absolute;
  color: #212521;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  font-size: 1.5rem;
`;

const OpponentGame = styled.div`
  width: calc(50% - 2px);
  height: 100%;
  left: calc(50%);
  top: 0;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RoomStateNotifierContainer = styled.div<IFontSize>`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: ${(props) => `${props.fontSize}px`};
`;

interface ISideGame extends IBaseGame {}

export interface IDoubleGame {
  self: ISideGame;
  opponent: ISideGame;
  countdown: () => ReactNode;
  roomStateNotifier: () => ReactNode | null;
}

const DoubleGame = (props: IDoubleGame): JSX.Element => {
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
  } = useGameSize(false, false, 2);

  const roomStateNotifier = props.roomStateNotifier();

  const hasRoomStateNotifier = roomStateNotifier !== null;

  return (
    <DoubleGamePanel>
      <SelfGame>
        <GameContainer width={gameWidth} height={gameHeight}>
          <FrameContainer left={0} top={0}>
            <FrameTitle fontSize={frameFontSize}>SCORE</FrameTitle>
            <Frame
              borderWidth={frameBorderWidth}
              width={frameWidth}
              height={frameHeight}
            >
              {props.self.score(frameFontSize * 2)}
            </Frame>
          </FrameContainer>
          <FrameContainer
            left={0}
            top={frameHeight + frameLineHeight + gapBetweenFrameAndFrame}
          >
            <FrameTitle fontSize={frameFontSize}>NEXT</FrameTitle>
            <Frame
              borderWidth={frameBorderWidth}
              width={frameWidth}
              height={frameHeight}
            >
              {props.self.next(cubeDistance)}
            </Frame>
          </FrameContainer>
          <FrameContainer left={frameWidth + gapBetweenTetrisAndFrame} top={0}>
            <Frame
              borderWidth={tetrisBorderWidth}
              width={tetrisFrameWidth}
              height={tetrisFrameHeight}
            >
              {props.self.tetris(cubeDistance)}
            </Frame>
          </FrameContainer>
        </GameContainer>
      </SelfGame>
      <Divider />
      <CountDownTimer className="nes-container">
        {props.countdown()}
      </CountDownTimer>
      <OpponentGame>
        <GameContainer width={gameWidth} height={gameHeight}>
          <FrameContainer left={0} top={0}>
            <Frame
              borderWidth={tetrisBorderWidth}
              width={tetrisFrameWidth}
              height={tetrisFrameHeight}
            >
              {props.opponent.tetris(cubeDistance)}
            </Frame>
          </FrameContainer>
          <FrameContainer
            left={tetrisFrameWidth + gapBetweenTetrisAndFrame}
            top={0}
          >
            <FrameTitle fontSize={frameFontSize}>SCORE</FrameTitle>
            <Frame
              borderWidth={frameBorderWidth}
              width={frameWidth}
              height={frameHeight}
            >
              {props.opponent.score(frameFontSize * 2)}
            </Frame>
          </FrameContainer>
          <FrameContainer
            left={tetrisFrameWidth + gapBetweenTetrisAndFrame}
            top={frameHeight + frameLineHeight + gapBetweenFrameAndFrame}
          >
            <FrameTitle fontSize={frameFontSize}>NEXT</FrameTitle>
            <Frame
              borderWidth={frameBorderWidth}
              width={frameWidth}
              height={frameHeight}
            >
              {props.opponent.next(cubeDistance)}
            </Frame>
          </FrameContainer>
        </GameContainer>
      </OpponentGame>
      {hasRoomStateNotifier ? (
        <RoomStateNotifierContainer fontSize={frameFontSize * 2}>
          {roomStateNotifier}
        </RoomStateNotifierContainer>
      ) : null}
    </DoubleGamePanel>
  );
};

export default DoubleGame;

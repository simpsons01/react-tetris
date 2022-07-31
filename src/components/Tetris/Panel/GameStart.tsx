import styled from "styled-components";
import { MyFunction, IFontSize } from "../../../common/utils";
import { BasePanel, IPanel } from "./Base";

export interface IGameOverPanel extends IPanel {
  isGameStart: boolean;
  onGameStart: MyFunction;
}

const GameStartBtn = styled.button<IFontSize>`
  font-size: ${(props) => `${props.fontSize}px`};
  margin-top: 16px;
`;

const GameOver = (props: IGameOverPanel): JSX.Element | null => {
  const { fontSize, isGameStart, onGameStart } = props;
  if (!isGameStart) return null;
  return (
    <BasePanel>
      <GameStartBtn
        fontSize={fontSize}
        onClick={onGameStart}
        className="nes-btn"
      >
        START
      </GameStartBtn>
    </BasePanel>
  );
};

export default GameOver;

import styled from "styled-components";
import { MyFunction } from "../../../common/utils";
import { BasePanel, BasePanelText, IPanel, IFontSize } from "./Base";

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
      <BasePanelText fontSize={fontSize}>START</BasePanelText>
      <GameStartBtn fontSize={fontSize} onClick={onGameStart} className="nes-btn">
        TRY AGAIN
      </GameStartBtn>
    </BasePanel>
  );
};

export default GameOver;
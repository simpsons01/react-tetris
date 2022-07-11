import styled from "styled-components";
import { MyFunction } from "../../../common/utils";
import { BasePanel, BasePanelText, IPanel } from "./Base";

const GameOverBtn = styled.button`
  margin-top: 16px;
`;

export interface IGameOverPanel extends IPanel {
  isGameOver: boolean;
  onGameOverBtnClick: MyFunction;
}

const GameOver = (props: IGameOverPanel): JSX.Element | null => {
  const { fontSize, isGameOver, onGameOverBtnClick } = props;
  if (!isGameOver) return null;
  return (
    <BasePanel>
      <BasePanelText fontSize={fontSize}>GAME OVER</BasePanelText>
      <GameOverBtn onClick={onGameOverBtnClick} className="nes-btn">
        TRY AGAIN
      </GameOverBtn>
    </BasePanel>
  );
};

export default GameOver;

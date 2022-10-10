import styled from "styled-components";
import { AnyFunction } from "../../../common/utils";
import { useSizeConfigContext } from "../../../context/sizeConfig";
import Font from "../../Font";
import { BasePanel, IPanel } from "./Base";

const GameOverBtn = styled.button`
  margin-top: 16px;
`;

export interface IGameOverPanel extends IPanel {
  isGameOver: boolean;
  onGameOverBtnClick: AnyFunction;
}

const GameOver = (props: IGameOverPanel): JSX.Element | null => {
  const { isGameOver, onGameOverBtnClick } = props;
  const sizeConfigContext = useSizeConfigContext();
  if (!isGameOver) return null;
  return (
    <BasePanel>
      <Font fontSize={sizeConfigContext.font.level.three} color={"#fff"}>
        GAME OVER
      </Font>
      <GameOverBtn onClick={onGameOverBtnClick} className="nes-btn">
        TRY AGAIN
      </GameOverBtn>
    </BasePanel>
  );
};

export default GameOver;

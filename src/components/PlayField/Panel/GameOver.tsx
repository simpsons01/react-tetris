import type { AnyFunction } from "../../../common/utils";
import type { FC } from "react";
import type { IPanel } from "./Base";
import styled from "styled-components";
import Font from "../../Font";
import { BasePanel } from "./Base";

const GameOverBtn = styled.button`
  margin-top: 16px;
`;

export interface IGameOverPanel extends IPanel {
  isGameOver: boolean;
  onGameOverBtnClick: AnyFunction;
}

const GameOver: FC<IGameOverPanel> = (props) => {
  const { isGameOver, onGameOverBtnClick } = props;
  if (!isGameOver) return null;
  return (
    <BasePanel>
      <Font level={"three"} color={"#fff"}>
        GAME OVER
      </Font>
      <GameOverBtn onClick={onGameOverBtnClick} className="nes-btn">
        TRY AGAIN
      </GameOverBtn>
    </BasePanel>
  );
};

export default GameOver;

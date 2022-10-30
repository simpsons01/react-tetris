import { FC } from "react";
import styled from "styled-components";
import { AnyFunction } from "../../../common/utils";
import Font from "../../Font";
import { BasePanel, IPanel } from "./Base";

export interface IGameOverPanel extends IPanel {
  isGameStart: boolean;
  onGameStart: AnyFunction;
}

const GameStartBtn = styled.button`
  margin-top: 16px;
`;

const GameOver: FC<IGameOverPanel> = (props) => {
  const { isGameStart, onGameStart } = props;
  if (!isGameStart) return null;
  return (
    <BasePanel>
      <GameStartBtn onClick={onGameStart} className="nes-btn">
        <Font level={"three"}>START</Font>
      </GameStartBtn>
    </BasePanel>
  );
};

export default GameOver;

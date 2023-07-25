import type { FC } from "react";
import type { AnyFunction } from "../../../common/utils";
import type { IPanel } from "./Base";
import styled from "styled-components";
import Font from "../../Font";
import { BasePanel } from "./Base";

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

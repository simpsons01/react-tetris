import styled from "styled-components";
import { AnyFunction, IFontSize } from "../../../common/utils";
import { useSizeConfigContext } from "../../../context/sizeConfig";
import { BasePanel, IPanel } from "./Base";

export interface IGameOverPanel extends IPanel {
  isGameStart: boolean;
  onGameStart: AnyFunction;
}

const GameStartBtn = styled.button<IFontSize>`
  font-size: ${(props) => `${props.fontSize}px`};
  margin-top: 16px;
`;

const GameOver = (props: IGameOverPanel): JSX.Element | null => {
  const { isGameStart, onGameStart } = props;
  const sizeConfigContext = useSizeConfigContext();
  if (!isGameStart) return null;
  return (
    <BasePanel>
      <GameStartBtn fontSize={sizeConfigContext.font.level.three} onClick={onGameStart} className="nes-btn">
        START
      </GameStartBtn>
    </BasePanel>
  );
};

export default GameOver;

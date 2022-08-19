import { BasePanel, BasePanelText, IPanel } from "./Base";
import styled from "styled-components";
import { AnyFunction } from "../../../common/utils";

export interface ITimesUp extends IPanel {
  isTimeUp: boolean;
  onTimesUpBtn: AnyFunction;
}

const TimeUpBtn = styled.button`
  margin-top: 16px;
`;

const Pause = (props: ITimesUp): JSX.Element | null => {
  const { fontSize, isTimeUp, onTimesUpBtn } = props;
  if (!isTimeUp) return null;
  return (
    <BasePanel>
      <BasePanelText fontSize={fontSize}>TIME UP</BasePanelText>
      <TimeUpBtn onClick={onTimesUpBtn} className="nes-btn">
        TRY AGAIN
      </TimeUpBtn>
    </BasePanel>
  );
};

export default Pause;

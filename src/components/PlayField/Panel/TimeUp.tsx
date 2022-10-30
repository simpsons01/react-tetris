import { BasePanel, IPanel } from "./Base";
import styled from "styled-components";
import { AnyFunction } from "../../../common/utils";
import Font from "../../Font";
import { FC } from "react";

export interface ITimesUp extends IPanel {
  isTimeUp: boolean;
  onTimesUpBtn: AnyFunction;
}

const TimeUpBtn = styled.button`
  margin-top: 16px;
`;

const Pause: FC<ITimesUp> = (props) => {
  const { isTimeUp, onTimesUpBtn } = props;
  if (!isTimeUp) return null;
  return (
    <BasePanel>
      <Font level={"three"} color={"#fff"}>
        TIME UP
      </Font>
      <TimeUpBtn onClick={onTimesUpBtn} className="nes-btn">
        TRY AGAIN
      </TimeUpBtn>
    </BasePanel>
  );
};

export default Pause;

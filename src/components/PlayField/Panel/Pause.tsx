import { BasePanel, IPanel } from "./Base";
import Font from "../../Font";
import { FC } from "react";
import styled from "styled-components";
import { AnyFunction } from "../../../common/utils";

export interface IPause extends IPanel {
  isPausing: boolean;
  onPauseBtnClick: AnyFunction;
}

const PauseBtn = styled.button`
  margin-top: 16px;
`;

const Pause: FC<IPause> = (props) => {
  const { isPausing, onPauseBtnClick } = props;

  if (!isPausing) return null;
  return (
    <BasePanel>
      <Font level={"three"} color={"#fff"}>
        PAUSE
      </Font>
      <PauseBtn className="nes-btn" onClick={onPauseBtnClick}>
        CONTINUE
      </PauseBtn>
    </BasePanel>
  );
};

export default Pause;

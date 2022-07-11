import styled from "styled-components";
import { IFontSize } from "../../common/utils";

const CountDownPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const CountDownText = styled.p<IFontSize>`
  margin: 0;
  font-size: ${(props) => `${props.fontSize}px`};
`;

export interface ICountDown extends IFontSize {
  sec: number;
}

const CountDown = (props: ICountDown): JSX.Element => {
  const { sec, fontSize } = props;

  return (
    <CountDownPanel>
      <CountDownText fontSize={fontSize}>{sec}</CountDownText>
    </CountDownPanel>
  );
};

export default CountDown;

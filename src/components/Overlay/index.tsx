import styled from "styled-components";
import { IFontSize } from "../../common/utils";

const Container = styled.div<IFontSize & { background?: string }>`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    `${props.background ? props.background : "rgba(0, 0, 0, 0.6)"}`};
  color: #fff;
  font-size: ${(props) => `${props.fontSize}px`};
`;

const Normal = styled.div``;

const NormalWithButton = styled(Normal)`
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    font-size: 16px;
    width: 150px;
    margin-top: 16px;
  }
`;

const Overlay = {
  Container,
  Normal,
  NormalWithButton,
};

export default Overlay;

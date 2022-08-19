import styled, { keyframes, css } from "styled-components";
import { IFontSize } from "../../common/utils";

const Container = styled.div<IFontSize>`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: ${(props) => `${props.fontSize}px`};
`;

const DotWaiting = css`
  &::before {
    content: "";
    display: block;
    position: absolute;
    right: 0;
    bottom: 50%;
    transform: translateX(100%) translateY(50%);
    animation: ${keyframes`
      33% { 
        display: block;
        content: "." 
      }
      66% { 
        display: block;
        content: ".." 
      }
      99% { 
        display: block;
        content: "..." 
      }
    `} 1.5s linear infinite;
  }
`;

const Waiting = styled.div`
  position: relative;
  ${DotWaiting}
`;

const NotifierWithButton = css`
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    font-size: 16px;
    width: 150px;
    margin-top: 16px;
  }
`;

const Ready = styled.div`
  ${NotifierWithButton}

  .waiting {
    position: relative;
    left: -10px;
    ${DotWaiting}
  }
`;

const End = styled.div`
  ${NotifierWithButton}
`;

const Interrupted = styled.div`
  ${NotifierWithButton}
`;

const Error = styled.div`
  ${NotifierWithButton}
`;

const BeforeStart = styled.div``;

export default {
  Container,
  Error,
  BeforeStart,
  Interrupted,
  End,
  Ready,
  Waiting,
};

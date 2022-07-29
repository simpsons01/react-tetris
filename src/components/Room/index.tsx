import styled, { keyframes, css } from "styled-components";

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
  Error,
  BeforeStart,
  Interrupted,
  End,
  Ready,
  Waiting,
};

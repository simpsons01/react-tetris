import styled, { keyframes } from "styled-components";

export default styled.span`
  position: relative;

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

import { Cube } from "./Base";
import styled from "styled-components";

export const SCube = styled(Cube)`
  border: 1px solid #212529;
  background-color: #7e7e7e;

  &:before {
    position: absolute;
    box-sizing: border-box;
    content: "";
    display: block;
    width: 50%;
    height: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 3px solid #212529;
    background-color: #e0e0e0;
  }
`;

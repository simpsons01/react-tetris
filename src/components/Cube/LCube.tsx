import { Cube } from "./Base";
import styled from "styled-components";

export const LCube = styled(Cube)`
  border: 1px solid #212529;
  background-color: #7e7e7e;

  &:before {
    position: absolute;
    box-sizing: border-box;
    content: "";
    display: block;
    width: 12px;
    height: 12px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #212529;
  }
`;

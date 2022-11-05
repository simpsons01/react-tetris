import { Cube } from "./Base";
import styled from "styled-components";

export const OCube = styled(Cube)`
  border: 3px solid #212529;
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
    background-color: #d3d3d3;
    border-width: 3px;
    border-style: solid;
    border-top-color: #fcfcfc;
    border-left-color: #fcfcfc;
    border-right-color: #212529;
    border-bottom-color: #212529;
  }
`;

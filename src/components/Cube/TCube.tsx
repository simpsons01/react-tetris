import { Cube } from "./Base";
import styled from "styled-components";

export const TCube = styled(Cube)`
  border: 1px solid #212529;
  background-color: #7e7e7e;

  &:before {
    position: absolute;
    box-sizing: border-box;
    content: "";
    display: block;
    right: 6px;
    left: 6px;
    top: 6px;
    bottom: 6px;
    background-color: #e0e0e0;
  }
`;

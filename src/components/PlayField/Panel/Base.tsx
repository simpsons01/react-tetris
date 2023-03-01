import styled from "styled-components";

export interface IPanel {}

export const BasePanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  left: -4px;
  top: -4px;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.6);
`;

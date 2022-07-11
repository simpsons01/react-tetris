import styled from "styled-components";
import { IFontSize } from "../../../common/utils";

export interface IPanel extends IFontSize {}

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

export const BasePanelText = styled.p<IPanel>`
  margin: 0;
  font-size: ${(props) => `${props.fontSize}px`};
  color: white;
`;

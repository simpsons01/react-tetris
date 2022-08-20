import { ISize } from "../common/utils/index";
import React from "react";

export interface IScreenSize extends ISize {}

export const ScreenSizeContext = React.createContext<IScreenSize>(
  {} as IScreenSize
);

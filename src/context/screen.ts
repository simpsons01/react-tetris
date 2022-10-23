import { ISize } from "../common/utils";
import { createContext } from "react";

export interface IScreenSize extends ISize {}

export const ScreenSizeContext = createContext<IScreenSize>({} as IScreenSize);

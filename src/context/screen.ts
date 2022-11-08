import { ISize } from "../common/utils";
import { createContext, useContext } from "react";

export interface IScreenSize extends ISize {}

export const ScreenSizeContext = createContext<IScreenSize>({} as IScreenSize);

export const useScreenSizeContext = () => useContext(ScreenSizeContext);

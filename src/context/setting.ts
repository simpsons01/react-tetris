import { createContext, useContext } from "react";
import { ISetting } from "../hooks/setting";

export interface ISettingContext {
  setting: ISetting;
  updateSetting(newSetting: ISetting): void;
}

export const SettingContext = createContext<ISettingContext>({} as ISettingContext);

export const useSettingContext = () => useContext(SettingContext);

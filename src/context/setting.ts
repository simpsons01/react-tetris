import { createContext, MutableRefObject, useContext } from "react";
import { ISetting } from "../hooks/setting";

export interface ISettingContext {
  settingRef: MutableRefObject<ISetting>;
  saveSetting(setting: ISetting): void;
}

export const SettingContext = createContext<ISettingContext>({} as ISettingContext);

export const useSettingContext = () => useContext(SettingContext);

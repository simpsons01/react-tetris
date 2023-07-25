import type { ISetting } from "../utils/setting";
import { createContext, useContext, SetStateAction, Dispatch } from "react";

export interface ISettingContext {
  setting: ISetting;
  setSetting: Dispatch<SetStateAction<ISetting>>;
  saveSetting(setting: ISetting): void;
}

export const SettingContext = createContext<ISettingContext>({} as ISettingContext);

export const useSettingContext = () => useContext(SettingContext);
